"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const constants_1 = require("@ethersproject/constants");
const hardhat_1 = require("hardhat");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
describe("ChannelMastercopy", function () {
    this.timeout(120000);
    let mastercopy;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        mastercopy = await utils_1.getContract("ChannelMastercopy", constants_2.alice);
    });
    it("should deploy without error", async () => {
        vector_utils_1.expect(mastercopy.address).to.be.a("string");
    });
    it("all public methods should revert bc it's the mastercopy", async () => {
        const BalanceZero = [
            [constants_1.Zero, constants_1.Zero],
            [constants_1.AddressZero, constants_1.AddressZero],
        ];
        const WithdrawDataZero = [constants_1.AddressZero, constants_1.AddressZero, constants_1.AddressZero, constants_1.Zero, constants_1.Zero, constants_1.AddressZero, constants_1.Zero, "0x"];
        const CoreChannelStateZero = [constants_1.AddressZero, constants_1.AddressZero, constants_1.AddressZero, [], [], [], [], [], constants_1.Zero, constants_1.Zero, constants_1.HashZero];
        const CoreTransferStateZero = [
            constants_1.AddressZero,
            constants_1.HashZero,
            constants_1.AddressZero,
            constants_1.AddressZero,
            constants_1.AddressZero,
            constants_1.AddressZero,
            BalanceZero,
            constants_1.Zero,
            constants_1.HashZero,
        ];
        for (const method of [
            { name: "setup", args: [constants_1.AddressZero, constants_1.AddressZero] },
            { name: "getAlice", args: [] },
            { name: "getBob", args: [] },
            { name: "getTotalTransferred", args: [constants_1.AddressZero] },
            { name: "getExitableAmount", args: [constants_1.AddressZero, constants_1.AddressZero] },
            { name: "exit", args: [constants_1.AddressZero, constants_1.AddressZero, constants_1.AddressZero] },
            { name: "getTotalDepositsAlice", args: [constants_1.AddressZero] },
            { name: "getTotalDepositsBob", args: [constants_1.AddressZero] },
            { name: "depositAlice", args: [constants_1.AddressZero, constants_1.Zero] },
            { name: "getWithdrawalTransactionRecord", args: [WithdrawDataZero] },
            { name: "withdraw", args: [WithdrawDataZero, constants_1.HashZero, constants_1.HashZero] },
            { name: "getChannelDispute", args: [] },
            { name: "getDefundNonce", args: [constants_1.AddressZero] },
            { name: "getTransferDispute", args: [constants_1.HashZero] },
            { name: "disputeChannel", args: [CoreChannelStateZero, constants_1.HashZero, constants_1.HashZero] },
            { name: "defundChannel", args: [CoreChannelStateZero, [constants_1.AddressZero], [constants_1.Zero]] },
            { name: "disputeTransfer", args: [CoreTransferStateZero, []] },
            { name: "defundTransfer", args: [CoreTransferStateZero, constants_1.HashZero, constants_1.HashZero, constants_1.HashZero] },
        ]) {
            await vector_utils_1.expect(mastercopy[method.name](...method.args)).to.be.revertedWith("Mastercopy: ONLY_VIA_PROXY");
        }
    });
    it("should revert if sent eth bc it's the mastercopy", async () => {
        await vector_utils_1.expect(constants_2.alice.sendTransaction({ to: mastercopy.address, value: constants_1.Zero })).to.be.revertedWith("Mastercopy: ONLY_VIA_PROXY");
    });
});
//# sourceMappingURL=channelMastercopy.spec.js.map