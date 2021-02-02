import {
  FullChannelState,
  FullTransferState,
  HashlockTransferStateEncoding,
} from "@connext/vector-types";
import {
  ChannelSigner,
  hashChannelCommitment,
  createlockHash,
  createTestChannelStateWithSigners,
  createTestFullHashlockTransferState,
  expect,
  getRandomAddress,
  getRandomBytes32,
  hashCoreTransferState,
  hashTransferState,
  MemoryStoreService,
  signChannelMessage,
} from "@connext/vector-utils";
// import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { MerkleTree } from "merkletreejs";

import { alice, bob, chainIdReq, logger, provider, rando } from "../constants";
import { advanceBlocktime, getOvmContract, createOvmChannel } from "../utils";

import { EthereumChainService } from "./ethService";
import { One } from "@ethersproject/constants";
import { WithdrawCommitment } from "..";

describe("EthereumChainService", function () {
  this.timeout(120_000);
  const aliceSigner = new ChannelSigner(alice.privateKey);
  const bobSigner = new ChannelSigner(bob.privateKey);
  let channel: Contract;
  let channelFactory: Contract;
  let transferDefinition: Contract;
  let chainService: EthereumChainService;
  let channelState: FullChannelState;
  let transferState: FullTransferState;
  let token: Contract;
  let chainId: number;

  beforeEach(async () => {
    chainId = await chainIdReq;
    const mastercopy = await getOvmContract("ChannelMastercopy", alice);
    channelFactory = await getOvmContract("ChannelFactory", alice, [
      mastercopy.address,
      0,
    ]);
    channel = await createOvmChannel();
    chainService = new EthereumChainService(
      new MemoryStoreService(),
      { [chainId]: provider },
      alice.privateKey,
      logger
    );
    token = await getOvmContract("TestToken", alice);
    transferDefinition = await getOvmContract("HashlockTransfer", alice);
    const transferRegistry = await getOvmContract("TransferRegistry", alice);
    await (
      await transferRegistry.addTransferDefinition(
        await transferDefinition.getRegistryInformation()
      )
    ).wait();
    await (await token.mint(alice.address, parseEther("1"))).wait();
    await (await token.mint(bob.address, parseEther("1"))).wait();
    const preImage = getRandomBytes32();
    const state = {
      lockHash: createlockHash(preImage),
      expiry: "0",
    };
    transferState = createTestFullHashlockTransferState({
      chainId,
      initiator: alice.address,
      responder: bob.address,
      transferDefinition: transferDefinition.address,
      assetId: token.address,
      channelAddress: channel.address,
      // use random receiver addr to verify transfer when bob must dispute
      balance: { to: [alice.address, getRandomAddress()], amount: ["7", "0"] },
      transferState: state,
      transferResolver: { preImage },
      transferTimeout: "2",
      initialStateHash: hashTransferState(state, HashlockTransferStateEncoding),
    });

    channelState = createTestChannelStateWithSigners(
      [aliceSigner, bobSigner],
      "create",
      {
        channelAddress: channel.address,
        assetIds: [token.address],
        balances: [{ to: [alice.address, bob.address], amount: ["17", "45"] }],
        processedDepositsA: ["0"],
        processedDepositsB: ["62"],
        timeout: "20",
        nonce: 3,
        merkleRoot: new MerkleTree(
          [hashCoreTransferState(transferState)],
          keccak256
        ).getHexRoot(),
      }
    );
    const channelHash = hashChannelCommitment(channelState);
    channelState.latestUpdate.aliceSignature = await aliceSigner.signMessage(
      channelHash
    );
    channelState.latestUpdate.bobSignature = await bobSigner.signMessage(
      channelHash
    );
  });

  it("should be created without error", async () => {
    expect(channel.address).to.be.ok;
    expect(chainService).to.be.ok;
  });

  it("should run sendDepositTx without error", async () => {
    const res = await chainService.sendDepositTx(
      channelState,
      alice.address,
      "10",
      token.address
    );
    expect(res.getValue()).to.be.ok;
  });

  it("should run sendWithdrawTx without error", async () => {
    await (await token.transfer(channel.address, parseEther("50"))).wait();
    const commitment = new WithdrawCommitment(
      channel.address,
      alice.address,
      bob.address,
      alice.address,
      token.address,
      One.toString(),
      "1"
    );
    await commitment.addSignatures(
      await signChannelMessage(commitment.hashToSign(), alice.privateKey),
      await signChannelMessage(commitment.hashToSign(), bob.privateKey)
    );
    const res = await chainService.sendWithdrawTx(
      channelState,
      commitment.getSignedTransaction()
    );
    expect(res.getValue()).to.be.ok;
  });

  // Need to setup a channel between alice & rando else it'll error w "channel already deployed"
  it("should run sendDeployChannelTx without error", async () => {
    const channelAddress = (
      await chainService.getChannelAddress(
        alice.address,
        rando.address,
        channelFactory.address,
        chainId
      )
    ).getValue();
    const res = await chainService.sendDeployChannelTx(
      {
        ...channelState,
        bob: rando.address,
        channelAddress,
      },
      await provider.getGasPrice(),
      {
        amount: "0x01",
        assetId: token.address,
      }
    );
    expect(res.getValue()).to.be.ok;
  });

  it("should run sendDisputeChannelTx without error", async () => {
    const res = await chainService.sendDisputeChannelTx(channelState);
    expect(res.getValue()).to.be.ok;
  });

  it("should run sendDefundChannelTx without error", async () => {
    await chainService.sendDisputeChannelTx(channelState);
    await advanceBlocktime(BigNumber.from(channelState.timeout).toNumber());
    const res = await chainService.sendDefundChannelTx(channelState);
    expect(res.getValue()).to.be.ok;
  });

  it("should run sendDisputeTransferTx without error", async () => {
    await chainService.sendDisputeChannelTx(channelState);
    await advanceBlocktime(BigNumber.from(channelState.timeout).toNumber());
    const res = await chainService.sendDisputeTransferTx(
      transferState.transferId,
      [transferState]
    );
    expect(res.getValue()).to.be.ok;
  });

  // Fails with INVALID_MSG_SENDER
  it("should run sendDefundTransferTx without error", async () => {
    await chainService.sendDisputeChannelTx(channelState);
    await advanceBlocktime(BigNumber.from(channelState.timeout).toNumber());
    await chainService.sendDisputeTransferTx(transferState.transferId, [
      transferState,
    ]);
    // Bob is the one who will defund, create a chainService for him to do so
    const bobChainService = new EthereumChainService(
      new MemoryStoreService(),
      { [chainId]: provider },
      bob.privateKey,
      logger
    );
    const res = await bobChainService.sendDefundTransferTx(transferState);
    expect(res.getValue()).to.be.ok;
  });
});
