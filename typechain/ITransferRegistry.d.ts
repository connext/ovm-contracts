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

interface ITransferRegistryInterface extends ethers.utils.Interface {
  functions: {
    "addTransferDefinition(tuple)": FunctionFragment;
    "getTransferDefinitions()": FunctionFragment;
    "removeTransferDefinition(string)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addTransferDefinition",
    values: [
      {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getTransferDefinitions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeTransferDefinition",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "addTransferDefinition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTransferDefinitions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeTransferDefinition",
    data: BytesLike
  ): Result;

  events: {
    "TransferAdded(tuple)": EventFragment;
    "TransferRemoved(tuple)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TransferAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferRemoved"): EventFragment;
}

export class ITransferRegistry extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ITransferRegistryInterface;

  functions: {
    addTransferDefinition(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "addTransferDefinition(tuple)"(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getTransferDefinitions(
      overrides?: CallOverrides
    ): Promise<{
      0: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: string;
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
      }[];
    }>;

    "getTransferDefinitions()"(
      overrides?: CallOverrides
    ): Promise<{
      0: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: string;
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
      }[];
    }>;

    removeTransferDefinition(
      name: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "removeTransferDefinition(string)"(
      name: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  addTransferDefinition(
    transfer: {
      name: string;
      definition: string;
      stateEncoding: string;
      resolverEncoding: string;
      encodedCancel: BytesLike;
    },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "addTransferDefinition(tuple)"(
    transfer: {
      name: string;
      definition: string;
      stateEncoding: string;
      resolverEncoding: string;
      encodedCancel: BytesLike;
    },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getTransferDefinitions(
    overrides?: CallOverrides
  ): Promise<
    {
      name: string;
      definition: string;
      stateEncoding: string;
      resolverEncoding: string;
      encodedCancel: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }[]
  >;

  "getTransferDefinitions()"(
    overrides?: CallOverrides
  ): Promise<
    {
      name: string;
      definition: string;
      stateEncoding: string;
      resolverEncoding: string;
      encodedCancel: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }[]
  >;

  removeTransferDefinition(
    name: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "removeTransferDefinition(string)"(
    name: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    addTransferDefinition(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    "addTransferDefinition(tuple)"(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    getTransferDefinitions(
      overrides?: CallOverrides
    ): Promise<
      {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: string;
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
      }[]
    >;

    "getTransferDefinitions()"(
      overrides?: CallOverrides
    ): Promise<
      {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: string;
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
      }[]
    >;

    removeTransferDefinition(
      name: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "removeTransferDefinition(string)"(
      name: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    TransferAdded(transfer: null): EventFilter;

    TransferRemoved(transfer: null): EventFilter;
  };

  estimateGas: {
    addTransferDefinition(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<BigNumber>;

    "addTransferDefinition(tuple)"(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<BigNumber>;

    getTransferDefinitions(overrides?: CallOverrides): Promise<BigNumber>;

    "getTransferDefinitions()"(overrides?: CallOverrides): Promise<BigNumber>;

    removeTransferDefinition(
      name: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "removeTransferDefinition(string)"(
      name: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addTransferDefinition(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "addTransferDefinition(tuple)"(
      transfer: {
        name: string;
        definition: string;
        stateEncoding: string;
        resolverEncoding: string;
        encodedCancel: BytesLike;
      },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getTransferDefinitions(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTransferDefinitions()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    removeTransferDefinition(
      name: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "removeTransferDefinition(string)"(
      name: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}