"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const hardhat_1 = require("hardhat");
const pino_1 = __importDefault(require("pino"));
const artifacts_1 = require("../artifacts");
const constants_2 = require("../constants");
const services_1 = require("../services");
const utils_1 = require("../utils");
describe("ChannelFactory", function () {
    this.timeout(120000);
    const alicePubId = vector_utils_1.getPublicIdentifierFromPublicKey(constants_2.alice.publicKey);
    const bobPubId = vector_utils_1.getPublicIdentifierFromPublicKey(constants_2.bob.publicKey);
    let chainId;
    let chainReader;
    let channelFactory;
    let channelMastercopy;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        channelMastercopy = await utils_1.getContract("ChannelMastercopy", constants_2.alice);
        channelFactory = await utils_1.getContract("ChannelFactory", constants_2.alice);
        chainId = await constants_2.chainIdReq;
        const network = await constants_2.provider.getNetwork();
        const chainProviders = { [network.chainId]: constants_2.provider };
        chainReader = new services_1.VectorChainReader(chainProviders, pino_1.default().child({ module: "VectorChainReader" }));
    });
    it("should deploy", async () => {
        vector_utils_1.expect(channelFactory.address).to.be.a("string");
    });
    it("should provide the mastercopy address", async () => {
        vector_utils_1.expect(await channelFactory.getMastercopy()).to.equal(channelMastercopy.address);
    });
    it("should provide the proxy bytecode", async () => {
        vector_utils_1.expect(await channelFactory.getProxyCreationCode()).to.equal(vector_utils_1.getMinimalProxyInitCode(channelMastercopy.address));
    });
    it("should create a channel and calculated addresses should match actual one", async () => {
        const channel = await utils_1.createChannel(constants_2.alice.address, constants_2.bob.address, undefined, "");
        const computedAddr1 = await channelFactory.getChannelAddress(constants_2.alice.address, constants_2.bob.address);
        const computedAddr2 = await vector_utils_1.getCreate2MultisigAddress(alicePubId, bobPubId, chainId, channelFactory.address, chainReader);
        vector_utils_1.expect(vector_utils_1.getSignerAddressFromPublicIdentifier(alicePubId)).to.be.eq(constants_2.alice.address);
        vector_utils_1.expect(vector_utils_1.getSignerAddressFromPublicIdentifier(bobPubId)).to.be.eq(constants_2.bob.address);
        vector_utils_1.expect(channel.address).to.be.eq(computedAddr1);
        vector_utils_1.expect(channel.address).to.be.eq(computedAddr2.getValue());
    });
    it("should create a channel with a deposit", async () => {
        const value = bignumber_1.BigNumber.from("1000");
        await (await channelFactory
            .connect(constants_2.alice)
            .createChannelAndDepositAlice(constants_2.alice.address, constants_2.bob.address, constants_1.AddressZero, value, { value })).wait();
        const channelAddress = await channelFactory.getChannelAddress(constants_2.alice.address, constants_2.bob.address);
        const computedAddr = await vector_utils_1.getCreate2MultisigAddress(alicePubId, bobPubId, chainId, channelFactory.address, chainReader);
        vector_utils_1.expect(channelAddress).to.be.a("string");
        vector_utils_1.expect(channelAddress).to.be.eq(computedAddr.getValue());
        const balance = await constants_2.provider.getBalance(channelAddress);
        vector_utils_1.expect(balance).to.be.eq(value);
        const code = await constants_2.provider.getCode(channelAddress);
        vector_utils_1.expect(code).to.not.be.eq("0x");
        const totalDepositsAlice = await new contracts_1.Contract(channelAddress, artifacts_1.ChannelMastercopy.abi, constants_2.alice).getTotalDepositsAlice(constants_1.AddressZero);
        vector_utils_1.expect(totalDepositsAlice).to.be.eq(value);
    });
    it("should create a different channel with a different mastercopy address", async () => {
        const channel = await utils_1.createChannel(constants_2.alice.address, constants_2.bob.address);
        const newChannelMastercopy = await (await (await hardhat_1.l2ethers.getContractFactory("ChannelMastercopy", constants_2.alice)).deploy()).deployed();
        const newChannelFactory = await (await (await hardhat_1.l2ethers.getContractFactory("ChannelFactory", constants_2.alice)).deploy(newChannelMastercopy.address, constants_1.Zero)).deployed();
        const newChannelAddress = await newChannelFactory.getChannelAddress(constants_2.alice.address, constants_2.bob.address);
        await (await newChannelFactory.createChannel(constants_2.alice.address, constants_2.bob.address)).wait();
        vector_utils_1.expect(channel.address).to.not.eq(newChannelAddress);
    });
});
//# sourceMappingURL=channelFactory.spec.js.map