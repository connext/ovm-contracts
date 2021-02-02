"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const keccak256_1 = require("@ethersproject/keccak256");
const units_1 = require("@ethersproject/units");
const hardhat_1 = require("hardhat");
const merkletreejs_1 = require("merkletreejs");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
const getOnchainBalance = async (assetId, address) => {
    return assetId === constants_1.AddressZero
        ? constants_2.provider.getBalance(address)
        : new contracts_1.Contract(assetId, (await hardhat_1.deployments.getArtifact("TestToken")).abi, constants_2.provider).balanceOf(address);
};
describe("CMCAdjudicator.sol", async function () {
    this.timeout(120000);
    const nonAutomining = constants_2.networkName !== "hardhat";
    let channel;
    let token;
    let transferDefinition;
    let channelState;
    let transferState;
    let aliceSignature;
    let bobSignature;
    const aliceSigner = new vector_utils_1.ChannelSigner(constants_2.alice.privateKey, constants_2.provider);
    const bobSigner = new vector_utils_1.ChannelSigner(constants_2.bob.privateKey, constants_2.provider);
    const verifyChannelDispute = async (ccs, disputeBlockNumber) => {
        const { timestamp } = await constants_2.provider.getBlock(disputeBlockNumber);
        const dispute = await channel.getChannelDispute();
        vector_utils_1.expect(dispute.channelStateHash).to.be.eq(vector_utils_1.hashCoreChannelState(ccs));
        vector_utils_1.expect(dispute.nonce).to.be.eq(ccs.nonce);
        vector_utils_1.expect(dispute.merkleRoot).to.be.eq(ccs.merkleRoot);
        vector_utils_1.expect(dispute.consensusExpiry).to.be.eq(bignumber_1.BigNumber.from(ccs.timeout).add(timestamp));
        vector_utils_1.expect(dispute.defundExpiry).to.be.eq(bignumber_1.BigNumber.from(ccs.timeout).mul(2).add(timestamp));
        await Promise.all(ccs.assetIds.map(async (assetId, idx) => {
            const defundNonce = await channel.getDefundNonce(assetId);
            vector_utils_1.expect(defundNonce).to.be.eq(bignumber_1.BigNumber.from(ccs.defundNonces[idx]).sub(1));
        }));
    };
    const verifyTransferDispute = async (cts, disputeBlockNumber) => {
        const { timestamp } = await constants_2.provider.getBlock(disputeBlockNumber);
        const transferDispute = await channel.getTransferDispute(cts.transferId);
        vector_utils_1.expect(transferDispute.transferStateHash).to.be.eq(vector_utils_1.hashCoreTransferState(cts));
        vector_utils_1.expect(transferDispute.isDefunded).to.be.false;
        vector_utils_1.expect(transferDispute.transferDisputeExpiry).to.be.eq(bignumber_1.BigNumber.from(timestamp).add(cts.transferTimeout));
    };
    const fundChannel = async (ccs = channelState) => {
        for (const assetId of ccs.assetIds) {
            const idx = ccs.assetIds.findIndex((a) => a === assetId);
            const depositsB = bignumber_1.BigNumber.from(ccs.processedDepositsB[idx]);
            if (!depositsB.isZero()) {
                const bobTx = assetId === constants_1.AddressZero
                    ? await constants_2.bob.sendTransaction({ to: channel.address, value: depositsB })
                    : await token.connect(constants_2.bob).transfer(channel.address, depositsB);
                await bobTx.wait();
            }
            const depositsA = bignumber_1.BigNumber.from(ccs.processedDepositsA[idx]);
            if (!depositsA.isZero()) {
                const aliceTx = await channel.connect(constants_2.alice).depositAlice(assetId, depositsA);
                await aliceTx.wait();
            }
        }
    };
    const disputeChannel = async (ccs = channelState) => {
        const hash = vector_utils_1.hashChannelCommitment(ccs);
        const tx = await channel.disputeChannel(ccs, await aliceSigner.signMessage(hash), await bobSigner.signMessage(hash));
        const { blockNumber: disputeBlock } = await tx.wait();
        const { timestamp } = await constants_2.provider.getBlock(disputeBlock);
        await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(ccs.timeout).toNumber());
        const currBlock = await constants_2.provider.getBlock("latest");
        vector_utils_1.expect(currBlock.timestamp).to.be.at.least(bignumber_1.BigNumber.from(timestamp).add(ccs.timeout));
        const defundTimeout = bignumber_1.BigNumber.from(ccs.timeout).mul(2);
        vector_utils_1.expect(defundTimeout.add(timestamp).gt(currBlock.timestamp)).to.be.true;
    };
    const getMerkleProof = (cts = transferState) => {
        const { proof } = vector_utils_1.generateMerkleTreeData([cts], cts);
        return proof;
    };
    const disputeTransfer = async (cts = transferState) => {
        await (await channel.disputeTransfer(cts, getMerkleProof(cts))).wait();
    };
    const defundChannelAndVerify = async (ccs = channelState, unprocessedAlice = [], unprocessedBob = [], defundedAssets = ccs.assetIds, indices = []) => {
        const assetIds = defundedAssets.length > ccs.assetIds.length ? defundedAssets : ccs.assetIds;
        const preDefundAlice = await Promise.all(assetIds.map((assetId) => getOnchainBalance(assetId, constants_2.alice.address)));
        const preDefundBob = await Promise.all(assetIds.map((assetId) => getOnchainBalance(assetId, constants_2.bob.address)));
        await (await channel.defundChannel(ccs, defundedAssets, indices)).wait();
        for (let i = 0; i < assetIds.length; i++) {
            const assetId = assetIds[i];
            if ((await channel.getExitableAmount(assetId, constants_2.alice.address)).gt(constants_1.Zero)) {
                await (await channel.exit(assetId, constants_2.alice.address, constants_2.alice.address)).wait();
            }
            if ((await channel.getExitableAmount(assetId, constants_2.bob.address)).gt(constants_1.Zero)) {
                await (await channel.exit(assetId, constants_2.bob.address, constants_2.bob.address)).wait();
            }
        }
        const postDefundAlice = await Promise.all(assetIds.map((assetId) => getOnchainBalance(assetId, constants_2.alice.address)));
        const postDefundBob = await Promise.all(assetIds.map((assetId) => getOnchainBalance(assetId, constants_2.bob.address)));
        await Promise.all(assetIds.map(async (assetId) => {
            var _a, _b, _c, _d;
            const defunded = defundedAssets.includes(assetId);
            const inChannel = ccs.assetIds.includes(assetId);
            const idx = inChannel
                ? ccs.assetIds.findIndex((a) => a === assetId)
                : assetIds.findIndex((a) => a === assetId);
            const defundNonce = await channel.getDefundNonce(assetId);
            if (defunded && inChannel) {
                vector_utils_1.expect(bignumber_1.BigNumber.from(ccs.defundNonces[idx])).to.be.eq(defundNonce);
            }
            else if (!defunded) {
                vector_utils_1.expect(defundNonce).to.be.eq(bignumber_1.BigNumber.from(ccs.defundNonces[idx]).sub(1));
            }
            else if (!inChannel && defunded) {
                vector_utils_1.expect(defundNonce).to.be.eq(1);
            }
            const diffAlice = postDefundAlice[idx].sub(preDefundAlice[idx]);
            const diffBob = postDefundBob[idx].sub(preDefundBob[idx]);
            if (inChannel) {
                vector_utils_1.expect(diffAlice).to.be.eq(defunded ? bignumber_1.BigNumber.from(ccs.balances[idx].amount[0]).add((_a = unprocessedAlice[idx]) !== null && _a !== void 0 ? _a : "0") : 0);
                vector_utils_1.expect(diffBob).to.be.eq(defunded ? bignumber_1.BigNumber.from(ccs.balances[idx].amount[1]).add((_b = unprocessedBob[idx]) !== null && _b !== void 0 ? _b : "0") : 0);
            }
            else {
                vector_utils_1.expect(diffAlice).to.be.eq((_c = unprocessedAlice[idx]) !== null && _c !== void 0 ? _c : "0");
                vector_utils_1.expect(diffBob).to.be.eq((_d = unprocessedBob[idx]) !== null && _d !== void 0 ? _d : "0");
            }
        }));
    };
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        token = await utils_1.getContract("TestToken", constants_2.alice);
        transferDefinition = await utils_1.getContract("HashlockTransfer", constants_2.alice);
        await (await token.mint(constants_2.alice.address, units_1.parseEther("1"))).wait();
        await (await token.mint(constants_2.bob.address, units_1.parseEther("1"))).wait();
        channel = await utils_1.createChannel(constants_2.alice.address, constants_2.bob.address, constants_2.defaultLogLevel, "true");
        const preImage = vector_utils_1.getRandomBytes32();
        const state = {
            lockHash: vector_utils_1.createlockHash(preImage),
            expiry: "0",
        };
        transferState = vector_utils_1.createTestFullHashlockTransferState({
            initiator: constants_2.alice.address,
            responder: constants_2.bob.address,
            transferDefinition: transferDefinition.address,
            assetId: constants_1.AddressZero,
            channelAddress: channel.address,
            balance: { to: [constants_2.alice.address, vector_utils_1.getRandomAddress()], amount: ["7", "0"] },
            transferState: state,
            transferResolver: { preImage },
            transferTimeout: "3",
            initialStateHash: vector_utils_1.hashTransferState(state, vector_types_1.HashlockTransferStateEncoding),
        });
        channelState = vector_utils_1.createTestChannelStateWithSigners([aliceSigner, bobSigner], "create", {
            channelAddress: channel.address,
            assetIds: [constants_1.AddressZero],
            balances: [{ to: [constants_2.alice.address, constants_2.bob.address], amount: ["17", "45"] }],
            processedDepositsA: ["0"],
            processedDepositsB: ["62"],
            timeout: "20",
            nonce: 3,
            merkleRoot: new merkletreejs_1.MerkleTree([vector_utils_1.hashCoreTransferState(transferState)], keccak256_1.keccak256).getHexRoot(),
        });
        const channelHash = vector_utils_1.hashChannelCommitment(channelState);
        aliceSignature = await aliceSigner.signMessage(channelHash);
        bobSignature = await bobSigner.signMessage(channelHash);
        channel = channel.connect(constants_2.rando);
    });
    describe("disputeChannel", () => {
        it("should fail if state.alice is incorrect", async function () {
            await vector_utils_1.expect(channel.disputeChannel(Object.assign(Object.assign({}, channelState), { alice: vector_utils_1.getRandomAddress() }), aliceSignature, bobSignature)).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if state.bob is incorrect", async function () {
            await vector_utils_1.expect(channel.disputeChannel(Object.assign(Object.assign({}, channelState), { bob: vector_utils_1.getRandomAddress() }), aliceSignature, bobSignature)).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if state.channelAddress is incorrect", async function () {
            await vector_utils_1.expect(channel.disputeChannel(Object.assign(Object.assign({}, channelState), { channelAddress: vector_utils_1.getRandomAddress() }), aliceSignature, bobSignature)).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if alices signature is invalid", async function () {
            await vector_utils_1.expect(channel.disputeChannel(channelState, await aliceSigner.signMessage(vector_utils_1.getRandomBytes32()), bobSignature)).revertedWith("CMCAdjudicator: INVALID_ALICE_SIG");
        });
        it("should fail if bobs signature is invalid", async function () {
            await vector_utils_1.expect(channel.disputeChannel(channelState, aliceSignature, await bobSigner.signMessage(vector_utils_1.getRandomBytes32()))).revertedWith("CMCAdjudicator: INVALID_BOB_SIG");
        });
        it("should fail if channel is not in consensus phase", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const shortTimeout = Object.assign(Object.assign({}, channelState), { timeout: "10" });
            const hash = vector_utils_1.hashChannelCommitment(shortTimeout);
            const tx = await channel.disputeChannel(shortTimeout, await aliceSigner.signMessage(hash), await bobSigner.signMessage(hash));
            const { blockNumber } = await tx.wait();
            await verifyChannelDispute(shortTimeout, blockNumber);
            await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(shortTimeout.timeout).toNumber() + 1);
            const nextState = Object.assign(Object.assign({}, shortTimeout), { nonce: channelState.nonce + 1 });
            const hash2 = vector_utils_1.hashChannelCommitment(nextState);
            await vector_utils_1.expect(channel.disputeChannel(nextState, await aliceSigner.signMessage(hash2), await bobSigner.signMessage(hash2))).revertedWith("CMCAdjudicator: INVALID_PHASE");
        });
        it("should fail if nonce is lte stored nonce", async () => {
            const tx = await channel.disputeChannel(channelState, aliceSignature, bobSignature);
            const { blockNumber } = await tx.wait();
            await verifyChannelDispute(channelState, blockNumber);
            await vector_utils_1.expect(channel.disputeChannel(channelState, aliceSignature, bobSignature)).revertedWith("CMCAdjudicator: INVALID_NONCE");
        });
        it("should work for a newly initiated dispute (and store expiries)", async () => {
            const tx = await channel.disputeChannel(channelState, aliceSignature, bobSignature);
            const { blockNumber } = await tx.wait();
            await verifyChannelDispute(channelState, blockNumber);
        });
        it("should work when advancing dispute (does not update expiries)", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const tx = await channel.disputeChannel(channelState, aliceSignature, bobSignature);
            const { blockNumber } = await tx.wait();
            await verifyChannelDispute(channelState, blockNumber);
            const newState = Object.assign(Object.assign({}, channelState), { nonce: channelState.nonce + 1 });
            const hash = vector_utils_1.hashChannelCommitment(newState);
            const tx2 = await channel.disputeChannel(newState, await aliceSigner.signMessage(hash), await bobSigner.signMessage(hash));
            await tx2.wait();
            await verifyChannelDispute(newState, blockNumber);
        });
    });
    describe("defundChannel", () => {
        it("should fail if state.alice is incorrect", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.defundChannel(Object.assign(Object.assign({}, channelState), { alice: vector_utils_1.getRandomAddress() }), channelState.assetIds, [])).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if state.bob is incorrect", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.defundChannel(Object.assign(Object.assign({}, channelState), { bob: vector_utils_1.getRandomAddress() }), channelState.assetIds, [])).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if state.channelAddress is incorrect", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.defundChannel(Object.assign(Object.assign({}, channelState), { channelAddress: vector_utils_1.getRandomAddress() }), channelState.assetIds, [])).revertedWith("CMCAdjudicator: INVALID_CHANNEL");
        });
        it("should fail if channel state supplied does not match channels state stored", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.defundChannel(Object.assign(Object.assign({}, channelState), { nonce: 652 }), channelState.assetIds, [])).revertedWith("CMCAdjudicator: INVALID_CHANNEL_HASH");
        });
        it("should fail if it is not in the defund phase", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const tx = await channel.disputeChannel(channelState, aliceSignature, bobSignature);
            const { blockNumber } = await tx.wait();
            await verifyChannelDispute(channelState, blockNumber);
            await vector_utils_1.expect(channel.defundChannel(channelState, channelState.assetIds, [])).revertedWith("CMCAdjudicator: INVALID_PHASE");
        });
        it("should fail if defund nonce does not increment", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const toDispute = Object.assign(Object.assign({}, channelState), { defundNonces: channelState.assetIds.map(() => "0") });
            await disputeChannel(toDispute);
            await vector_utils_1.expect(channel.defundChannel(toDispute, toDispute.assetIds, [])).revertedWith("CMCAdjudicator: CHANNEL_ALREADY_DEFUNDED");
        });
        it("should work (simple case)", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await fundChannel(channelState);
            await disputeChannel();
            await defundChannelAndVerify();
        });
        it("should work with multiple assets", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const multiAsset = Object.assign(Object.assign({}, channelState), { assetIds: [constants_1.AddressZero, token.address], defundNonces: ["1", "1"], balances: [
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["17", "26"] },
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["10", "8"] },
                ], processedDepositsA: ["0", "0"], processedDepositsB: ["43", "18"] });
            await fundChannel(multiAsset);
            await disputeChannel(multiAsset);
            await defundChannelAndVerify(multiAsset);
        });
        it("should fail if providing invalid inidices to defund", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const multiAsset = Object.assign(Object.assign({}, channelState), { assetIds: [constants_1.AddressZero, token.address], defundNonces: ["1", "1"], balances: [
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["17", "26"] },
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["10", "8"] },
                ], processedDepositsA: ["0", "0"], processedDepositsB: ["43", "18"] });
            await fundChannel(multiAsset);
            await disputeChannel(multiAsset);
            await vector_utils_1.expect(channel.defundChannel(multiAsset, [constants_1.AddressZero], [bignumber_1.BigNumber.from(1)])).revertedWith("CMCAdjudicator: INDEX_MISMATCH");
        });
        it("should work with multiple assets in channel, but only defunding one", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const multiAsset = Object.assign(Object.assign({}, channelState), { assetIds: [constants_1.AddressZero, token.address], defundNonces: ["1", "1"], balances: [
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["17", "26"] },
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["10", "8"] },
                ], processedDepositsA: ["0", "0"], processedDepositsB: ["43", "18"] });
            await fundChannel(multiAsset);
            await disputeChannel(multiAsset);
            await defundChannelAndVerify(multiAsset, [], [], [constants_1.AddressZero], []);
        });
        it("should work if providing inidices to defund", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const multiAsset = Object.assign(Object.assign({}, channelState), { assetIds: [constants_1.AddressZero, token.address], defundNonces: ["1", "1"], balances: [
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["17", "26"] },
                    { to: [constants_2.alice.address, constants_2.bob.address], amount: ["10", "8"] },
                ], processedDepositsA: ["0", "0"], processedDepositsB: ["43", "18"] });
            await fundChannel(multiAsset);
            await disputeChannel(multiAsset);
            await defundChannelAndVerify(multiAsset, [], [], [constants_1.AddressZero], [bignumber_1.BigNumber.from(0)]);
        });
        it("should work with unprocessed deposits", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await fundChannel(channelState);
            const unprocessed = bignumber_1.BigNumber.from(18);
            const bobTx = await constants_2.bob.sendTransaction({ to: channel.address, value: unprocessed });
            await bobTx.wait();
            await disputeChannel();
            await defundChannelAndVerify(channelState, [], [unprocessed]);
        });
        it("should work with unprocessed deposits of a new asset", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const onlyTokens = Object.assign(Object.assign({}, channelState), { assetIds: [token.address] });
            await fundChannel(onlyTokens);
            const unprocessed = bignumber_1.BigNumber.from(18);
            const bobTx = await constants_2.bob.sendTransaction({ to: onlyTokens.channelAddress, value: unprocessed });
            await bobTx.wait();
            await disputeChannel(onlyTokens);
            await defundChannelAndVerify(onlyTokens, [], ["0", unprocessed], [token.address, constants_1.AddressZero]);
        });
    });
    describe("disputeTransfer", () => {
        it("should fail if state.channelAddress is incorrect", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.disputeTransfer(Object.assign(Object.assign({}, transferState), { channelAddress: vector_utils_1.getRandomAddress() }), getMerkleProof())).revertedWith("CMCAdjudicator: INVALID_TRANSFER");
        });
        it("should fail if merkle proof is invalid", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            await vector_utils_1.expect(channel.disputeTransfer(Object.assign(Object.assign({}, transferState), { transferId: vector_utils_1.getRandomBytes32() }), getMerkleProof())).revertedWith("CMCAdjudicator: INVALID_MERKLE_PROOF");
        });
        it("should fail if channel is not in defund phase", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const tx = await channel.disputeChannel(channelState, aliceSignature, bobSignature);
            await tx.wait();
            await vector_utils_1.expect(channel.disputeTransfer(transferState, getMerkleProof())).revertedWith("CMCAdjudicator: INVALID_PHASE");
        });
        it("should fail if transfer has already been disputed", async function () {
            if (nonAutomining) {
                this.skip();
            }
            const longerTimeout = Object.assign(Object.assign({}, channelState), { timeout: "4" });
            await disputeChannel(longerTimeout);
            const tx = await channel.disputeTransfer(transferState, getMerkleProof());
            await tx.wait();
            await vector_utils_1.expect(channel.disputeTransfer(transferState, getMerkleProof())).revertedWith("CMCAdjudicator: TRANSFER_ALREADY_DISPUTED");
        });
        it("should work", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await disputeChannel();
            const tx = await channel.disputeTransfer(transferState, getMerkleProof());
            const { blockNumber } = await tx.wait();
            await verifyTransferDispute(transferState, blockNumber);
        });
    });
    describe("defundTransfer", () => {
        const prepTransferForDefund = async (ccs = channelState, cts = transferState) => {
            await fundChannel(ccs);
            await disputeChannel(ccs);
            await disputeTransfer(cts);
        };
        it("should fail if state.channelAddress is incorrect", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            await vector_utils_1.expect(channel.defundTransfer(Object.assign(Object.assign({}, transferState), { channelAddress: vector_utils_1.getRandomAddress() }), vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).revertedWith("CMCAdjudicator: INVALID_TRANSFER");
        });
        it("should fail if transfer hasnt been disputed", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await fundChannel();
            await disputeChannel();
            await vector_utils_1.expect(channel.defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).revertedWith("CMCAdjudicator: TRANSFER_NOT_DISPUTED");
        });
        it("should fail if the transfer does not match whats stored", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            await vector_utils_1.expect(channel.defundTransfer(Object.assign(Object.assign({}, transferState), { initialStateHash: vector_utils_1.getRandomBytes32() }), vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).revertedWith("CMCAdjudicator: INVALID_TRANSFER_HASH");
        });
        it("should fail if transfer has been defunded", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            const tx = await channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero);
            await tx.wait();
            await vector_utils_1.expect(channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).revertedWith("CMCAdjudicator: TRANSFER_ALREADY_DEFUNDED");
        });
        it("should fail if the responder is not the defunder and the responder signature is invalid, and the transfer is still in dispute", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            await vector_utils_1.expect(channel
                .connect(constants_2.rando)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), await constants_2.bob.signMessage(vector_utils_1.getRandomBytes32()))).revertedWith("CMCAdjudicator: INVALID_RESOLVER");
        });
        it("should fail if the initial state hash doesnt match and the transfer is still in dispute", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            await vector_utils_1.expect(channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(Object.assign(Object.assign({}, transferState.transferState), { lockHash: vector_utils_1.getRandomBytes32() }), transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver({ preImage: constants_1.HashZero }, transferState.transferEncodings[1]), constants_1.HashZero)).revertedWith("CMCAdjudicator: INVALID_TRANSFER_HASH");
        });
        it("should correctly resolve + defund transfer if transfer is still in dispute (cancelling resolve)", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            const preDefundAlice = await getOnchainBalance(transferState.assetId, constants_2.alice.address);
            await (await channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver({ preImage: constants_1.HashZero }, transferState.transferEncodings[1]), constants_1.HashZero)).wait();
            await (await channel.exit(transferState.assetId, constants_2.alice.address, constants_2.alice.address)).wait();
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, constants_2.alice.address)).to.be.eq(preDefundAlice.add(transferState.balance.amount[0]));
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, transferState.balance.to[1])).to.be.eq(0);
        });
        it("should correctly resolve + defund transfer if transfer is still in dispute (successful resolve)", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            const preDefundAlice = await getOnchainBalance(transferState.assetId, constants_2.alice.address);
            await (await channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).wait();
            await (await channel.exit(transferState.assetId, transferState.balance.to[1], transferState.balance.to[1])).wait();
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, constants_2.alice.address)).to.be.eq(preDefundAlice);
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, transferState.balance.to[1])).to.be.eq(transferState.balance.amount[0]);
        });
        it("should correctly resolve + defund transfer if transfer is still in dispute (successful resolve) when sent by a watchtower", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            const preDefundAlice = await getOnchainBalance(transferState.assetId, constants_2.alice.address);
            await (await channel
                .connect(constants_2.rando)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), await vector_utils_1.signChannelMessage(transferState.initialStateHash, constants_2.bob.privateKey))).wait();
            await (await channel.exit(transferState.assetId, transferState.balance.to[1], transferState.balance.to[1])).wait();
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, constants_2.alice.address)).to.be.eq(preDefundAlice);
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, transferState.balance.to[1])).to.be.eq(transferState.balance.amount[0]);
        });
        it("should correctly defund transfer when transfer is not in dispute phase", async function () {
            if (nonAutomining) {
                this.skip();
            }
            await prepTransferForDefund();
            const preDefundAlice = await getOnchainBalance(transferState.assetId, constants_2.alice.address);
            await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(transferState.transferTimeout).toNumber());
            await (await channel
                .connect(constants_2.bob)
                .defundTransfer(transferState, vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]), vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]), constants_1.HashZero)).wait();
            await (await channel.exit(transferState.assetId, constants_2.alice.address, constants_2.alice.address)).wait();
            const postDefundAlice = await getOnchainBalance(transferState.assetId, constants_2.alice.address);
            vector_utils_1.expect(postDefundAlice).to.be.eq(preDefundAlice.add(transferState.balance.amount[0]));
            vector_utils_1.expect(await getOnchainBalance(transferState.assetId, transferState.balance.to[1])).to.be.eq(0);
        });
    });
});
//# sourceMappingURL=adjudicator.spec.js.map