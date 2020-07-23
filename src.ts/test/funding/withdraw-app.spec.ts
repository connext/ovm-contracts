/* global before */
import {
  CoinTransfer,
  singleAssetTwoPartyCoinTransferEncoding,
  WithdrawAppAction,
  WithdrawAppActionEncoding,
  WithdrawAppState,
  WithdrawAppStateEncoding,
} from "@connext/types";
import { ChannelSigner, getRandomBytes32 } from "@connext/utils";
import { BigNumber, Wallet, Contract, constants, utils } from "ethers";

import { WithdrawApp } from "../../artifacts";

import { expect, createProvider } from "../utils";
import { MockProvider, deployContract } from "ethereum-waffle";

const { Zero, HashZero } = constants;
const { defaultAbiCoder, hexlify, randomBytes, SigningKey } = utils;

const decodeTransfers = (encodedTransfers: string): CoinTransfer[] =>
  defaultAbiCoder.decode(
    [singleAssetTwoPartyCoinTransferEncoding],
    encodedTransfers
  )[0];

const decodeAppState = (encodedAppState: string): WithdrawAppState =>
  defaultAbiCoder.decode([WithdrawAppStateEncoding], encodedAppState)[0];

const encodeAppState = (
  state: WithdrawAppState,
  onlyCoinTransfers: boolean = false
): string => {
  if (!onlyCoinTransfers)
    return defaultAbiCoder.encode([WithdrawAppStateEncoding], [state]);
  return defaultAbiCoder.encode(
    [singleAssetTwoPartyCoinTransferEncoding],
    [state.transfers]
  );
};

const encodeAppAction = (state: WithdrawAppAction): string => {
  return defaultAbiCoder.encode([WithdrawAppActionEncoding], [state]);
};

describe("WithdrawApp", async () => {
  let provider: MockProvider;
  let wallet: Wallet;
  let withdrawApp: Contract;

  // test constants
  const withdrawerWallet = Wallet.createRandom();
  const counterpartyWallet = Wallet.createRandom();
  const bystanderWallet = Wallet.createRandom();
  const amount = BigNumber.from(10000);
  const data = getRandomBytes32(); // TODO: test this with real withdrawal commitment hash?
  const withdrawerSigningKey = new SigningKey(withdrawerWallet.privateKey);
  const counterpartySigningKey = new SigningKey(counterpartyWallet.privateKey);
  const bystanderSigningKey = new SigningKey(bystanderWallet.privateKey);

  before(async () => {
    provider = await createProvider();
    wallet = (await provider.getWallets())[0];
    withdrawApp = await deployContract(wallet, WithdrawApp, []);
  });

  // helpers
  const computeOutcome = async (state: WithdrawAppState): Promise<string> => {
    return withdrawApp.computeOutcome(encodeAppState(state));
  };

  const applyAction = async (
    state: any,
    action: WithdrawAppAction
  ): Promise<string> => {
    return withdrawApp.applyAction(
      encodeAppState(state),
      encodeAppAction(action)
    );
  };

  const createInitialState = async (): Promise<WithdrawAppState> => {
    return {
      transfers: [
        {
          amount,
          to: withdrawerWallet.address,
        },
        {
          amount: Zero,
          to: counterpartyWallet.address,
        },
      ],
      signatures: [
        await new ChannelSigner(withdrawerSigningKey.privateKey).signMessage(
          data
        ),
        HashZero,
      ],
      signers: [withdrawerWallet.address, counterpartyWallet.address],
      data,
      nonce: hexlify(randomBytes(32)),
      finalized: false,
    };
  };

  const createAction = async (): Promise<WithdrawAppAction> => {
    return {
      signature: await new ChannelSigner(
        counterpartySigningKey.privateKey
      ).signMessage(data),
    };
  };

  it("It zeroes withdrawer balance if state is finalized (w/ valid signatures)", async () => {
    const initialState = await createInitialState();
    const action = await createAction();

    let ret = await applyAction(initialState, action);
    const afterActionState = decodeAppState(ret);
    expect(afterActionState.signatures[1]).to.eq(action.signature);
    expect(afterActionState.finalized).to.be.true;

    ret = await computeOutcome(afterActionState);
    const decoded = decodeTransfers(ret);

    expect(decoded[0].to).eq(initialState.transfers[0].to);
    expect(decoded[0].amount).eq(Zero);
    expect(decoded[1].to).eq(initialState.transfers[1].to);
    expect(decoded[1].amount).eq(Zero);
  });

  it("It cancels the withdrawal if state is not finalized", async () => {
    const initialState = await createInitialState();

    // Compute outcome without taking action
    const ret = await computeOutcome(initialState);
    const decoded = decodeTransfers(ret);

    expect(decoded[0].to).eq(initialState.transfers[0].to);
    expect(decoded[0].amount).eq(initialState.transfers[0].amount);
    expect(decoded[1].to).eq(initialState.transfers[1].to);
    expect(decoded[1].amount).eq(Zero);
  });

  it("It reverts the action if state is finalized", async () => {
    const initialState = await createInitialState();
    const action = await createAction();

    const ret = await applyAction(initialState, action);
    const afterActionState = decodeAppState(ret);
    expect(afterActionState.signatures[1]).to.eq(action.signature);
    expect(afterActionState.finalized).to.be.true;

    await expect(applyAction(afterActionState, action)).revertedWith(
      "cannot take action on a finalized state"
    );
  });

  it("It reverts the action if withdrawer signature is invalid", async () => {
    const initialState = await createInitialState();
    const action = await createAction();

    initialState.signatures[0] = await new ChannelSigner(
      bystanderSigningKey.privateKey
    ).signMessage(data);
    await expect(applyAction(initialState, action)).revertedWith(
      "invalid withdrawer signature"
    );
  });

  it("It reverts the action if counterparty signature is invalid", async () => {
    const initialState = await createInitialState();
    const action = await createAction();

    action.signature = await new ChannelSigner(
      bystanderSigningKey.privateKey
    ).signMessage(data);
    await expect(applyAction(initialState, action)).revertedWith(
      "invalid counterparty signature"
    );
  });
});
