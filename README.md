# ovm-contracts

Smart contracts that power a Counterfactual State Channel platform, modified for the ovm.

Find documentation at [https://docs.connext.network/](https://docs.connext.network/).

Modifications include:

- Using solidity v0.5 compiler
- Using `block.timestamp` instead of `block.number` (NOTE: `block.timestamp` is also not implemented, so the `HashlockTransferApp`, adjudicator contracts, and `TimeLockPassThrough` were removed)
- Adjustments for not having native ETH
- Reverting contract infra to use waffle instead of buidler

See more about the ovm [here](https://docs.optimism.io/).

## Setup

Install all dependencies and build sources:

```bash
npm run install

# If running using OVM
npm run build

# If running using EVM
npm run build:evm
```

To make sure the contracts built successfully, you can run the tests:

```bash
# If running using OVM
npm run test

# If running using EVM
npm run test:evm
```

## Usage

First, start the ovm chain locally (must use monorepo) in a separate terminal window:

```bash
git clone https://github.com/ethereum-optimism/optimism-monorepo.git ovm
cd ovm
yarn install && yarn build # takes a while
cd packages/rollup-full-node

# This will start an ovm node on localhost:8545 with debug logs
L1_SEQUENCER_MNEMONIC="candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" yarn server:fullnode-test:debug
```

Make sure your source is built, then deploy the contracts using:

```bash
bash ops/deploy.sh # defaults to correct local values
```

You now have the contracts deployed on a local ovm chain that is accessible at "http://localhost:8545"
