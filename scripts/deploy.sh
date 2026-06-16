#!/bin/bash
# Deploy AuraBadge contract to Stellar Testnet
set -e
echo 'Building contract...'
cd contract
cargo build --target wasm32-unknown-unknown --release
echo 'Deploying to testnet...'
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/aura_badge.wasm \
  --source-account default \
  --network testnet
