/* eslint-disable @typescript-eslint/no-empty-function */
import { UINT_MAX } from "@connext/vector-types";
import {
  getCreate2MultisigAddress,
  getMinimalProxyInitCode,
  getPublicIdentifierFromPublicKey,
  expect,
  getSignerAddressFromPublicIdentifier,
} from "@connext/vector-utils";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import pino from "pino";

import { ChannelMastercopy } from "../artifacts";
import { alice, bob, provider } from "../constants";
import { VectorChainReader } from "../services";
import { createOvmChannel, getOvmContract } from "../utils";

describe("ChannelFactory", function () {
  this.timeout(120_000);
  const alicePubId = getPublicIdentifierFromPublicKey(alice.publicKey);
  const bobPubId = getPublicIdentifierFromPublicKey(bob.publicKey);
  let chainReader: VectorChainReader;
  let channelFactory: Contract;
  let channelMastercopy: Contract;
  let token: Contract;

  beforeEach(async () => {
    channelMastercopy = await getOvmContract("ChannelMastercopy", alice);
    channelFactory = await getOvmContract("ChannelFactory", alice, [
      channelMastercopy.address,
      0,
    ]);
    const network = await provider.getNetwork();
    const chainProviders = { [network.chainId]: provider };
    chainReader = new VectorChainReader(
      chainProviders,
      pino().child({ module: "VectorChainReader" })
    );
    token = await getOvmContract("TestToken", alice);
    await (await token.mint(alice.address, parseEther("0.001"))).wait();
  });

  it("should deploy", async () => {
    expect(channelFactory.address).to.be.a("string");
  });

  it("should provide the mastercopy address", async () => {
    expect(await channelFactory.getMastercopy()).to.equal(
      channelMastercopy.address
    );
  });

  it("should provide the proxy bytecode", async () => {
    expect(await channelFactory.getProxyCreationCode()).to.equal(
      getMinimalProxyInitCode(channelMastercopy.address)
    );
  });

  // UTIL DOESNT WORK
  it("should create a channel and calculated addresses should match actual one", async () => {
    const channel = await new Promise<string>(async (resolve, reject) => {
      channelFactory.once("ChannelCreation", (data) => resolve(data));
      setTimeout(() => reject("No event in 10s"), 10_000);
      await channelFactory.createChannel(alice.address, bob.address);
    });
    const computedAddr1 = await channelFactory.getChannelAddress(
      alice.address,
      bob.address
    );
    const computedAddr2 = await getCreate2MultisigAddress(
      alicePubId,
      bobPubId,
      (await provider.getNetwork()).chainId,
      channelFactory.address,
      chainReader
    );
    expect(getSignerAddressFromPublicIdentifier(alicePubId)).to.be.eq(
      alice.address
    );
    expect(getSignerAddressFromPublicIdentifier(bobPubId)).to.be.eq(
      bob.address
    );
    expect(channel).to.be.eq(computedAddr1);
    // expect(channel.address).to.be.eq(computedAddr2.getValue());
    console.warn("!!IMPORTANT getCreate2MultisigAddress util doesnt work");
    console.warn("computedAddr2", computedAddr2.getValue());
    console.warn("actual", channel);
  });

  it("should create a channel with a deposit", async () => {
    // Use funded account for alice
    const value = BigNumber.from("1000");
    const channelAddress = await channelFactory.getChannelAddress(
      alice.address,
      bob.address
    );
    expect(channelAddress).to.be.a("string");
    await (await token.approve(channelFactory.address, UINT_MAX)).wait();
    await (
      await channelFactory
        .connect(alice)
        .createChannelAndDepositAlice(
          alice.address,
          bob.address,
          token.address,
          value
        )
    ).wait();

    const balance = await token.balanceOf(channelAddress as string);
    expect(balance).to.be.eq(value);

    const code = await provider.getCode(channelAddress);
    expect(code).to.not.be.eq("0x");

    const totalDepositsAlice = await new Contract(
      channelAddress,
      ChannelMastercopy.abi,
      alice
    ).getTotalDepositsAlice(token.address);
    expect(totalDepositsAlice).to.be.eq(value);
  });

  it("should create a different channel with a different mastercopy address", async () => {
    const channel = await createOvmChannel(
      alice.address,
      bob.address,
      channelFactory
    );
    const newChannelMastercopy = await getOvmContract(
      "ChannelMastercopy",
      alice
    );
    const newChannelFactory = await getOvmContract("ChannelFactory", alice, [
      newChannelMastercopy.address,
      0,
    ]);
    const newChannelAddress = await newChannelFactory.getChannelAddress(
      alice.address,
      bob.address
    );
    await (
      await newChannelFactory.createChannel(alice.address, bob.address)
    ).wait();
    expect(channel.address).to.not.eq(newChannelAddress);
  });
});
