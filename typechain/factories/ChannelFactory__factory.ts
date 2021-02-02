/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ChannelFactory } from "../ChannelFactory";

export class ChannelFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _mastercopy: string,
    _chainId: BigNumberish,
    overrides?: Overrides
  ): Promise<ChannelFactory> {
    return super.deploy(
      _mastercopy,
      _chainId,
      overrides || {}
    ) as Promise<ChannelFactory>;
  }
  getDeployTransaction(
    _mastercopy: string,
    _chainId: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_mastercopy, _chainId, overrides || {});
  }
  attach(address: string): ChannelFactory {
    return super.attach(address) as ChannelFactory;
  }
  connect(signer: Signer): ChannelFactory__factory {
    return super.connect(signer) as ChannelFactory__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ChannelFactory {
    return new Contract(address, _abi, signerOrProvider) as ChannelFactory;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_mastercopy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "channel",
        type: "address",
      },
    ],
    name: "ChannelCreation",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "alice",
        type: "address",
      },
      {
        internalType: "address",
        name: "bob",
        type: "address",
      },
    ],
    name: "createChannel",
    outputs: [
      {
        internalType: "address",
        name: "channel",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "alice",
        type: "address",
      },
      {
        internalType: "address",
        name: "bob",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createChannelAndDepositAlice",
    outputs: [
      {
        internalType: "address",
        name: "channel",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "alice",
        type: "address",
      },
      {
        internalType: "address",
        name: "bob",
        type: "address",
      },
    ],
    name: "getChannelAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMastercopy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProxyCreationCode",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStoredChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60c060405234801561001057600080fd5b50604051610c2f380380610c2f83398101604081905261002f916100eb565b6001600160601b0319606083901b1660805260a081905261004f82610062565b8051602090910120600055506101909050565b60606040518060400160405280601481526020017f3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000815250826040518060400160405280600f81526020016e5af43d82803e903d91602b57fd5bf360881b8152506040516020016100d59392919061015c565b6040516020818303038152906040529050919050565b600080604083850312156100fd578182fd5b82516001600160a01b0381168114610113578283fd5b6020939093015192949293505050565b60008151815b818110156101435760208185018101518683015201610129565b818111156101515782828601525b509290920192915050565b60006101688286610123565b606085901b6001600160601b03191681526101866014820185610123565b9695505050505050565b60805160601c60a051610a6f6101c06000398061017e52806101a452508061015352806102a45250610a6f6000f3fe6080604052600436106100705760003560e01c806335a1ba6f1161004e57806335a1ba6f146100d7578063e617aaac14610104578063efe4369314610124578063fe4545011461013957610070565b806315727e911461007557806332a130c9146100a05780633408e470146100c2575b600080fd5b34801561008157600080fd5b5061008a61014c565b60405161009791906108ad565b60405180910390f35b3480156100ac57600080fd5b506100b561017c565b6040516100979190610a00565b3480156100ce57600080fd5b506100b56101a0565b3480156100e357600080fd5b506100f76100f23660046106e6565b6101d8565b6040516100979190610842565b34801561011057600080fd5b506100f761011f3660046106e6565b610284565b34801561013057600080fd5b506100f76102a2565b6100f7610147366004610718565b6102c6565b60606101777f00000000000000000000000000000000000000000000000000000000000000006103a3565b905090565b7f000000000000000000000000000000000000000000000000000000000000000090565b60007f0000000000000000000000000000000000000000000000000000000000000000806101d0574691506101d4565b8091505b5090565b60006101e48383610424565b604051632d34ba7960e01b81529091506001600160a01b03821690632d34ba79906102159086908690600401610856565b600060405180830381600087803b15801561022f57600080fd5b505af1158015610243573d6000803e3d6000fd5b505050507fa79ba8cc5fdc29196c8d65701a02433c92328f38f0ffbea3908335b80d81409d816040516102769190610842565b60405180910390a192915050565b600061029b610293848461044e565b60005461048a565b9392505050565b7f000000000000000000000000000000000000000000000000000000000000000090565b60006102d285856101d8565b90506102dd83610497565b610339576102ed833330856104a4565b6103125760405162461bcd60e51b8152600401610309906109bb565b60405180910390fd5b61031d8382846104f7565b6103395760405162461bcd60e51b815260040161030990610977565b60405163635ae90160e01b81526001600160a01b0382169063635ae9019034906103699087908790600401610894565b6000604051808303818588803b15801561038257600080fd5b505af1158015610396573d6000803e3d6000fd5b5050505050949350505050565b6060604051806040016040528060148152602001733d602d80600a3d3981f3363d3d373d3d3d363d7360601b815250826040518060400160405280600f81526020016e5af43d82803e903d91602b57fd5bf360881b81525060405160200161040d939291906107fb565b60405160208183030381529060405290505b919050565b600080610431848461044e565b905061044660008261044161014c565b61053f565b949350505050565b6000828261045a6101a0565b60405160200161046c93929190610782565b60405160208183030381529060405280519060200120905092915050565b600061029b838330610595565b6001600160a01b03161590565b60006104ee858585856040516024016104bf93929190610870565b60408051601f198184030181529190526020810180516001600160e01b03166323b872dd60e01b1790526105d4565b95945050505050565b6000610446848484604051602401610510929190610894565b60408051601f198184030181529190526020810180516001600160e01b031663095ea7b360e01b1790526105d4565b6000808251600014156105645760405162461bcd60e51b8152600401610309906108e0565b8383516020850187f590506001600160a01b0381166104465760405162461bcd60e51b815260040161030990610915565b60008060ff60f81b8386866040516020016105b394939291906107ab565b60408051808303601f19018152919052805160209091012095945050505050565b60006105df83610685565b6105fb5760405162461bcd60e51b81526004016103099061094c565b60006060846001600160a01b03168460405161061791906107df565b6000604051808303816000865af19150503d8060008114610654576040519150601f19603f3d011682016040523d82523d6000602084013e610659565b606091505b509150915061066882826106be565b805115806104ee5750808060200190518101906104ee9190610762565b6000813f7fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470818114801590610446575050151592915050565b816106cb57805160208201fd5b5050565b80356001600160a01b038116811461041f57600080fd5b600080604083850312156106f8578182fd5b610701836106cf565b915061070f602084016106cf565b90509250929050565b6000806000806080858703121561072d578182fd5b610736856106cf565b9350610744602086016106cf565b9250610752604086016106cf565b9396929550929360600135925050565b600060208284031215610773578081fd5b8151801515811461029b578182fd5b6001600160601b0319606094851b811682529290931b9091166014830152602882015260480190565b6001600160f81b031994909416845260609290921b6001600160601b03191660018401526015830152603582015260550190565b600082516107f1818460208701610a09565b9190910192915050565b6000845161080d818460208901610a09565b606085901b6001600160601b0319169083019081528351610835816014840160208801610a09565b0160140195945050505050565b6001600160a01b0391909116815260200190565b6001600160a01b0392831681529116602082015260400190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03929092168252602082015260400190565b60006020825282518060208401526108cc816040850160208701610a09565b601f01601f19169190910160400192915050565b6020808252818101527f437265617465323a2062797465636f6465206c656e677468206973207a65726f604082015260600190565b60208082526019908201527f437265617465323a204661696c6564206f6e206465706c6f7900000000000000604082015260600190565b6020808252601190820152704c696245524332303a204e4f5f434f444560781b604082015260600190565b60208082526024908201527f4368616e6e656c466163746f72793a2045524332305f415050524f56455f46416040820152631253115160e21b606082015260800190565b60208082526025908201527f4368616e6e656c466163746f72793a2045524332305f5452414e534645525f46604082015264105253115160da1b606082015260800190565b90815260200190565b60005b83811015610a24578181015183820152602001610a0c565b83811115610a33576000848401525b5050505056fea26469706673582212205673b9a5867579b9cc0088cf59fd7d249d0aa00bad3550a7b59020a9febe3e5564736f6c63430007030033";