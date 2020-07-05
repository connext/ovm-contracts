#!/usr/bin/env bash
set -e

# The packages needed from ovm
packages="core-utils,core-db,optimistic-game-semantics,ovm-truffle-provider-wrapper,state-synchronizer,rollup-contracts,rollup-core,rollup-dev-tools,rollup-full-node,solc-transpiler"

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
project="@eth-optimism"


echo "Unlinking packages"

for package in `echo $packages | tr ',' ' '`
do
  echo
  echo "Dealing w package: $package"

  npm unlink "@eth-optimism/${package}"
  echo "Unlinked"
done