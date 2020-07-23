#!/bin/bash
set -e

cwd="`pwd`"

address_book="${ADDRESS_BOOK:-$cwd/address-book.json}"

eth_provider="${ETH_PROVIDER:-http://localhost:8545}"

mnemonic="${MNEMONIC:-candy maple cake sugar pudding cream honey rich smooth crumble sweet treat}"

if [[ -z "$address_book" ]]
then touch $address_book
fi

echo "Contract migration entrypoint activated with:"
echo "    - address_book:" "$address_book"
echo "    - eth_provider:" "$eth_provider"
echo "    - mnemonic:" "$mnemonic"

echo "Deploying contracts.."
node dist/src.ts/cli.js migrate \
  --address-book "$address_book" \
  --eth-provider "$eth_provider" \
  --mnemonic "$mnemonic"

echo "Deploying testnet token.."
node dist/src.ts/cli.js new-token \
  --address-book "$address_book" \
  --eth-provider "$eth_provider" \
  --mnemonic "$mnemonic"
