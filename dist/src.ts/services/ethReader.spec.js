"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const constants_1 = require("@ethersproject/constants");
const hardhat_1 = require("hardhat");
const pino_1 = __importDefault(require("pino"));
const constants_2 = require("../constants");
const utils_1 = require("../utils");
const ethReader_1 = require("./ethReader");
describe("EthereumChainReader", function () {
    this.timeout(120000);
    const assetId = constants_1.AddressZero;
    const transfer = {};
    let chainId;
    let chainReader;
    let channel;
    let factory;
    let transferRegistry;
    before(async () => {
        await hardhat_1.deployments.fixture();
        factory = await utils_1.getContract("ChannelFactory", constants_2.alice);
        transferRegistry = await utils_1.getContract("TransferRegistry", constants_2.alice);
        channel = (await utils_1.createChannel()).connect(constants_2.alice);
        chainId = await constants_2.chainIdReq;
        chainReader = new ethReader_1.EthereumChainReader({ [chainId]: constants_2.provider }, pino_1.default());
    });
    it("getChannelOnchainBalance", async () => {
        const balance = (await chainReader.getChannelOnchainBalance(channel.address, chainId, assetId)).getValue();
        vector_utils_1.expect(balance).to.equal(constants_1.Zero);
    });
    it("getTotalDepositedA", async () => {
        const res = await chainReader.getTotalDepositedA(channel.address, chainId, assetId);
        vector_utils_1.expect(res.isError).to.be.false;
        const val = res.getValue();
        vector_utils_1.expect(val).to.be.ok;
    });
    it("getTotalDepositedB", async () => {
        const res = (await chainReader.getTotalDepositedB(channel.address, chainId, assetId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
    it("getChannelFactoryBytecode", async () => {
        const res = (await chainReader.getChannelFactoryBytecode(factory.address, chainId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
    it("getChannelAddress", async () => {
        const res = (await chainReader.getChannelAddress(constants_2.alice.address, constants_2.bob.address, factory.address, chainId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
    it("getRegisteredTransferByName / getRegisteredTransferByDefinition", async () => {
        const byName = (await chainReader.getRegisteredTransferByName(vector_types_1.TransferNames.Withdraw, transferRegistry.address, chainId)).getValue();
        const chain = await transferRegistry.getTransferDefinitions();
        const cleaned = chain.map((r) => {
            return {
                name: r.name,
                definition: r.definition,
                stateEncoding: r.stateEncoding,
                resolverEncoding: r.resolverEncoding,
                encodedCancel: r.encodedCancel,
            };
        });
        const info = cleaned.find((i) => i.name === vector_types_1.TransferNames.Withdraw);
        vector_utils_1.expect(byName).to.be.deep.eq(info);
        const byDefinition = (await chainReader.getRegisteredTransferByDefinition(byName.definition, transferRegistry.address, chainId)).getValue();
        vector_utils_1.expect(byDefinition).to.be.deep.eq(byName);
    });
    it("getRegisteredTransfers", async () => {
        const chain = await transferRegistry.getTransferDefinitions();
        const cleaned = chain.map((r) => {
            return {
                name: r.name,
                definition: r.definition,
                stateEncoding: r.stateEncoding,
                resolverEncoding: r.resolverEncoding,
                encodedCancel: r.encodedCancel,
            };
        });
        const result = await chainReader.getRegisteredTransfers(transferRegistry.address, chainId);
        vector_utils_1.expect(result.getError()).to.be.undefined;
        vector_utils_1.expect(result.getValue()).to.be.deep.eq(cleaned);
    });
    it.skip("create", async () => {
        const res = (await chainReader.create(transfer.transferState, transfer.balance, transfer.transferDefinition, transferRegistry.address, chainId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
    it.skip("resolve", async () => {
        const res = (await chainReader.resolve(transfer, chainId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
    it("getCode", async () => {
        const res = (await chainReader.getCode(channel.address, chainId)).getValue();
        vector_utils_1.expect(res).to.be.ok;
    });
});
//# sourceMappingURL=ethReader.spec.js.map