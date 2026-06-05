#!/usr/bin/env bash
set -eu
ROOT="${LINESTACK_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

if [[ -f "$ROOT/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.deploy"
  set +a
fi
export LINESTACK_ROOT="$ROOT"

if ! command -v forge >/dev/null 2>&1; then
  echo "Installing Foundry..."
  curl -L https://foundry.paradigm.xyz | bash
  export PATH="$HOME/.foundry/bin:$PATH"
  foundryup
fi
export PATH="$HOME/.foundry/bin:$PATH"

echo "Compiling contracts..."
cd "$ROOT/contracts"
forge build
mkdir -p "$ROOT/contracts/out"

for name in LineStackDatasetRegistry LineStackTemplateRegistry LineStackPublisherWriteCondition LineStackBuyerReadCondition LineStackMerkleAllowlistReadCondition; do
  forge_out="out/${name}.sol/${name}.json"
  if [[ ! -f "$forge_out" ]]; then
    echo "Missing $forge_out"
    exit 1
  fi
  node -e "
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('$forge_out','utf8'));
const bc=j.bytecode?.object||j.bytecode;
fs.writeFileSync('$ROOT/contracts/out/${name}.json', JSON.stringify({
  contractName:'${name}',
  abi:j.abi,
  bytecode: bc.startsWith('0x')?bc:'0x'+bc
},null,2));
"
  echo "Exported ${name}"
done

echo "Deploying to Aeneid..."
cd "$ROOT"
if [[ ! -d node_modules/viem ]]; then
  npm init -y >/dev/null 2>&1 || true
  npm install viem@2 --silent
fi
export LINESTACK_ROOT="$ROOT"
node scripts/deploy-linestack-contracts.mjs
echo "Done. See contracts/deployed.aeneid.json"
