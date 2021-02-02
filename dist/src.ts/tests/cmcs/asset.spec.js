"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
describe("CMCAsset", function () {
    this.timeout(120000);
    let assetTransfer;
    let channel;
    let token;
    let failingToken;
    let nonconformingToken;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        assetTransfer = await utils_1.getContract("CMCAsset", constants_2.alice);
        channel = await utils_1.createChannel();
        token = await utils_1.getContract("TestToken", constants_2.alice);
        await (await token.mint(constants_2.bob.address, units_1.parseEther("1"))).wait();
        failingToken = await utils_1.getContract("FailingToken", constants_2.alice);
        await (await failingToken.mint(constants_2.bob.address, units_1.parseEther("1"))).wait();
        nonconformingToken = await utils_1.getContract("NonconformingToken", constants_2.alice);
        await (await nonconformingToken.mint(constants_2.bob.address, units_1.parseEther("1"))).wait();
    });
    it("should deploy", async () => {
        chai_1.expect(assetTransfer.address).to.be.a("string");
        chai_1.expect(channel.address).to.be.a("string");
    });
    describe("getTotalTransferred", () => {
        it("should fail if called directly", async () => {
            await chai_1.expect(assetTransfer.getTotalTransferred(constants_1.AddressZero)).revertedWith("Mastercopy: ONLY_VIA_PROXY");
        });
        it("should work when nothing has been transferred", async () => {
            chai_1.expect(await channel.getTotalTransferred(constants_1.AddressZero)).to.be.eq(bignumber_1.BigNumber.from(0));
            chai_1.expect(await channel.getTotalTransferred(token.address)).to.be.eq(bignumber_1.BigNumber.from(0));
        });
    });
    describe("getExitableAmount", () => {
        it("should fail if called directly", async () => {
            await chai_1.expect(assetTransfer.getExitableAmount(constants_1.AddressZero, constants_2.bob.address)).revertedWith("Mastercopy: ONLY_VIA_PROXY");
        });
        it("should work when nothing has been transferred", async () => {
            chai_1.expect(await channel.getExitableAmount(constants_1.AddressZero, constants_2.bob.address)).to.be.eq(bignumber_1.BigNumber.from(0));
            chai_1.expect(await channel.getExitableAmount(token.address, constants_2.bob.address)).to.be.eq(bignumber_1.BigNumber.from(0));
        });
    });
    describe("makeExitable", () => {
        beforeEach(async () => {
            const [to, value] = [channel.address, bignumber_1.BigNumber.from(10000)];
            await (await constants_2.bob.sendTransaction({ to, value })).wait();
            await (await token.connect(constants_2.bob).transfer(to, value)).wait();
            await (await nonconformingToken.connect(constants_2.bob).transfer(to, value)).wait();
        });
        it("should work for ETH transfers", async () => {
            const value = bignumber_1.BigNumber.from(1000);
            const preTransfer = await constants_2.bob.getBalance();
            await channel.testMakeExitable(constants_1.AddressZero, constants_2.bob.address, value);
            chai_1.expect(await constants_2.bob.getBalance()).to.be.eq(preTransfer);
            chai_1.expect(await channel.getTotalTransferred(constants_1.AddressZero)).to.be.eq(constants_1.Zero);
            chai_1.expect(await channel.getExitableAmount(constants_1.AddressZero, constants_2.bob.address)).to.be.eq(value);
        });
        it("should work for a valid ERC20 token", async () => {
            const value = bignumber_1.BigNumber.from(1000);
            const preTransfer = await token.balanceOf(constants_2.bob.address);
            await channel.testMakeExitable(token.address, constants_2.bob.address, value);
            chai_1.expect(await token.balanceOf(constants_2.bob.address)).to.be.eq(preTransfer);
            chai_1.expect(await channel.getTotalTransferred(token.address)).to.be.eq(constants_1.Zero);
            chai_1.expect(await channel.getExitableAmount(token.address, constants_2.bob.address)).to.be.eq(value);
        });
        it("should work for ERC20 token that does not return `bool` from transfer", async () => {
            const value = bignumber_1.BigNumber.from(1000);
            const preTransfer = await nonconformingToken.balanceOf(constants_2.bob.address);
            await channel.testMakeExitable(nonconformingToken.address, constants_2.bob.address, value);
            chai_1.expect(await nonconformingToken.balanceOf(constants_2.bob.address)).to.be.eq(preTransfer);
            chai_1.expect(await channel.getTotalTransferred(nonconformingToken.address)).to.be.eq(constants_1.Zero);
            chai_1.expect(await channel.getExitableAmount(nonconformingToken.address, constants_2.bob.address)).to.be.eq(value);
        });
    });
    describe("makeBalanceExitable", () => {
        beforeEach(async () => {
            const tx = await constants_2.bob.sendTransaction({ to: channel.address, value: bignumber_1.BigNumber.from(10000) });
            await tx.wait();
        });
        it("should work", async () => {
            const valueBob = bignumber_1.BigNumber.from(1000);
            const valueRando = bignumber_1.BigNumber.from(2000);
            const balance = {
                to: [constants_2.bob.address, constants_2.rando.address],
                amount: [valueBob.toString(), valueRando.toString()],
            };
            const preTransferBob = await constants_2.bob.getBalance();
            const preTransferRando = await constants_2.rando.getBalance();
            await channel.testMakeBalanceExitable(constants_1.AddressZero, balance);
            chai_1.expect(await constants_2.bob.getBalance()).to.be.eq(preTransferBob);
            chai_1.expect(await constants_2.rando.getBalance()).to.be.eq(preTransferRando);
            chai_1.expect(await channel.getTotalTransferred(constants_1.AddressZero)).to.be.eq(constants_1.Zero);
            chai_1.expect(await channel.getExitableAmount(constants_1.AddressZero, constants_2.bob.address)).to.be.eq(valueBob);
            chai_1.expect(await channel.getExitableAmount(constants_1.AddressZero, constants_2.rando.address)).to.be.eq(valueRando);
        });
    });
    describe("exit", () => {
        const value = bignumber_1.BigNumber.from(1000);
        beforeEach(async () => {
            const fund = value.mul(10);
            await (await constants_2.bob.sendTransaction({ to: channel.address, value: fund })).wait();
            await (await failingToken.connect(constants_2.bob).succeedingTransfer(channel.address, fund)).wait();
            const preTransfer = await failingToken.balanceOf(constants_2.bob.address);
            await (await channel.testMakeExitable(failingToken.address, constants_2.bob.address, value)).wait();
            chai_1.expect(await failingToken.balanceOf(constants_2.bob.address)).to.be.eq(preTransfer);
            chai_1.expect(await channel.getTotalTransferred(failingToken.address)).to.be.eq(bignumber_1.BigNumber.from(0));
            chai_1.expect(await channel.getExitableAmount(failingToken.address, constants_2.bob.address)).to.be.eq(value);
            await (await failingToken.setTransferShouldRevert(false)).wait();
            await (await failingToken.setTransferShouldFail(false)).wait();
        });
        it("should fail if owner is not msg.sender or recipient", async () => {
            await chai_1.expect(channel.connect(constants_2.rando).exit(failingToken.address, constants_2.bob.address, constants_2.rando.address)).revertedWith("CMCAsset: OWNER_MISMATCH");
        });
        it("should fail if withdrawable amount is 0", async () => {
            await chai_1.expect(channel.connect(constants_2.bob).exit(token.address, constants_2.bob.address, constants_2.bob.address)).revertedWith("CMCAsset: NO_OP");
        });
        it("should fail if transfer fails", async () => {
            await (await failingToken.setTransferShouldFail(true)).wait();
            await chai_1.expect(channel.connect(constants_2.bob).exit(failingToken.address, constants_2.bob.address, constants_2.bob.address)).revertedWith("CMCAsset: TRANSFER_FAILED");
        });
        it("should fail if transfer reverts", async () => {
            await (await failingToken.setTransferShouldRevert(true)).wait();
            await chai_1.expect(channel.connect(constants_2.bob).exit(failingToken.address, constants_2.bob.address, constants_2.bob.address)).revertedWith("FAIL: Failing token");
        });
        it("should allow ERC20 token to be withdrawable if transfer fails", async () => {
            const preTransfer = await failingToken.balanceOf(constants_2.bob.address);
            await (await channel.exit(failingToken.address, constants_2.bob.address, constants_2.bob.address)).wait();
            chai_1.expect(await failingToken.balanceOf(constants_2.bob.address)).to.be.eq(preTransfer.add(value));
        });
    });
});
//# sourceMappingURL=asset.spec.js.map