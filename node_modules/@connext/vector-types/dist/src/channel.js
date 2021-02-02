import { BalanceEncoding } from "./contracts";
import { tidy } from "./utils";
export const UpdateType = {
    create: "create",
    deposit: "deposit",
    resolve: "resolve",
    setup: "setup",
};
export var ChannelCommitmentTypes;
(function (ChannelCommitmentTypes) {
    ChannelCommitmentTypes[ChannelCommitmentTypes["ChannelState"] = 0] = "ChannelState";
    ChannelCommitmentTypes[ChannelCommitmentTypes["WithdrawData"] = 1] = "WithdrawData";
})(ChannelCommitmentTypes || (ChannelCommitmentTypes = {}));
export const CoreChannelStateEncoding = tidy(`tuple(
  address channelAddress,
  address alice,
  address bob,
  address[] assetIds,
  ${BalanceEncoding}[] balances,
  uint256[] processedDepositsA,
  uint256[] processedDepositsB,
  uint256[] defundNonces,
  uint256 timeout,
  uint256 nonce,
  bytes32 merkleRoot
)`);
export const CoreTransferStateEncoding = tidy(`tuple(
  address channelAddress,
  bytes32 transferId,
  address transferDefinition,
  address initiator,
  address responder,
  address assetId,
  ${BalanceEncoding} balance,
  uint256 transferTimeout,
  bytes32 initialStateHash
)`);
//# sourceMappingURL=channel.js.map