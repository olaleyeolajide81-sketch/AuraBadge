# AuraBadge ✨

A gamified Discord/DAO "Live Status" Profile NFT on Stellar. Community members mint a single dynamic NFT (dNFT) that reflects their current activity level, role, and vibe — updated in real-time from off-chain stats.

## Features

- **Dynamic NFT** — on-chain badge level computed from messages sent + governance votes cast
- **Multi-wallet support** — Freighter, xBull, Albedo
- **Live status dashboard** — side-by-side comparison of live off-chain stats vs on-chain state
- **One-click sync** — update your badge on-chain with a single transaction
- **3 error types handled** — WalletError, ContractError, NetworkError
- **Transaction visibility** — pending/success/error states with Stellar Explorer links

## Tech Stack

| Layer | Tech |
|---|---|
| Smart contract | Rust + Soroban SDK 20 (Stellar Testnet) |
| Frontend | React 18 + react-scripts |
| Wallet | @stellar/freighter-api |
| Chain RPC | @stellar/stellar-sdk (SorobanRpc) |
| Metadata | IPFS CID stored on-chain |

## Project Structure

```
AuraBadge/
├── contract/               # Soroban smart contract
│   ├── Cargo.toml
│   └── src/lib.rs          # mint, update, get_badge, get_level
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.jsx         # Main app orchestration
│   │   ├── App.css         # Dark theme styles
│   │   ├── config.js       # Network + contract config
│   │   ├── errors.js       # WalletError / ContractError / NetworkError
│   │   ├── wallet.js       # Multi-wallet connect + sign
│   │   ├── contract.js     # Soroban contract calls
│   │   ├── hooks/
│   │   │   ├── useBadge.js         # Fetch on-chain badge
│   │   │   └── useOffChainStats.js # Simulated live stats
│   │   └── components/
│   │       ├── WalletConnect.jsx   # Wallet selection UI
│   │       ├── BadgeCard.jsx       # Badge display + mint form
│   │       ├── StatusComparison.jsx # Live vs on-chain diff
│   │       └── TxStatus.jsx        # Transaction status bar
│   ├── package.json
│   └── .env.example
└── scripts/
    └── deploy.sh           # Build + deploy contract to testnet
```

## Prerequisites

- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (`stellar`)
- [Node.js](https://nodejs.org/) >= 18
- [Freighter wallet](https://www.freighter.app/) browser extension (for testnet)

Install Rust WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd AuraBadge
```

### 2. Deploy the smart contract to Stellar Testnet

```bash
# Fund a testnet account first
stellar keys generate default --network testnet
stellar keys fund default --network testnet

# Build and deploy
cd contract
cargo build --target wasm32-unknown-unknown --release

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/aura_badge.wasm \
  --source-account default \
  --network testnet
```

Copy the output contract ID (starts with `C...`).

Or use the convenience script:
```bash
bash scripts/deploy.sh
```

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and paste your contract ID:
```
REACT_APP_CONTRACT_ID=C...your_contract_id
```

### 4. Install dependencies and run

```bash
npm install
npm start
```

App runs at `http://localhost:3000`.

## Usage

1. Open the app and click **Freighter** to connect your wallet (set Freighter to Testnet mode)
2. Click **Mint Badge** — enter a role (e.g. `member`) and an IPFS CID for your metadata
3. Watch your **Live Stats** accumulate every 5 seconds (simulated off-chain activity)
4. When live stats exceed your on-chain state, click **Update Badge** to sync on-chain
5. Track your transaction in the status bar — click the hash to view on Stellar Explorer

## Badge Levels

| Level | Emoji | Score (messages + votes×2) |
|---|---|---|
| 1 | 🌱 | 0–9 |
| 2 | 🔥 | 10–49 |
| 3 | ⚡ | 50–199 |
| 4 | 🌟 | 200–999 |
| 5 | 👑 | 1000+ |

## Smart Contract Interface

```
mint(owner: Address, role: Symbol, ipfs_cid: String)
update(owner: Address, messages_count: u64, votes_count: u64, ipfs_cid: String)
get_badge(owner: Address) -> BadgeMetadata
get_level(messages: u64, votes: u64) -> u32
```

Errors: `NotFound (1)`, `AlreadyMinted (2)`, `Unauthorized (3)`

## Error Handling

| Type | When |
|---|---|
| `WalletError` | Wallet not found, connection refused, signing rejected |
| `ContractError` | Badge not found, already minted, unauthorized caller |
| `NetworkError` | RPC timeout, server error, transaction submission failure |

## Adding xBull / Albedo

The wallet module stubs are in `frontend/src/wallet.js`. To enable:
- **xBull**: `npm install @xbull/sdk` and implement the `xbull` branch
- **Albedo**: `npm install albedo-link` and implement the `albedo` branch

## Testnet Resources

- [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Soroban Testnet RPC](https://soroban-testnet.stellar.org)
- [Freighter Wallet](https://www.freighter.app/)
