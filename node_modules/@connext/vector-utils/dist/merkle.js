"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMerkleTreeData = void 0;
const constants_1 = require("@ethersproject/constants");
const keccak256_1 = require("@ethersproject/keccak256");
const merkletreejs_1 = require("merkletreejs");
const crypto_1 = require("./crypto");
const transfers_1 = require("./transfers");
exports.generateMerkleTreeData = (transfers, toProve) => {
    const sorted = transfers.sort((a, b) => a.transferId.localeCompare(b.transferId));
    const leaves = sorted.map((transfer) => {
        return crypto_1.bufferify(transfers_1.hashCoreTransferState(transfer));
    });
    const tree = new merkletreejs_1.MerkleTree(leaves, keccak256_1.keccak256);
    const proof = toProve ? tree.getHexProof(crypto_1.bufferify(transfers_1.hashCoreTransferState(toProve))) : undefined;
    const calculated = tree.getHexRoot();
    return {
        root: calculated === "0x" ? constants_1.HashZero : calculated,
        proof,
    };
};
//# sourceMappingURL=merkle.js.map