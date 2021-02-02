"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
describe("CMCCore.sol", function () {
    this.timeout(120000);
    let channel;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
    });
    describe("setup", async () => {
        beforeEach(async () => {
            const testFactory = await hardhat_1.l2ethers.getContract("TestChannelFactory", constants_2.alice);
            const channelAddress = await testFactory.getChannelAddress(constants_2.alice.address, constants_2.bob.address);
            await (await testFactory.createChannelWithoutSetup(constants_2.alice.address, constants_2.bob.address)).wait();
            channel = new contracts_1.Contract(channelAddress, (await hardhat_1.deployments.getArtifact("TestChannel")).abi, constants_2.alice);
        });
        it("should work", async () => {
            const setupTx = await channel.setup(constants_2.alice.address, constants_2.bob.address);
            await setupTx.wait();
            chai_1.expect(await channel.getAlice()).to.be.eq(constants_2.alice.address);
            chai_1.expect(await channel.getBob()).to.be.eq(constants_2.bob.address);
        });
        it("should fail if it has already been setup", async () => {
            const setupTx = await channel.setup(constants_2.alice.address, constants_2.bob.address);
            await setupTx.wait();
            await chai_1.expect(channel.setup(constants_2.alice.address, constants_2.bob.address)).revertedWith("CMCCore: ALREADY_SETUP");
        });
        it("should fail to setup if alice is not supplied", async () => {
            await chai_1.expect(channel.setup(constants_1.AddressZero, constants_2.bob.address)).revertedWith("CMCCore: INVALID_PARTICIPANT");
        });
        it("should fail to setup if bob is not supplied", async () => {
            await chai_1.expect(channel.setup(constants_1.AddressZero, constants_2.bob.address)).revertedWith("CMCCore: INVALID_PARTICIPANT");
        });
        it("should fail if alice == bob", async () => {
            await chai_1.expect(channel.setup(constants_2.alice.address, constants_2.alice.address)).revertedWith("CMCCore: IDENTICAL_PARTICIPANTS");
        });
    });
    describe("getters", async () => {
        beforeEach(async () => {
            channel = await utils_1.createChannel();
        });
        it("should work", async () => {
            chai_1.expect(await channel.getAlice()).to.equal(constants_2.alice.address);
            chai_1.expect(await channel.getBob()).to.equal(constants_2.bob.address);
        });
    });
});
//# sourceMappingURL=core.spec.js.map