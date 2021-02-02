"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
describe("CMCDeposit.sol", function () {
    this.timeout(120000);
    const value = constants_1.One;
    let channel;
    let failingToken;
    let reentrantToken;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        channel = await utils_1.createChannel();
        failingToken = await utils_1.getContract("FailingToken", constants_2.alice);
        await (await failingToken.mint(constants_2.alice.address, units_1.parseEther("0.001"))).wait();
        await hardhat_1.deployments.deploy("ReentrantToken", {
            from: constants_2.alice.address,
            args: [channel.address],
        });
        reentrantToken = await utils_1.getContract("ReentrantToken", constants_2.alice);
        await (await reentrantToken.mint(constants_2.alice.address, units_1.parseEther("0.01"))).wait();
    });
    it("should only increase totalDepositsBob after receiving a direct deposit", async () => {
        const aliceDeposits = await channel.getTotalDepositsAlice(constants_1.AddressZero);
        const bobDeposits = await channel.getTotalDepositsBob(constants_1.AddressZero);
        const tx = await constants_2.bob.sendTransaction({ to: channel.address, value });
        await tx.wait();
        vector_utils_1.expect(await channel.getTotalDepositsAlice(constants_1.AddressZero)).to.equal(aliceDeposits);
        vector_utils_1.expect(await channel.getTotalDepositsBob(constants_1.AddressZero)).to.equal(bobDeposits.add(value));
    });
    it("should only increase totalDepositsAlice after recieving a deposit via method call", async () => {
        const aliceDeposits = await channel.getTotalDepositsAlice(constants_1.AddressZero);
        const bobDeposits = await channel.getTotalDepositsBob(constants_1.AddressZero);
        const tx = await channel.connect(constants_2.alice).depositAlice(constants_1.AddressZero, value, { value });
        await tx.wait();
        vector_utils_1.expect(await channel.getTotalDepositsAlice(constants_1.AddressZero)).to.equal(aliceDeposits.add(value));
        vector_utils_1.expect(await channel.getTotalDepositsBob(constants_1.AddressZero)).to.equal(bobDeposits);
    });
    it("depositAlice should fail if the amount doesnt match the value", async () => {
        await vector_utils_1.expect(channel.depositAlice(constants_1.AddressZero, value, { value: bignumber_1.BigNumber.from(0) })).revertedWith("CMCDeposit: VALUE_MISMATCH");
        vector_utils_1.expect(await channel.getTotalDepositsAlice(constants_1.AddressZero)).to.be.eq(0);
    });
    it("depositAlice should fail if ETH is sent along with an ERC deposit", async () => {
        await vector_utils_1.expect(channel.depositAlice(failingToken.address, value, { value: bignumber_1.BigNumber.from(10) })).revertedWith("CMCDeposit: ETH_WITH_ERC_TRANSFER");
        vector_utils_1.expect(await channel.getTotalDepositsAlice(failingToken.address)).to.be.eq(0);
        vector_utils_1.expect(await channel.getTotalDepositsAlice(constants_1.AddressZero)).to.be.eq(0);
    });
    it("should fail if the token transfer fails", async () => {
        vector_utils_1.expect(await failingToken.balanceOf(constants_2.alice.address)).to.be.gt(value);
        await vector_utils_1.expect(channel.depositAlice(failingToken.address, value)).revertedWith("FAIL: Failing token");
        vector_utils_1.expect(await channel.getTotalDepositsAlice(failingToken.address)).to.be.eq(0);
    });
    it("should protect against reentrant tokens", async () => {
        await vector_utils_1.expect(channel.depositAlice(reentrantToken.address, value)).to.be.revertedWith("ReentrancyGuard: REENTRANT_CALL");
        vector_utils_1.expect(await channel.getTotalDepositsAlice(reentrantToken.address)).to.be.eq(0);
    });
});
//# sourceMappingURL=deposit.spec.js.map