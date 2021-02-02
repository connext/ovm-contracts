"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const hardhat_1 = require("hardhat");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
const withdraw_1 = require("./withdraw");
describe("withdrawCommitment", function () {
    this.timeout(120000);
    let channel;
    let token;
    const amount = "50";
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        token = await utils_1.getContract("TestToken", constants_2.alice);
        channel = await utils_1.createChannel();
        await (await constants_2.alice.sendTransaction({
            to: channel.address,
            value: bignumber_1.BigNumber.from(amount).mul(2),
        })).wait();
        await (await token.transfer(channel.address, units_1.parseEther(amount))).wait();
    });
    it("can successfully withdraw Eth", async () => {
        const commitment = new withdraw_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, constants_2.alice.address, constants_1.AddressZero, amount, "1");
        await commitment.addSignatures(await vector_utils_1.signChannelMessage(commitment.hashToSign(), constants_2.alice.privateKey), await vector_utils_1.signChannelMessage(commitment.hashToSign(), constants_2.bob.privateKey));
        vector_utils_1.expect((await constants_2.provider.getBalance(channel.address)).eq(bignumber_1.BigNumber.from(amount).mul(2)));
        await constants_2.alice.sendTransaction(await commitment.getSignedTransaction());
        vector_utils_1.expect((await constants_2.provider.getBalance(channel.address)).eq(bignumber_1.BigNumber.from(amount)));
    });
    it("can successfully withdraw Tokens", async () => {
        const commitment = new withdraw_1.WithdrawCommitment(channel.address, constants_2.alice.address, constants_2.bob.address, constants_2.alice.address, token.address, amount, "1");
        await commitment.addSignatures(await vector_utils_1.signChannelMessage(commitment.hashToSign(), constants_2.alice.privateKey), await vector_utils_1.signChannelMessage(commitment.hashToSign(), constants_2.bob.privateKey));
        vector_utils_1.expect((await token.balanceOf(channel.address)).eq(bignumber_1.BigNumber.from(amount).mul(2)));
        await constants_2.alice.sendTransaction(commitment.getSignedTransaction());
        vector_utils_1.expect((await token.balanceOf(channel.address)).eq(bignumber_1.BigNumber.from(amount)));
    });
});
//# sourceMappingURL=withdraw.spec.js.map