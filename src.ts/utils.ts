import { Contract } from "@ethersproject/contracts";
import { ethers, run } from "hardhat";

import { alice, bob, defaultLogLevel, provider } from "./constants";

import * as TestChannel from "../artifacts-ovm/src.sol/testing/TestChannel.sol/TestChannel.json";
import * as ChannelMastercopy from "../artifacts-ovm/src.sol/ChannelMastercopy.sol/ChannelMastercopy.json";
import { Wallet } from "@ethersproject/wallet";

export const getContract = (ethers as any).getContract;

////////////////////////////////////////
// Wrap tasks in a format that's easier to use internally

export const registerTransfer = (
  transferName: string,
  signerAddress: string = alice.address,
  logLevel = defaultLogLevel
): Promise<Contract> =>
  run("register-transfer", { transferName, signerAddress, logLevel });

// export const createChannel = (
//   aliceAddress: string = alice.address,
//   bobAddress: string = bob.address,
//   logLevel = defaultLogLevel,
//   testMode = "yarp"
// ): Promise<Contract> =>
//   run("create-channel", { aliceAddress, bobAddress, logLevel, testMode });

export const createOvmChannel = async (
  aliceAddress: string = alice.address,
  bobAddress: string = bob.address,
  factory?: Contract
): Promise<Contract> => {
  if (!factory) {
    const mastercopy = await (
      await ethers.getContractFactory("ChannelMastercopy", alice)
    ).deploy();
    factory = (await (
      await ethers.getContractFactory("ChannelFactory", alice)
    ).deploy(mastercopy.address, 0)) as any;
  }
  const channelAddress = await factory!.getChannelAddress(
    aliceAddress,
    bobAddress
  );
  await (await factory!.createChannel(aliceAddress, bobAddress)).wait();
  return new Contract(channelAddress, ChannelMastercopy.abi, alice);
};

export const createOvmTestChannel = async (
  aliceAddress: string = alice.address,
  bobAddress: string = bob.address,
  setup: boolean = true
): Promise<Contract> => {
  const mastercopy = await (
    await ethers.getContractFactory("TestChannel", alice)
  ).deploy();
  const testFactory = await (
    await ethers.getContractFactory("TestChannelFactory", alice)
  ).deploy(mastercopy.address, 0);
  const channelAddress = await testFactory.getChannelAddress(
    aliceAddress,
    bobAddress
  );
  await (setup
    ? await testFactory.createChannel(aliceAddress, bobAddress)
    : await testFactory.createChannelWithoutSetup(aliceAddress, bobAddress)
  ).wait();
  return new Contract(channelAddress, TestChannel.abi, alice);
};

export const getOvmContract = async (
  name: string,
  signer: Wallet = alice,
  args: any[] = []
): Promise<Contract> => {
  const factory = await ethers.getContractFactory(name, signer);
  const contract = (await factory.deploy(...args)).connect(signer);
  return contract as any;
};

////////////////////////////////////////
// Other Utils

export const advanceBlocktime = async (seconds: number): Promise<void> => {
  const { timestamp: currTime } = await provider.getBlock("latest");
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
  const { timestamp: finalTime } = await provider.getBlock("latest");
  const desired = currTime + seconds;
  if (finalTime < desired) {
    const diff = finalTime - desired;
    await provider.send("evm_increaseTime", [diff]);
  }
};
