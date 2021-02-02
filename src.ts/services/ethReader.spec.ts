import { TransferNames, RegisteredTransfer } from "@connext/vector-types";
import { expect } from "@connext/vector-utils";
import { AddressZero, Zero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { deployments } from "hardhat";
import pino from "pino";

import { alice, bob, chainIdReq, provider } from "../constants";
import { getContract, createChannel } from "../utils";

import { EthereumChainReader } from "./ethReader";

// TODO: check whether result is valid, not just whether it exists
describe("EthereumChainReader", function () {
  this.timeout(120_000);
  const assetId = AddressZero;
  const transfer = {} as any; // TODO
  let chainId: number;
  let chainReader: EthereumChainReader;
  let channel: Contract;
  let factory: Contract;
  let transferRegistry: Contract;

  before(async () => {
    await deployments.fixture(); // Start w fresh deployments

    factory = await getContract("ChannelFactory", alice);
    transferRegistry = await getContract("TransferRegistry", alice);

    channel = (await createChannel()).connect(alice);
    chainId = await chainIdReq;
    chainReader = new EthereumChainReader({ [chainId]: provider }, pino());
  });

  it("getChannelOnchainBalance", async () => {
    const balance = (await chainReader.getChannelOnchainBalance(channel.address, chainId, assetId)).getValue();
    expect(balance).to.equal(Zero);
  });

  it("getTotalDepositedA", async () => {
    const res = await chainReader.getTotalDepositedA(channel.address, chainId, assetId);
    expect(res.isError).to.be.false;
    const val = res.getValue();
    expect(val).to.be.ok;
  });

  it("getTotalDepositedB", async () => {
    const res = (await chainReader.getTotalDepositedB(channel.address, chainId, assetId)).getValue();
    expect(res).to.be.ok;
  });

  it("getChannelFactoryBytecode", async () => {
    const res = (await chainReader.getChannelFactoryBytecode(factory.address, chainId)).getValue();
    expect(res).to.be.ok;
  });

  it("getChannelAddress", async () => {
    const res = (await chainReader.getChannelAddress(alice.address, bob.address, factory.address, chainId)).getValue();
    expect(res).to.be.ok;
  });

  it("getRegisteredTransferByName / getRegisteredTransferByDefinition", async () => {
    const byName = (
      await chainReader.getRegisteredTransferByName(TransferNames.Withdraw, transferRegistry.address, chainId)
    ).getValue();
    const chain = await transferRegistry.getTransferDefinitions();
    const cleaned = chain.map((r: RegisteredTransfer) => {
      return {
        name: r.name,
        definition: r.definition,
        stateEncoding: r.stateEncoding,
        resolverEncoding: r.resolverEncoding,
        encodedCancel: r.encodedCancel,
      };
    });
    const info = cleaned.find((i: any) => i.name === TransferNames.Withdraw);
    expect(byName).to.be.deep.eq(info);
    const byDefinition = (
      await chainReader.getRegisteredTransferByDefinition(byName.definition, transferRegistry.address, chainId)
    ).getValue();
    expect(byDefinition).to.be.deep.eq(byName);
  });

  it("getRegisteredTransfers", async () => {
    const chain = await transferRegistry.getTransferDefinitions();
    const cleaned = chain.map((r: RegisteredTransfer) => {
      return {
        name: r.name,
        definition: r.definition,
        stateEncoding: r.stateEncoding,
        resolverEncoding: r.resolverEncoding,
        encodedCancel: r.encodedCancel,
      };
    });
    const result = await chainReader.getRegisteredTransfers(transferRegistry.address, chainId);
    expect(result.getError()).to.be.undefined;
    expect(result.getValue()).to.be.deep.eq(cleaned);
  });

  it.skip("create", async () => {
    const res = (
      await chainReader.create(
        transfer.transferState,
        transfer.balance,
        transfer.transferDefinition,
        transferRegistry.address,
        chainId,
        // bytecode?: string,
      )
    ).getValue();
    expect(res).to.be.ok;
  });

  it.skip("resolve", async () => {
    const res = (
      await chainReader.resolve(
        transfer,
        chainId,
        // bytecode?: string,
      )
    ).getValue();
    expect(res).to.be.ok;
  });

  it("getCode", async () => {
    const res = (await chainReader.getCode(channel.address, chainId)).getValue();
    expect(res).to.be.ok;
  });
});
