#!/usr/bin/env bash
set -e

# The packages needed from ovm
packages="core-utils,core-db,optimistic-game-semantics,ovm-truffle-provider-wrapper,state-synchronizer,rollup-contracts,rollup-core,rollup-dev-tools,rollup-full-node,solc-transpiler"

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
project="@eth-optimism"
nickname=".optimism"

dep_dir="${dir}/../${nickname}/"

if [[ ! -d "${dep_dir}" ]]
then
  echo "Cloning optimism monorepo"
  echo "${dep_dir}"
  git clone https://github.com/ethereum-optimism/optimism-monorepo.git ${nickname}
fi

cd "${dep_dir}"

echo "Updating to latest"
git fetch origin
git reset --hard origin/master

echo "Building optimism"
rm -rf yarn.lock
npm install && npm run build

echo "Installed dependencies, linking packages"

for package in `echo $packages | tr ',' ' '`
do
  echo
  echo "Dealing w package: $package"

  echo "Linking package"
  cd "packages/$package"
  npm link
  echo "Linked"

  cd ../..
  echo
done

cd ../

for package in `echo $packages | tr ',' ' '`
do
  echo
  echo "Dealing w package: $package"

  npm link "@eth-optimism/${package}"
  echo "Linked"
done