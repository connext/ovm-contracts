import { BigNumber, BigNumberish, JsonRpcProvider } from "@connext/types";
import { toBN } from "@connext/utils";
import * as chai from "chai";
import { solidity, MockProvider } from "ethereum-waffle";
import { use } from "chai";
import { Wallet, utils } from "ethers";
const { addHandlerToProvider } = require("@eth-optimism/rollup-full-node");

const { parseEther } = utils;

export function mkXpub(prefix: string = "xpub"): string {
  return prefix.padEnd(111, "0");
}

export function mkAddress(prefix: string = "0x"): string {
  return prefix.padEnd(42, "0");
}

export function mkHash(prefix: string = "0x"): string {
  return prefix.padEnd(66, "0");
}

export function mkSig(prefix: string = "0x"): string {
  return prefix.padEnd(132, "0");
}

// ETH helpers
// NOTE: if using non-evm provider, make sure the accounts
// used here align with the funded accounts on the external
// provider
const MAX_INT = toBN(2).pow(256).sub(1);
const pks = Array(2)
  .fill(1)
  .map(() => Wallet.createRandom().privateKey);
const accounts = pks.map((secretKey) => {
  return { balance: MAX_INT.div(2).toString(), secretKey };
});
export const createProvider = async (): Promise<MockProvider> => {
  const mockProvider = new MockProvider({
    ganacheOptions: {
      accounts,
    },
  });
  let provider;
  if (process.env.MODE === "EVM") {
    return mockProvider;
  } else if (process.env.MODE === "OVM") {
    // Hack to get around ethers v5 provider issues with networkID
    // switching
    provider = await addHandlerToProvider(
      new JsonRpcProvider("http://localhost:8545", "any")
    );
  } else if (process.env.MODE === "ARBITRUM") {
    // FIXME: use a real URL
    provider = new JsonRpcProvider("http://localhost:8545", "any");
  }
  // add wallets from mock provider
  provider.getWallets = mockProvider.getWallets;
  return provider;
};
export const mineBlock = async (provider: MockProvider) =>
  await provider.send("evm_mine", []);
export const snapshot = async (provider: MockProvider) =>
  await provider.send("evm_snapshot", []);
export const restore = async (snapshotId: any, provider: MockProvider) =>
  await provider.send("evm_revert", [snapshotId]);

// TODO: Not sure this works correctly/reliably...
export const moveToBlock = async (
  blockNumber: BigNumberish,
  provider: MockProvider
) => {
  const desired: BigNumber = toBN(blockNumber);
  const current: BigNumber = toBN(await provider.getBlockNumber());
  if (current.gt(desired)) {
    throw new Error(
      `Already at block ${current.toNumber()}, cannot rewind to ${blockNumber.toString()}`
    );
  }
  if (current.eq(desired)) {
    return;
  }
  for (const _ of Array(desired.sub(current).toNumber())) {
    await mineBlock(provider);
  }
  const final: BigNumber = toBN(await provider.getBlockNumber());
  expect(final).to.be.eq(desired);
};

use(require("chai-subset"));
use(solidity);
export const expect = chai.use(solidity).expect;

// funds recipient with a given amount of eth from other provider accounts
export const fund = async (
  amount: BigNumber,
  recipient: Wallet,
  provider: MockProvider
) => {
  for (const wallet of await provider.getWallets()) {
    if (wallet.address === recipient.address) {
      continue;
    }
    const current = await provider.getBalance(recipient.address);
    const diff = amount.sub(current);
    if (diff.lte(0)) {
      // account has max int, done
      return;
    }
    const funderBalance = await provider.getBalance(wallet.address);
    // leave 1 eth in account for gas or w.e
    const fundAmount = funderBalance.sub(parseEther("1"));
    if (fundAmount.lte(0)) {
      // funder has insufficient funds, move on
      continue;
    }
    // send transaction
    await wallet.sendTransaction({
      to: recipient.address,
      value: fundAmount.gt(diff) ? diff : fundAmount,
    });
  }
  const final = await provider.getBalance(recipient.address);
  if (final.lt(amount)) {
    throw new Error(
      `Insufficient funds after funding to max. Off by: ${final
        .sub(amount)
        .abs()
        .toString()}`
    );
  }
};

export function sortByAddress(a: string, b: string) {
  return toBN(a).lt(toBN(b)) ? -1 : 1;
}

export function sortAddresses(addrs: string[]) {
  return addrs.sort(sortByAddress);
}
