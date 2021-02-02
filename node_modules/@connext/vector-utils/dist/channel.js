"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipant = exports.getBalanceForAssetId = exports.hashChannelCommitment = exports.hashCoreChannelState = exports.encodeCoreChannelState = exports.hashBalances = exports.hashBalance = void 0;
const vector_types_1 = require("@connext/vector-types");
const abi_1 = require("@ethersproject/abi");
const address_1 = require("@ethersproject/address");
const solidity_1 = require("@ethersproject/solidity");
exports.hashBalance = (balance) => solidity_1.keccak256(["bytes32", "bytes32"], [solidity_1.keccak256(["uint256[]"], [balance.amount]), solidity_1.keccak256(["address[]"], [balance.to])]);
exports.hashBalances = (balances) => solidity_1.keccak256(["bytes32[]"], [balances.map(exports.hashBalance)]);
exports.encodeCoreChannelState = (state) => abi_1.defaultAbiCoder.encode([vector_types_1.CoreChannelStateEncoding], [state]);
exports.hashCoreChannelState = (state) => solidity_1.keccak256(["bytes"], [exports.encodeCoreChannelState(state)]);
exports.hashChannelCommitment = (state) => solidity_1.keccak256(["bytes"], [abi_1.defaultAbiCoder.encode(["uint8", "bytes32"], [vector_types_1.ChannelCommitmentTypes.ChannelState, exports.hashCoreChannelState(state)])]);
exports.getBalanceForAssetId = (channel, assetId, participant) => {
    const assetIdx = channel.assetIds.findIndex((a) => address_1.getAddress(a) === address_1.getAddress(assetId));
    if (assetIdx === -1) {
        return "0";
    }
    return channel.balances[assetIdx].amount[participant === "alice" ? 0 : 1];
};
exports.getParticipant = (channel, publicIdentifier) => {
    const iAmAlice = publicIdentifier.toLowerCase() === channel.aliceIdentifier.toLowerCase();
    if (!iAmAlice && publicIdentifier.toLowerCase() !== channel.bobIdentifier.toLowerCase()) {
        return undefined;
    }
    return iAmAlice ? "alice" : "bob";
};
//# sourceMappingURL=channel.js.map