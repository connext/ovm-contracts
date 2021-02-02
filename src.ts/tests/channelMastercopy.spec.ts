import { expect } from "@connext/vector-utils";
import { AddressZero, HashZero, Zero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { deployments } from "hardhat";

import { alice } from "../constants";
import { getContract } from "../utils";

describe("ChannelMastercopy", function () {
  this.timeout(120_000);
  let mastercopy: Contract;

  beforeEach(async () => {
    await deployments.fixture(); // Start w fresh deployments
    mastercopy = await getContract("ChannelMastercopy", alice);
  });

  it("should deploy without error", async () => {
    expect(mastercopy.address).to.be.a("string");
  });

  it("all public methods should revert bc it's the mastercopy", async () => {
    const BalanceZero = [
      [Zero, Zero],
      [AddressZero, AddressZero],
    ];
    const WithdrawDataZero = [AddressZero, AddressZero, AddressZero, Zero, Zero, AddressZero, Zero, "0x"];
    const CoreChannelStateZero = [AddressZero, AddressZero, AddressZero, [], [], [], [], [], Zero, Zero, HashZero];
    const CoreTransferStateZero = [
      AddressZero,
      HashZero,
      AddressZero,
      AddressZero,
      AddressZero,
      AddressZero,
      BalanceZero,
      Zero,
      HashZero,
    ];
    for (const method of [
      // from ICMCCore
      { name: "setup", args: [AddressZero, AddressZero] },
      { name: "getAlice", args: [] },
      { name: "getBob", args: [] },

      // from ICMCAsset
      { name: "getTotalTransferred", args: [AddressZero] },
      { name: "getExitableAmount", args: [AddressZero, AddressZero] },
      { name: "exit", args: [AddressZero, AddressZero, AddressZero] },

      // from ICMCDeposit
      { name: "getTotalDepositsAlice", args: [AddressZero] },
      { name: "getTotalDepositsBob", args: [AddressZero] },
      { name: "depositAlice", args: [AddressZero, Zero /*, HashZero */] },

      // from ICMCWithdraw
      { name: "getWithdrawalTransactionRecord", args: [WithdrawDataZero] },
      { name: "withdraw", args: [WithdrawDataZero, HashZero, HashZero] },

      // from ICMCAdjudicator
      { name: "getChannelDispute", args: [] },
      { name: "getDefundNonce", args: [AddressZero] },
      { name: "getTransferDispute", args: [HashZero] },
      { name: "disputeChannel", args: [CoreChannelStateZero, HashZero, HashZero] },
      { name: "defundChannel", args: [CoreChannelStateZero, [AddressZero], [Zero]] },
      { name: "disputeTransfer", args: [CoreTransferStateZero, []] },
      { name: "defundTransfer", args: [CoreTransferStateZero, HashZero, HashZero, HashZero] },
    ]) {
      await expect(mastercopy[method.name](...method.args)).to.be.revertedWith("Mastercopy: ONLY_VIA_PROXY");
    }
  });

  it("should revert if sent eth bc it's the mastercopy", async () => {
    await expect(alice.sendTransaction({ to: mastercopy.address, value: Zero })).to.be.revertedWith(
      "Mastercopy: ONLY_VIA_PROXY",
    );
  });
});
