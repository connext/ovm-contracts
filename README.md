# ovm-contracts

Smart contracts that power a Counterfactual State Channel platform, modified for the ovm.

Find documentation at [https://docs.connext.network/](https://docs.connext.network/).

Modifications include:

- Using solidity v0.5 compiler
- Using `block.timestamp` instead of `block.number` (NOTE: `block.timestamp` is also not implemented, so the HashlockTransferApp was removed)
- Adjustments for not having native ETH
- Reverting contract infra to use waffle instead of buidler

See more about the ovm [here](https://docs.optimism.io/).
