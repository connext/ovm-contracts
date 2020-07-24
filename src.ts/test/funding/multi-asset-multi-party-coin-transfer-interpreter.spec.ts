import { getRandomAddress, toBN } from "@connext/utils";
import {
  BigNumber,
  Contract,
  Wallet,
  ContractFactory,
  constants,
  utils,
} from "ethers";

import {
  DolphinCoin,
  MultiAssetMultiPartyCoinTransferInterpreter,
} from "../../artifacts";

import { expect, createProvider } from "../utils";
import { MockProvider, deployContract } from "ethereum-waffle";

const { AddressZero, One, Two } = constants;
const { defaultAbiCoder } = utils;

const Three = BigNumber.from("3");
const Four = BigNumber.from("4");

type CoinTransfer = {
  to: string;
  amount: BigNumber;
};

const encodeParams = (params: {
  limit: BigNumber[];
  tokenAddresses: string[];
}) => {
  return defaultAbiCoder.encode(
    [`tuple(uint256[] limit, address[] tokenAddresses)`],
    [params]
  );
};

const encodeOutcome = (state: CoinTransfer[][]) => {
  return defaultAbiCoder.encode(
    [
      `
        tuple(
          address to,
          uint256 amount
        )[][]
      `,
    ],
    [state]
  );
};

describe("MultiAssetMultiPartyCoinTransferInterpreter", () => {
  let wallet: Wallet;
  let provider: MockProvider;
  let token1: Contract;
  let token2: Contract;
  let multiAssetMultiPartyCoinTransferInterpreter: Contract;

  const interpretOutcomeAndExecuteEffect = async (
    state: CoinTransfer[][],
    params: { limit: BigNumber[]; tokenAddresses: string[] }
  ) => {
    return multiAssetMultiPartyCoinTransferInterpreter.interpretOutcomeAndExecuteEffect(
      encodeOutcome(state),
      encodeParams(params)
    );
  };

  const getTotalAmountWithdrawn = async (assetId: string) => {
    return multiAssetMultiPartyCoinTransferInterpreter.totalAmountWithdrawn(
      assetId
    );
  };

  beforeEach(async () => {
    // const DOLPHINCOIN_SUPPLY = toBN(10).pow(18).mul(10000);
    provider = await createProvider();
    wallet = (await provider.getWallets())[0];
    token1 = await deployContract(wallet, DolphinCoin, []);
    token2 = await deployContract(wallet, DolphinCoin, []);

    multiAssetMultiPartyCoinTransferInterpreter = await deployContract(
      wallet,
      MultiAssetMultiPartyCoinTransferInterpreter,
      []
    );

    // fund interpreter with ERC20 tokens
    await token1.transfer(
      multiAssetMultiPartyCoinTransferInterpreter.address,
      token1.balanceOf(wallet.address)
    );

    await token2.transfer(
      multiAssetMultiPartyCoinTransferInterpreter.address,
      token2.balanceOf(wallet.address)
    );
  });

  it("Can distribute ERC20 coins only correctly to one person", async () => {
    const to = getRandomAddress();
    const amount = One;
    const preAmountWithdrawn = await getTotalAmountWithdrawn(token1.address);

    await interpretOutcomeAndExecuteEffect([[{ to, amount }]], {
      limit: [amount],
      tokenAddresses: [token1.address],
    });

    expect(await token1.functions.balanceOf(to)).to.eq(One);
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawn.add(One)
    );
  });

  it("Can distribute ERC20 coins only correctly to two people", async () => {
    const to1 = getRandomAddress();
    const amount1 = One;

    const to2 = getRandomAddress();
    const amount2 = One;

    const preAmountWithdrawn = await getTotalAmountWithdrawn(token1.address);

    await interpretOutcomeAndExecuteEffect(
      [
        [
          { to: to1, amount: amount1 },
          { to: to2, amount: amount2 },
        ],
      ],
      {
        limit: [amount1.add(amount2)],
        tokenAddresses: [token1.address],
      }
    );

    expect(await token1.functions.balanceOf(to1)).to.eq(One);
    expect(await token1.functions.balanceOf(to2)).to.eq(One);
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawn.add(One).add(One)
    );
  });

  it("Can distribute two different ERC20 coins to one person", async () => {
    const to = getRandomAddress();
    const amountToken2 = One;
    const amountToken = Two;
    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(
      token2.address
    );
    const preAmountWithdrawnToken = await getTotalAmountWithdrawn(
      token1.address
    );

    await interpretOutcomeAndExecuteEffect(
      [[{ to, amount: amountToken2 }], [{ to, amount: amountToken }]],
      {
        limit: [amountToken2, amountToken],
        tokenAddresses: [token2.address, token1.address],
      }
    );

    expect(await token2.balanceOf(to)).to.eq(amountToken2);
    expect(await token1.balanceOf(to)).to.eq(amountToken);
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(amountToken2)
    );
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken.add(amountToken)
    );
  });

  it("Can distribute a split of ERC20 coins to two people", async () => {
    const to1 = getRandomAddress();
    const amount1Token = One;

    const to2 = getRandomAddress();
    const amount2Token = Two;

    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(
      token2.address
    );
    const preAmountWithdrawnToken = await getTotalAmountWithdrawn(
      token1.address
    );

    await interpretOutcomeAndExecuteEffect(
      [
        [{ to: to1, amount: amount1Token }],
        [{ to: to2, amount: amount2Token }],
      ],
      {
        limit: [amount1Token, amount2Token],
        tokenAddresses: [token2.address, token1.address],
      }
    );

    expect(await token2.balanceOf(to1)).to.eq(amount1Token);
    expect(await token1.balanceOf(to2)).to.eq(amount2Token);
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(amount1Token)
    );
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken.add(amount2Token)
    );
  });

  it("Can distribute a mix of ERC20 coins to two people", async () => {
    const to1 = getRandomAddress();
    const amount1Token2 = One;
    const amount1Token = Two;

    const to2 = getRandomAddress();
    const amount2Token2 = Three;
    const amount2Token = Four;

    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(AddressZero);
    const preAmountWithdrawnToken = await getTotalAmountWithdrawn(
      token1.address
    );

    await interpretOutcomeAndExecuteEffect(
      [
        [
          { to: to1, amount: amount1Token2 },
          { to: to2, amount: amount2Token2 },
        ],
        [
          { to: to1, amount: amount1Token },
          { to: to2, amount: amount2Token },
        ],
      ],
      {
        limit: [
          amount1Token2.add(amount2Token2),
          amount1Token.add(amount2Token),
        ],
        tokenAddresses: [token2.address, token1.address],
      }
    );

    expect(await token2.balanceOf(to1)).to.eq(amount1Token2);
    expect(await token1.balanceOf(to1)).to.eq(amount1Token);

    expect(await token2.balanceOf(to2)).to.eq(amount2Token2);
    expect(await token1.balanceOf(to2)).to.eq(amount2Token);

    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(amount1Token2).add(amount2Token2)
    );
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken.add(amount1Token).add(amount2Token)
    );
  });

  it("Can distribute a mix of ERC20 coins to an unorderded list of people", async () => {
    const to1 = getRandomAddress();
    const amount1Token2 = One;
    const amount1Token = Two;

    const to2 = getRandomAddress();
    const amount2Token2 = Three;
    const amount2Token = Four;

    const preAmountWithdrawnEth = await getTotalAmountWithdrawn(token2.address);
    const preAmountWithdrawnToken = await getTotalAmountWithdrawn(
      token1.address
    );

    await interpretOutcomeAndExecuteEffect(
      [
        [
          { to: to2, amount: amount2Token2 },
          { to: to1, amount: amount1Token2 },
        ],
        [
          { to: to1, amount: amount1Token },
          { to: to2, amount: amount2Token },
        ],
      ],
      {
        limit: [
          amount1Token2.add(amount2Token2),
          amount1Token.add(amount2Token),
        ],
        tokenAddresses: [token2.address, token1.address],
      }
    );

    expect(await token2.balanceOf(to1)).to.eq(amount1Token2);
    expect(await token1.balanceOf(to1)).to.eq(amount1Token);

    expect(await token2.balanceOf(to2)).to.eq(amount2Token2);
    expect(await token1.balanceOf(to2)).to.eq(amount2Token);

    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnEth.add(amount1Token2).add(amount2Token2)
    );
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken.add(amount1Token).add(amount2Token)
    );
  });
});
