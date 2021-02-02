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

interface CmcAssetInterface extends ethers.utils.Interface {
  functions: {
    "exit(address,address,address)": FunctionFragment;
    "getAlice()": FunctionFragment;
    "getBob()": FunctionFragment;
    "getExitableAmount(address,address)": FunctionFragment;
    "getTotalTransferred(address)": FunctionFragment;
    "lock()": FunctionFragment;
    "setup(address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "exit",
    values: [string, string, string]
  ): string;
  encodeFunctionData(functionFragment: "getAlice", values?: undefined): string;
  encodeFunctionData(functionFragment: "getBob", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getExitableAmount",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalTransferred",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "lock", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setup",
    values: [string, string]
  ): string;

  decodeFunctionResult(functionFragment: "exit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getAlice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBob", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getExitableAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalTransferred",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lock", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setup", data: BytesLike): Result;

  events: {};
}

export class CmcAsset extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: CmcAssetInterface;

  functions: {
    exit(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "exit(address,address,address)"(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getAlice(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getAlice()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getBob(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getBob()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getExitableAmount(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "getExitableAmount(address,address)"(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    getTotalTransferred(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "getTotalTransferred(address)"(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    lock(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "lock()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    setup(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setup(address,address)"(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  exit(
    assetId: string,
    owner: string,
    recipient: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "exit(address,address,address)"(
    assetId: string,
    owner: string,
    recipient: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getAlice(overrides?: CallOverrides): Promise<string>;

  "getAlice()"(overrides?: CallOverrides): Promise<string>;

  getBob(overrides?: CallOverrides): Promise<string>;

  "getBob()"(overrides?: CallOverrides): Promise<string>;

  getExitableAmount(
    assetId: string,
    owner: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getExitableAmount(address,address)"(
    assetId: string,
    owner: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTotalTransferred(
    assetId: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getTotalTransferred(address)"(
    assetId: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  lock(overrides?: CallOverrides): Promise<BigNumber>;

  "lock()"(overrides?: CallOverrides): Promise<BigNumber>;

  setup(
    _alice: string,
    _bob: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setup(address,address)"(
    _alice: string,
    _bob: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    exit(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "exit(address,address,address)"(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getAlice(overrides?: CallOverrides): Promise<string>;

    "getAlice()"(overrides?: CallOverrides): Promise<string>;

    getBob(overrides?: CallOverrides): Promise<string>;

    "getBob()"(overrides?: CallOverrides): Promise<string>;

    getExitableAmount(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getExitableAmount(address,address)"(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalTransferred(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTotalTransferred(address)"(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lock(overrides?: CallOverrides): Promise<BigNumber>;

    "lock()"(overrides?: CallOverrides): Promise<BigNumber>;

    setup(
      _alice: string,
      _bob: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setup(address,address)"(
      _alice: string,
      _bob: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    exit(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "exit(address,address,address)"(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getAlice(overrides?: CallOverrides): Promise<BigNumber>;

    "getAlice()"(overrides?: CallOverrides): Promise<BigNumber>;

    getBob(overrides?: CallOverrides): Promise<BigNumber>;

    "getBob()"(overrides?: CallOverrides): Promise<BigNumber>;

    getExitableAmount(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getExitableAmount(address,address)"(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalTransferred(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTotalTransferred(address)"(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lock(overrides?: CallOverrides): Promise<BigNumber>;

    "lock()"(overrides?: CallOverrides): Promise<BigNumber>;

    setup(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setup(address,address)"(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    exit(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "exit(address,address,address)"(
      assetId: string,
      owner: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getAlice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getAlice()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getBob(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getBob()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getExitableAmount(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getExitableAmount(address,address)"(
      assetId: string,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTotalTransferred(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTotalTransferred(address)"(
      assetId: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lock(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "lock()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setup(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setup(address,address)"(
      _alice: string,
      _bob: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}