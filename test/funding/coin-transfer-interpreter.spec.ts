import { getRandomAddress } from "@connext/utils";
import { Contract, Wallet } from "ethers";
import { AddressZero, One } from "ethers/constants";
import { BigNumber, defaultAbiCoder } from "ethers/utils";

import DolphinCoin from "../../artifacts/DolphinCoin.json";
import MultiAssetMultiPartyCoinTransferInterpreter from "../../artifacts/MultiAssetMultiPartyCoinTransferInterpreter.json";

import { expect, createProvider, OvmProvider } from "../utils";
const {
  getWallets,
  deployContract,
} = require("@eth-optimism/rollup-full-node");

type CoinTransfer = {
  to: string;
  amount: BigNumber;
};

function encodeParams(params: {
  limit: BigNumber[];
  tokenAddresses: string[];
}) {
  return defaultAbiCoder.encode(
    [`tuple(uint256[] limit, address[] tokenAddresses)`],
    [params]
  );
}

function encodeOutcome(state: CoinTransfer[][]) {
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
}

describe("MultiAssetMultiPartyCoinTransferInterpreter", () => {
  let wallet: Wallet;
  let token1: Contract;
  let token2: Contract;
  let multiAssetMultiPartyCoinTransferInterpreter: Contract;
  let provider: OvmProvider;

  async function interpretOutcomeAndExecuteEffect(
    state: CoinTransfer[][],
    params: { limit: BigNumber[]; tokenAddresses: string[] }
  ) {
    return multiAssetMultiPartyCoinTransferInterpreter.functions.interpretOutcomeAndExecuteEffect(
      encodeOutcome(state),
      encodeParams(params)
    );
  }

  async function getTotalAmountWithdrawn(assetId: string) {
    return multiAssetMultiPartyCoinTransferInterpreter.functions.totalAmountWithdrawn(
      assetId
    );
  }

  afterEach(() => {
    provider.closeOVM();
  });

  beforeEach(async () => {
    provider = await createProvider();
    wallet = getWallets(provider)[0];
    token1 = await deployContract(wallet, DolphinCoin, []);
    console.log(`deployed token1`, token1.address);
    token2 = await deployContract(wallet, DolphinCoin, []);
    console.log(`deployed token2`, token1.address);

    multiAssetMultiPartyCoinTransferInterpreter = await deployContract(
      wallet,
      MultiAssetMultiPartyCoinTransferInterpreter,
      []
    );
    console.log(
      `deployed interpreter`,
      multiAssetMultiPartyCoinTransferInterpreter.address
    );

    // fund interpreter with ERC20 tokenAddresses
    await token1.transfer(
      multiAssetMultiPartyCoinTransferInterpreter.address,
      new BigNumber(100)
    );
    console.log(`funded interpreter with token1`);

    // fund interpreter with ERC20 tokenAddresses
    await token2.transfer(
      multiAssetMultiPartyCoinTransferInterpreter.address,
      new BigNumber(100)
    );
    console.log(`funded interpreter with token2`);
  });

  it("Can distribute ERC20 coins correctly for one person", async () => {
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

  it("Can distribute ERC20 coins only correctly two people", async () => {
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

  it("Can distribute two types of ERC20 coins to one person", async () => {
    const to = getRandomAddress();
    const amount = One;
    const preAmountWithdrawnToken1 = await getTotalAmountWithdrawn(
      token1.address
    );
    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(
      token2.address
    );

    await interpretOutcomeAndExecuteEffect(
      [[{ to, amount }], [{ to, amount }]],
      {
        limit: [amount, amount],
        tokenAddresses: [token1.address, token2.address],
      }
    );

    expect(await token1.functions.balanceOf(to)).to.eq(One);
    expect(await token2.functions.balanceOf(to)).to.eq(One);
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken1.add(One)
    );
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(One)
    );
  });

  it("Can distribute a split of ERC20 coins to two people", async () => {
    const to1 = getRandomAddress();
    const amount1 = One;

    const to2 = getRandomAddress();
    const amount2 = One;

    const preAmountWithdrawnToken1 = await getTotalAmountWithdrawn(
      token1.address
    );
    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(
      token2.address
    );

    await interpretOutcomeAndExecuteEffect(
      [[{ to: to1, amount: amount1 }], [{ to: to2, amount: amount2 }]],
      {
        limit: [amount1, amount2],
        tokenAddresses: [token1.address, token2.address],
      }
    );

    expect(await token1.functions.balanceOf(to1)).to.eq(One);
    expect(await token2.functions.balanceOf(to2)).to.eq(One);
    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken1.add(One)
    );
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(One)
    );
  });

  it("Can distribute a mix of two ERC20 coins to two people", async () => {
    const to1 = getRandomAddress();
    const amount1 = One;

    const to2 = getRandomAddress();
    const amount2 = One;

    const preAmountWithdrawnToken1 = await getTotalAmountWithdrawn(
      token1.address
    );
    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(
      token2.address
    );

    await interpretOutcomeAndExecuteEffect(
      [
        [
          { to: to1, amount: amount1 },
          { to: to2, amount: amount2 },
        ],
        [
          { to: to1, amount: amount1 },
          { to: to2, amount: amount2 },
        ],
      ],
      {
        limit: [amount1.add(amount2), amount1.add(amount2)],
        tokenAddresses: [token1.address, token2.address],
      }
    );

    expect(await token1.functions.balanceOf(to1)).to.eq(One);
    expect(await token2.functions.balanceOf(to1)).to.eq(One);

    expect(await token1.functions.balanceOf(to2)).to.eq(One);
    expect(await token2.functions.balanceOf(to2)).to.eq(One);

    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken1.add(One).add(One)
    );
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(One).add(One)
    );
  });

  it("Can distribute a mix of ERC20 coins to an unorderded list of people", async () => {
    const to1 = getRandomAddress();
    const amount1 = One;

    const to2 = getRandomAddress();
    const amount2 = One;

    const preAmountWithdrawnToken1 = await getTotalAmountWithdrawn(
      token1.address
    );
    const preAmountWithdrawnToken2 = await getTotalAmountWithdrawn(AddressZero);

    await interpretOutcomeAndExecuteEffect(
      [
        [
          { to: to2, amount: amount2 },
          { to: to1, amount: amount1 },
        ],
        [
          { to: to1, amount: amount1 },
          { to: to2, amount: amount2 },
        ],
      ],
      {
        limit: [amount1.add(amount2), amount1.add(amount2)],
        tokenAddresses: [token1.address, token2.address],
      }
    );

    expect(await token2.functions.balanceOf(to1)).to.eq(One);
    expect(await token1.functions.balanceOf(to1)).to.eq(One);

    expect(await token2.functions.balanceOf(to2)).to.eq(One);
    expect(await token1.functions.balanceOf(to2)).to.eq(One);

    expect(await getTotalAmountWithdrawn(token1.address)).to.eq(
      preAmountWithdrawnToken1.add(One).add(One)
    );
    expect(await getTotalAmountWithdrawn(token2.address)).to.eq(
      preAmountWithdrawnToken2.add(One).add(One)
    );
  });
});
