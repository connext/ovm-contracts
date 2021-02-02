"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawCommitment = void 0;
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const constants_1 = require("@ethersproject/constants");
const abi_1 = require("@ethersproject/abi");
const solidity_1 = require("@ethersproject/solidity");
const artifacts_1 = require("../artifacts");
class WithdrawCommitment {
    constructor(channelAddress, alice, bob, recipient, assetId, amount, nonce, callTo = constants_1.AddressZero, callData = "0x") {
        this.channelAddress = channelAddress;
        this.alice = alice;
        this.bob = bob;
        this.recipient = recipient;
        this.assetId = assetId;
        this.amount = amount;
        this.nonce = nonce;
        this.callTo = callTo;
        this.callData = callData;
    }
    get signatures() {
        const sigs = [];
        if (this.aliceSignature) {
            sigs.push(this.aliceSignature);
        }
        if (this.bobSignature) {
            sigs.push(this.bobSignature);
        }
        return sigs;
    }
    toJson() {
        return {
            aliceSignature: this.aliceSignature,
            bobSignature: this.bobSignature,
            channelAddress: this.channelAddress,
            alice: this.alice,
            bob: this.bob,
            recipient: this.recipient,
            assetId: this.assetId,
            amount: this.amount,
            nonce: this.nonce,
            callTo: this.callTo,
            callData: this.callData,
        };
    }
    static async fromJson(json) {
        const commitment = new WithdrawCommitment(json.channelAddress, json.alice, json.bob, json.recipient, json.assetId, json.amount, json.nonce, json.callTo, json.callData);
        if (json.aliceSignature || json.bobSignature) {
            await commitment.addSignatures(json.aliceSignature, json.bobSignature);
        }
        return commitment;
    }
    getCallData() {
        return { to: this.callTo, data: this.callData };
    }
    getWithdrawData() {
        return [this.channelAddress, this.assetId, this.recipient, this.amount, this.nonce, this.callTo, this.callData];
    }
    hashToSign() {
        const encodedWithdrawData = abi_1.defaultAbiCoder.encode([vector_types_1.WithdrawDataEncoding], [this.getWithdrawData()]);
        const wdHash = solidity_1.keccak256(["bytes"], [encodedWithdrawData]);
        const encoded = abi_1.defaultAbiCoder.encode(["uint8", "bytes32"], [vector_types_1.ChannelCommitmentTypes.WithdrawData, wdHash]);
        return solidity_1.keccak256(["bytes"], [encoded]);
    }
    getSignedTransaction() {
        if (!this.signatures || this.signatures.length === 0) {
            throw new Error(`No signatures detected`);
        }
        const data = new abi_1.Interface(artifacts_1.ChannelMastercopy.abi).encodeFunctionData("withdraw", [
            this.getWithdrawData(),
            this.aliceSignature,
            this.bobSignature,
        ]);
        return { to: this.channelAddress, value: 0, data: data };
    }
    async addSignatures(signature1, signature2) {
        const hash = this.hashToSign();
        for (const sig of [signature1, signature2]) {
            if (!sig) {
                continue;
            }
            let recovered;
            try {
                recovered = await vector_utils_1.recoverAddressFromChannelMessage(hash, sig);
            }
            catch (e) {
                recovered = e.message;
            }
            if (recovered !== this.alice && recovered !== this.bob) {
                throw new Error(`Invalid signer detected. Got ${recovered}, expected one of: ${this.alice} / ${this.bob}`);
            }
            this.aliceSignature = recovered === this.alice ? sig : this.aliceSignature;
            this.bobSignature = recovered === this.bob ? sig : this.bobSignature;
        }
    }
}
exports.WithdrawCommitment = WithdrawCommitment;
//# sourceMappingURL=withdraw.js.map