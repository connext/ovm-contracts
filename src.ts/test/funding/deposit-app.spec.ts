/* global before */
import {
  CoinTransfer,
  singleAssetTwoPartyCoinTransferEncoding,
  DepositAppState,
  DepositAppStateEncoding,
} from "@connext/types";
import {
  BigNumber,
  Wallet,
  ContractFactory,
  Contract,
  constants,
  utils,
} from "ethers";

import { DepositApp, DelegateProxy, DolphinCoin } from "../../artifacts";

import { expect, createProvider } from "../utils";
import { MockProvider, deployContract } from "ethereum-waffle";

const { Zero, AddressZero } = constants;
const { defaultAbiCoder } = utils;

const MAX_INT = BigNumber.from(2).pow(256).sub(1);

const decodeTransfers = (encodedTransfers: string): CoinTransfer[] =>
  defaultAbiCoder.decode(
    [singleAssetTwoPartyCoinTransferEncoding],
    encodedTransfers
  )[0];

const encodeAppState = (
  state: DepositAppState,
  onlyCoinTransfers: boolean = false
): string => {
  if (!onlyCoinTransfers) {
    return defaultAbiCoder.encode([DepositAppStateEncoding], [state]);
  }
  return defaultAbiCoder.encode(
    [singleAssetTwoPartyCoinTransferEncoding],
    [state.transfers]
  );
};

describe("DepositApp", () => {
  let provider: MockProvider;
  let wallet: Wallet;
  let depositApp: Contract;
  let proxy: Contract;
  let erc20: Contract;

  const depositorWallet = Wallet.createRandom();
  const counterpartyWallet = Wallet.createRandom();

  before(async () => {
    provider = await createProvider();
    wallet = (await provider.getWallets())[0];

    depositApp = await deployContract(wallet, DepositApp, []);

    erc20 = (await deployContract(wallet, DolphinCoin, [MAX_INT])).connect(
      wallet
    );

    proxy = await deployContract(wallet, DelegateProxy, []);
  });

  const computeOutcome = async (state: DepositAppState): Promise<string> => {
    return depositApp.computeOutcome(encodeAppState(state));
  };

  const createInitialState = async (
    assetId: string
  ): Promise<DepositAppState> => {
    return {
      transfers: [
        {
          amount: Zero,
          to: depositorWallet.address,
        },
        {
          amount: Zero,
          to: counterpartyWallet.address,
        },
      ],
      multisigAddress: proxy.address,
      assetId,
      startingTotalAmountWithdrawn: await getTotalAmountWithdrawn(assetId),
      startingMultisigBalance: await getMultisigBalance(assetId),
    };
  };

  const getMultisigBalance = async (assetId: string): Promise<BigNumber> => {
    return assetId === AddressZero
      ? await provider.getBalance(proxy.address)
      : await erc20.balanceOf(proxy.address);
  };

  const getTotalAmountWithdrawn = async (
    assetId: string
  ): Promise<BigNumber> => {
    return proxy.totalAmountWithdrawn(assetId);
  };

  const deposit = async (assetId: string, amount: BigNumber): Promise<void> => {
    const preDepositValue = await getMultisigBalance(assetId);
    if (assetId === AddressZero) {
      const tx = await wallet.sendTransaction({
        value: amount,
        to: proxy.address,
      });
      expect(tx.hash).to.exist;
    } else {
      const tx = await erc20.transfer(proxy.address, amount);
      expect(tx.hash).to.exist;
    }
    expect(await getMultisigBalance(assetId)).to.be.eq(
      preDepositValue.add(amount)
    );
  };

  const withdraw = async (
    assetId: string,
    amount: BigNumber
  ): Promise<void> => {
    await proxy.withdraw(assetId, wallet.address, amount);
  };

  const validateOutcomes = async (
    params: {
      assetId: string;
      outcome: string;
      initialState: DepositAppState;
      deposit: BigNumber;
      withdrawal?: BigNumber;
    }[]
  ): Promise<void> => {
    for (const param of params) {
      const { outcome, initialState, deposit, withdrawal } = param;
      await validateOutcome(outcome, initialState, deposit, withdrawal);
    }
  };

  const validateOutcome = async (
    outcome: string,
    initialState: DepositAppState,
    amountDeposited: BigNumber,
    amountWithdrawn: BigNumber = Zero
  ): Promise<void> => {
    const decoded = decodeTransfers(outcome);
    expect(decoded[0].to).eq(initialState.transfers[0].to);
    expect(decoded[0].amount).eq(amountDeposited);
    expect(decoded[1].to).eq(initialState.transfers[1].to);
    expect(decoded[1].amount).eq(Zero);
    const multisigBalance = await getMultisigBalance(initialState.assetId);
    expect(multisigBalance).to.be.eq(
      initialState.startingMultisigBalance
        .add(amountDeposited)
        .sub(amountWithdrawn)
    );
  };

  it("Correctly calculates deposit amount for tokens", async () => {
    const assetId = erc20.address;
    const amount = BigNumber.from(10000);
    const initialState = await createInitialState(assetId);

    await deposit(assetId, amount);

    const outcome = await computeOutcome(initialState);
    await validateOutcome(outcome, initialState, amount);
  });

  it("Correctly calculates deposit amount for token with token withdraw", async () => {
    const assetId = erc20.address;
    const amount = BigNumber.from(10000);
    const initialState = await createInitialState(assetId);

    await deposit(assetId, amount);
    await withdraw(assetId, amount.div(2));

    const outcome = await computeOutcome(initialState);
    await validateOutcome(outcome, initialState, amount, amount.div(2));
  });

  it("Correctly calculates deposit amount for token with token withdraw > deposit (should underflow)", async () => {
    const assetId = erc20.address;
    const amount = BigNumber.from(10000);
    // setup multisig with some initial balance
    await deposit(assetId, amount);

    const initialState = await createInitialState(assetId);
    await deposit(assetId, amount);
    await withdraw(assetId, amount.mul(2));

    const outcome = await computeOutcome(initialState);
    await validateOutcome(outcome, initialState, amount, amount.mul(2));
  });

  it("Correctly calculates deposit amount for token total withdraw overflow", async () => {
    const assetId = erc20.address;
    const amount = BigNumber.from(10000);
    // setup multisig with correct total withdraw
    await deposit(assetId, MAX_INT.div(4));
    await withdraw(assetId, MAX_INT.div(4));
    await deposit(assetId, MAX_INT.div(4));
    await withdraw(assetId, MAX_INT.div(4));
    await deposit(assetId, MAX_INT.div(4).add(1000));
    await withdraw(assetId, MAX_INT.div(4).add(1000));
    await deposit(assetId, MAX_INT.div(4));

    // check that one more will overflow
    expect(
      (await getTotalAmountWithdrawn(assetId)).gt(
        MAX_INT.sub(MAX_INT.div(4).sub(1))
      )
    );

    const initialState = await createInitialState(assetId);
    await withdraw(assetId, MAX_INT.div(4).sub(1)); // should overflow
    await deposit(assetId, MAX_INT.div(4));

    const outcome = await computeOutcome(initialState);
    await validateOutcome(
      outcome,
      initialState,
      MAX_INT.div(4),
      MAX_INT.div(4).sub(1)
    );
    await withdraw(assetId, MAX_INT.div(4)); // do this so we get funds back for next test
  });

  it("Correctly calculates deposit amount for token total withdraw overflow AND expression underflow", async () => {
    const assetId = erc20.address;
    const amount = BigNumber.from(10000);
    // setup multisig with correct total withdraw
    await deposit(assetId, MAX_INT.div(4));
    await withdraw(assetId, MAX_INT.div(4));
    await deposit(assetId, MAX_INT.div(4));
    await withdraw(assetId, MAX_INT.div(4));
    await deposit(assetId, MAX_INT.div(4).add(1000));
    await withdraw(assetId, MAX_INT.div(4).add(1000));
    await deposit(assetId, MAX_INT.div(4));

    // check that one more will overflow
    expect(
      (await getTotalAmountWithdrawn(assetId)).gt(MAX_INT.sub(MAX_INT.div(4)))
    );

    const initialState = await createInitialState(assetId);
    await withdraw(assetId, MAX_INT.div(4)); // should overflow
    await deposit(assetId, amount);

    const outcome = await computeOutcome(initialState);
    await validateOutcome(outcome, initialState, amount, MAX_INT.div(4));
  });
});
