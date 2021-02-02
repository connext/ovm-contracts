"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const constants_1 = require("@ethersproject/constants");
const keccak256_1 = require("@ethersproject/keccak256");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const hardhat_1 = require("hardhat");
const merkletreejs_1 = require("merkletreejs");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
const ethService_1 = require("./ethService");
describe("EthereumChainService", function () {
    this.timeout(120000);
    const aliceSigner = new vector_utils_1.ChannelSigner(constants_2.alice.privateKey);
    const bobSigner = new vector_utils_1.ChannelSigner(constants_2.bob.privateKey);
    let channel;
    let channelFactory;
    let transferDefinition;
    let chainService;
    let channelState;
    let transferState;
    let token;
    let chainId;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        chainId = await constants_2.chainIdReq;
        channel = await utils_1.createChannel();
        channelFactory = await utils_1.getContract("ChannelFactory", constants_2.alice);
        chainService = new ethService_1.EthereumChainService(new vector_utils_1.MemoryStoreService(), { [chainId]: constants_2.provider }, constants_2.alice.privateKey, constants_2.logger);
        token = await utils_1.getContract("TestToken", constants_2.alice);
        transferDefinition = await utils_1.getContract("HashlockTransfer", constants_2.alice);
        await (await token.mint(constants_2.alice.address, units_1.parseEther("1"))).wait();
        await (await token.mint(constants_2.bob.address, units_1.parseEther("1"))).wait();
        const preImage = vector_utils_1.getRandomBytes32();
        const state = {
            lockHash: vector_utils_1.createlockHash(preImage),
            expiry: "0",
        };
        transferState = vector_utils_1.createTestFullHashlockTransferState({
            chainId,
            initiator: constants_2.alice.address,
            responder: constants_2.bob.address,
            transferDefinition: transferDefinition.address,
            assetId: constants_1.AddressZero,
            channelAddress: channel.address,
            balance: { to: [constants_2.alice.address, vector_utils_1.getRandomAddress()], amount: ["7", "0"] },
            transferState: state,
            transferResolver: { preImage },
            transferTimeout: "2",
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
        channelState.latestUpdate.aliceSignature = await aliceSigner.signMessage(channelHash);
        channelState.latestUpdate.bobSignature = await bobSigner.signMessage(channelHash);
    });
    it("should be created without error", async () => {
        vector_utils_1.expect(channel.address).to.be.ok;
        vector_utils_1.expect(chainService).to.be.ok;
    });
    it("should run sendDepositTx without error", async () => {
        const res = await chainService.sendDepositTx(channelState, constants_2.alice.address, "10", constants_1.AddressZero);
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendWithdrawTx without error", async () => {
        const res = await chainService.sendWithdrawTx(channelState, {
            to: constants_2.bob.address,
            data: "0x",
            value: "0x01",
        });
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendDeployChannelTx without error", async () => {
        const channelAddress = (await chainService.getChannelAddress(constants_2.alice.address, constants_2.rando.address, channelFactory.address, chainId)).getValue();
        const res = await chainService.sendDeployChannelTx(Object.assign(Object.assign({}, channelState), { bob: constants_2.rando.address, channelAddress }), bignumber_1.BigNumber.from(1000), {
            amount: "0x01",
            assetId: constants_1.AddressZero,
        });
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendDisputeChannelTx without error", async () => {
        const res = await chainService.sendDisputeChannelTx(channelState);
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendDefundChannelTx without error", async () => {
        await chainService.sendDisputeChannelTx(channelState);
        await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(channelState.timeout).toNumber());
        const res = await chainService.sendDefundChannelTx(channelState);
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendDisputeTransferTx without error", async () => {
        await chainService.sendDisputeChannelTx(channelState);
        await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(channelState.timeout).toNumber());
        const res = await chainService.sendDisputeTransferTx(transferState.transferId, [transferState]);
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
    it("should run sendDefundTransferTx without error", async () => {
        await chainService.sendDisputeChannelTx(channelState);
        await utils_1.advanceBlocktime(bignumber_1.BigNumber.from(channelState.timeout).toNumber());
        await chainService.sendDisputeTransferTx(transferState.transferId, [transferState]);
        const bobChainService = new ethService_1.EthereumChainService(new vector_utils_1.MemoryStoreService(), { [chainId]: constants_2.provider }, constants_2.bob.privateKey, constants_2.logger);
        const res = await bobChainService.sendDefundTransferTx(transferState);
        vector_utils_1.expect(res.getValue()).to.be.ok;
    });
});
//# sourceMappingURL=ethService.spec.js.map