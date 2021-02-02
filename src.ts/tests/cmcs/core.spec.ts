/* eslint-disable @typescript-eslint/no-empty-function */
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { alice, bob } from "../../constants";
import { createChannel } from "../../utils";

// NOTE: This will use a channel deployed by the `TestChannelFactory` that
// has not been setup on deploy. Otherwise, the

describe("CMCCore.sol", function() {
  this.timeout(120_000);
  let channel: Contract;

  beforeEach(async () => {
    await deployments.fixture(); // Start w fresh deployments
  });

  describe("setup", async () => {
    beforeEach(async () => {
      const testFactory = await (ethers as any).getContract("TestChannelFactory", alice);
      const channelAddress = await testFactory.getChannelAddress(alice.address, bob.address);
      await (await testFactory.createChannelWithoutSetup(alice.address, bob.address)).wait();
      channel = new Contract(
        channelAddress,
        (await deployments.getArtifact("TestChannel")).abi,
        alice,
      );
    });

    it("should work", async () => {
      const setupTx = await channel.setup(alice.address, bob.address);
      await setupTx.wait();

      expect(await channel.getAlice()).to.be.eq(alice.address);
      expect(await channel.getBob()).to.be.eq(bob.address);
    });

    it("should fail if it has already been setup", async () => {
      const setupTx = await channel.setup(alice.address, bob.address);
      await setupTx.wait();
      await expect(
        channel.setup(alice.address, bob.address),
      ).revertedWith("CMCCore: ALREADY_SETUP");
    });

    it("should fail to setup if alice is not supplied", async () => {
      await expect(channel.setup(AddressZero, bob.address)).revertedWith(
        "CMCCore: INVALID_PARTICIPANT",
      );
    });

    it("should fail to setup if bob is not supplied", async () => {
      await expect(channel.setup(AddressZero, bob.address)).revertedWith(
        "CMCCore: INVALID_PARTICIPANT",
      );
    });

    it("should fail if alice == bob", async () => {
      await expect(channel.setup(alice.address, alice.address)).revertedWith(
        "CMCCore: IDENTICAL_PARTICIPANTS",
      );
    });
  });

  describe("getters", async () => {
    beforeEach(async () => {
      channel = await createChannel();
    });

    it("should work", async () => {
      expect(await channel.getAlice()).to.equal(alice.address);
      expect(await channel.getBob()).to.equal(bob.address);
    });
  });
});
