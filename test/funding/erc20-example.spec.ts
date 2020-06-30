/* global before */
import { Contract, Wallet } from "ethers";
import { bigNumberify } from "ethers/utils";

import DolphinCoin from "../../artifacts/DolphinCoin.json";

import { expect, createProvider, OvmProvider } from "../utils";
const {
  getWallets,
  deployContract,
} = require("@eth-optimism/rollup-full-node");

// parameters to use for our test coin
const DOLPHINCOIN_SUPPLY = bigNumberify(10).pow(18).mul(10000);

describe("DolphinCoin (ERC20) can be created", () => {
  let wallet: Wallet;
  let erc20: Contract;
  let provider: OvmProvider;

  before(async () => {
    provider = await createProvider();
    wallet = await getWallets(provider)[0];
    erc20 = await deployContract(wallet, DolphinCoin, []);
  });

  after(async () => {
    provider.closeOVM();
  });

  it("Initial supply for deployer is DOLPHINCOIN_SUPPLY", async () => {
    expect(await erc20.functions.balanceOf(wallet.address)).to.be.eq(
      DOLPHINCOIN_SUPPLY
    );
  });

  it("should transfer successfully", async () => {
    // Get transfer info
    const recipient = (await getWallets(provider))[1];
    const transferAmount = DOLPHINCOIN_SUPPLY.div(4);

    // Get pre-transfer balances
    const preTransferSender = await erc20.functions.balanceOf(wallet.address);
    const preTransferReceiver = await erc20.functions.balanceOf(
      recipient.address
    );

    // Perform transfer
    await erc20.transfer(recipient.address, transferAmount);

    // Verify post-transfer balances
    const postTransferSender = await erc20.functions.balanceOf(wallet.address);
    const postTransferReceiver = await erc20.functions.balanceOf(
      recipient.address
    );
    expect(postTransferSender).to.be.eq(preTransferSender.sub(transferAmount));
    expect(postTransferReceiver).to.be.eq(
      preTransferReceiver.add(transferAmount)
    );
  });
});
