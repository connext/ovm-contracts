/* global before */
import { getRandomBytes32, ChannelSigner } from "@connext/utils";
import { BigNumber, Wallet, Contract, constants, utils } from "ethers";

import {
  DolphinCoin,
  WithdrawInterpreter,
  ConditionalTransactionDelegateTarget,
} from "../../artifacts";

import { expect, createProvider } from "../utils";
import { MockProvider, deployContract } from "ethereum-waffle";
import { MinimumViableMultisig } from "../../..";
import { WithdrawCommitment } from "../../commitments/withdraw-commitment";

const MAX_INT = BigNumber.from(2).pow(256).sub(1);
describe.only("Multisig", async () => {
  let provider: MockProvider;
  let owner1: Wallet;
  let owner2: Wallet;
  let owners: string[];
  let multisig: Contract;
  let token: Contract;
  let ctdt: Contract;
  let interpreter: Contract;
  const bystander: Wallet = Wallet.createRandom();

  beforeEach(async () => {
    provider = await createProvider();
    const wallets = provider.getWallets();
    [owner1, owner2] = wallets;
    owners = [owner1.address, owner2.address];
    multisig = await deployContract(owner1, MinimumViableMultisig, []);
    token = (await deployContract(owner1, DolphinCoin, [MAX_INT])).connect(
      owner1
    );
    ctdt = (
      await deployContract(owner1, ConditionalTransactionDelegateTarget, [])
    ).connect(owner1);
    interpreter = (
      await deployContract(owner1, WithdrawInterpreter, [])
    ).connect(owner1);
  });

  // helpers
  const setOwners = () => {
    return multisig.setup(owners);
  };

  const sendTokens = (amount: BigNumber) => {
    return token.transfer(multisig.address, amount);
  };

  const sendWithdrawal = async (amount: BigNumber) => {
    const commitment = new WithdrawCommitment(
      {
        ConditionalTransactionDelegateTarget: ctdt.address,
        WithdrawInterpreter: interpreter.address,
      } as any,
      multisig.address,
      owners,
      bystander.address,
      token.address,
      amount,
      getRandomBytes32()
    );
    const [sig1, sig2] = await Promise.all(
      [owner1, owner2].map((owner) => {
        const hash = commitment.hashToSign();
        return new ChannelSigner(owner.privateKey, provider).signMessage(hash);
      })
    );
    await commitment.addSignatures(sig1, sig2);
    const signed = await commitment.getSignedTransaction();

    return owner1.connect(provider).sendTransaction(signed);
  };

  it("It should be able to set the owners", async () => {
    await setOwners();
    expect(await multisig.getOwners()).to.be.deep.eq(owners);
  });

  it("It should accept a deposit", async () => {
    await setOwners();
    const deposit = BigNumber.from(1000);
    const preDeposit = await token.balanceOf(multisig.address);
    await sendTokens(deposit);
    expect(await token.balanceOf(multisig.address)).to.be.eq(
      preDeposit.add(deposit)
    );
  });

  it("It should withdraw using withdraw app commitments", async () => {
    await setOwners();
    const deposit = BigNumber.from(1000);
    const preDeposit = await token.balanceOf(multisig.address);
    await sendTokens(deposit);
    await sendWithdrawal(deposit);
    expect(await token.balanceOf(multisig.address)).to.be.eq(preDeposit);
    expect(await token.balanceOf(bystander.address)).to.be.eq(deposit);
  });
});
