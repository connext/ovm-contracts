/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface FailingTokenInterface extends ethers.utils.Interface {
  functions: {
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "burn(address,uint256)": FunctionFragment;
    "decimals()": FunctionFragment;
    "decreaseAllowance(address,uint256)": FunctionFragment;
    "increaseAllowance(address,uint256)": FunctionFragment;
    "mint(address,uint256)": FunctionFragment;
    "name()": FunctionFragment;
    "rejectEther()": FunctionFragment;
    "setRejectEther(bool)": FunctionFragment;
    "setTransferShouldFail(bool)": FunctionFragment;
    "setTransferShouldRevert(bool)": FunctionFragment;
    "succeedingTransfer(address,uint256)": FunctionFragment;
    "symbol()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
    "transferShouldFail()": FunctionFragment;
    "transferShouldRevert()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "allowance",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "decreaseAllowance",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseAllowance",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "rejectEther",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setRejectEther",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setTransferShouldFail",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setTransferShouldRevert",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "succeedingTransfer",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferShouldFail",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferShouldRevert",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decreaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rejectEther",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRejectEther",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTransferShouldFail",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTransferShouldRevert",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "succeedingTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferShouldFail",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferShouldRevert",
    data: BytesLike
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}

export class FailingToken extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: FailingTokenInterface;

  functions: {
    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "allowance(address,address)"(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "approve(address,uint256)"(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    balanceOf(
      account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    burn(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "burn(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    decimals(
      overrides?: CallOverrides
    ): Promise<{
      0: number;
    }>;

    "decimals()"(
      overrides?: CallOverrides
    ): Promise<{
      0: number;
    }>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "decreaseAllowance(address,uint256)"(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "increaseAllowance(address,uint256)"(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    mint(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "mint(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    name(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "name()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    rejectEther(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "rejectEther()"(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    setRejectEther(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setRejectEther(bool)"(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setTransferShouldFail(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setTransferShouldFail(bool)"(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setTransferShouldRevert(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setTransferShouldRevert(bool)"(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    succeedingTransfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "succeedingTransfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    symbol(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "symbol()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    totalSupply(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "totalSupply()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferFrom(address,address,uint256)"(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    transferShouldFail(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "transferShouldFail()"(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    transferShouldRevert(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "transferShouldRevert()"(
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;
  };

  allowance(
    owner: string,
    spender: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "allowance(address,address)"(
    owner: string,
    spender: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  approve(
    spender: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "approve(address,uint256)"(
    spender: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "balanceOf(address)"(
    account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  burn(
    account: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "burn(address,uint256)"(
    account: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  decimals(overrides?: CallOverrides): Promise<number>;

  "decimals()"(overrides?: CallOverrides): Promise<number>;

  decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "decreaseAllowance(address,uint256)"(
    spender: string,
    subtractedValue: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  increaseAllowance(
    spender: string,
    addedValue: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "increaseAllowance(address,uint256)"(
    spender: string,
    addedValue: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  mint(
    account: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "mint(address,uint256)"(
    account: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  "name()"(overrides?: CallOverrides): Promise<string>;

  rejectEther(overrides?: CallOverrides): Promise<boolean>;

  "rejectEther()"(overrides?: CallOverrides): Promise<boolean>;

  setRejectEther(
    _rejectEther: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setRejectEther(bool)"(
    _rejectEther: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setTransferShouldFail(
    _transferShouldFail: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setTransferShouldFail(bool)"(
    _transferShouldFail: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setTransferShouldRevert(
    _transferShouldRevert: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setTransferShouldRevert(bool)"(
    _transferShouldRevert: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  succeedingTransfer(
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "succeedingTransfer(address,uint256)"(
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  symbol(overrides?: CallOverrides): Promise<string>;

  "symbol()"(overrides?: CallOverrides): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transfer(address,uint256)"(
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  transferFrom(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferFrom(address,address,uint256)"(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  transferShouldFail(overrides?: CallOverrides): Promise<boolean>;

  "transferShouldFail()"(overrides?: CallOverrides): Promise<boolean>;

  transferShouldRevert(overrides?: CallOverrides): Promise<boolean>;

  "transferShouldRevert()"(overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "allowance(address,address)"(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "approve(address,uint256)"(
      spender: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    burn(
      account: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "burn(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    decimals(overrides?: CallOverrides): Promise<number>;

    "decimals()"(overrides?: CallOverrides): Promise<number>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "decreaseAllowance(address,uint256)"(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "increaseAllowance(address,uint256)"(
      spender: string,
      addedValue: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    mint(
      account: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "mint(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    name(overrides?: CallOverrides): Promise<string>;

    "name()"(overrides?: CallOverrides): Promise<string>;

    rejectEther(overrides?: CallOverrides): Promise<boolean>;

    "rejectEther()"(overrides?: CallOverrides): Promise<boolean>;

    setRejectEther(
      _rejectEther: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "setRejectEther(bool)"(
      _rejectEther: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    setTransferShouldFail(
      _transferShouldFail: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "setTransferShouldFail(bool)"(
      _transferShouldFail: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    setTransferShouldRevert(
      _transferShouldRevert: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "setTransferShouldRevert(bool)"(
      _transferShouldRevert: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    succeedingTransfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "succeedingTransfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    symbol(overrides?: CallOverrides): Promise<string>;

    "symbol()"(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "transfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "transferFrom(address,address,uint256)"(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferShouldFail(overrides?: CallOverrides): Promise<boolean>;

    "transferShouldFail()"(overrides?: CallOverrides): Promise<boolean>;

    transferShouldRevert(overrides?: CallOverrides): Promise<boolean>;

    "transferShouldRevert()"(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    Approval(
      owner: string | null,
      spender: string | null,
      value: null
    ): EventFilter;

    Transfer(from: string | null, to: string | null, value: null): EventFilter;
  };

  estimateGas: {
    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "allowance(address,address)"(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "approve(address,uint256)"(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    burn(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "burn(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    "decimals()"(overrides?: CallOverrides): Promise<BigNumber>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "decreaseAllowance(address,uint256)"(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "increaseAllowance(address,uint256)"(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    mint(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "mint(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    "name()"(overrides?: CallOverrides): Promise<BigNumber>;

    rejectEther(overrides?: CallOverrides): Promise<BigNumber>;

    "rejectEther()"(overrides?: CallOverrides): Promise<BigNumber>;

    setRejectEther(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setRejectEther(bool)"(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setTransferShouldFail(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setTransferShouldFail(bool)"(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setTransferShouldRevert(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setTransferShouldRevert(bool)"(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    succeedingTransfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "succeedingTransfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    "symbol()"(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferFrom(address,address,uint256)"(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    transferShouldFail(overrides?: CallOverrides): Promise<BigNumber>;

    "transferShouldFail()"(overrides?: CallOverrides): Promise<BigNumber>;

    transferShouldRevert(overrides?: CallOverrides): Promise<BigNumber>;

    "transferShouldRevert()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "allowance(address,address)"(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "approve(address,uint256)"(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    balanceOf(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    burn(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "burn(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "decimals()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "decreaseAllowance(address,uint256)"(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "increaseAllowance(address,uint256)"(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    mint(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "mint(address,uint256)"(
      account: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "name()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rejectEther(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "rejectEther()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setRejectEther(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setRejectEther(bool)"(
      _rejectEther: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setTransferShouldFail(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setTransferShouldFail(bool)"(
      _transferShouldFail: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setTransferShouldRevert(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setTransferShouldRevert(bool)"(
      _transferShouldRevert: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    succeedingTransfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "succeedingTransfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "symbol()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "totalSupply()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transfer(address,uint256)"(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferFrom(address,address,uint256)"(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    transferShouldFail(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "transferShouldFail()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferShouldRevert(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "transferShouldRevert()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}