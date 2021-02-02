import { Address, Balance, FullTransferState, IVectorChainReader, Result, ChainError, ChainProviders, RegisteredTransfer, TransferName, ChannelDispute, TransferState, HydratedProviders } from "@connext/vector-types";
import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider, TransactionRequest } from "@ethersproject/providers";
import pino from "pino";
export declare class EthereumChainReader implements IVectorChainReader {
    readonly chainProviders: {
        [chainId: string]: JsonRpcProvider;
    };
    readonly log: pino.BaseLogger;
    private transferRegistries;
    constructor(chainProviders: {
        [chainId: string]: JsonRpcProvider;
    }, log: pino.BaseLogger);
    getChainProviders(): Result<ChainProviders, ChainError>;
    getHydratedProviders(): Result<HydratedProviders, ChainError>;
    getSyncing(chainId: number): Promise<Result<boolean | {
        startingBlock: string;
        currentBlock: string;
        highestBlock: string;
    }, ChainError>>;
    getChannelDispute(channelAddress: string, chainId: number): Promise<Result<ChannelDispute | undefined, ChainError>>;
    getRegisteredTransferByDefinition(definition: Address, transferRegistry: string, chainId: number, bytecode?: string): Promise<Result<RegisteredTransfer, ChainError>>;
    getRegisteredTransferByName(name: TransferName, transferRegistry: string, chainId: number, bytecode?: string): Promise<Result<RegisteredTransfer, ChainError>>;
    getRegisteredTransfers(transferRegistry: string, chainId: number, bytecode?: string): Promise<Result<RegisteredTransfer[], ChainError>>;
    getChannelFactoryBytecode(channelFactoryAddress: string, chainId: number): Promise<Result<string, ChainError>>;
    getChannelMastercopyAddress(channelFactoryAddress: string, chainId: number): Promise<Result<string, ChainError>>;
    getChannelOnchainBalance(channelAddress: string, chainId: number, assetId: string): Promise<Result<BigNumber, ChainError>>;
    getTotalDepositedA(channelAddress: string, chainId: number, assetId: string): Promise<Result<BigNumber, ChainError>>;
    getTotalDepositedB(channelAddress: string, chainId: number, assetId: string): Promise<Result<BigNumber, ChainError>>;
    create(initialState: TransferState, balance: Balance, transferDefinition: string, transferRegistryAddress: string, chainId: number, bytecode?: string): Promise<Result<boolean, ChainError>>;
    resolve(transfer: FullTransferState, chainId: number, bytecode?: string): Promise<Result<Balance, ChainError>>;
    getChannelAddress(alice: string, bob: string, channelFactoryAddress: string, chainId: number): Promise<Result<string, ChainError>>;
    getCode(address: string, chainId: number): Promise<Result<string, ChainError>>;
    getBlockNumber(chainId: number): Promise<Result<number, ChainError>>;
    getGasPrice(chainId: number): Promise<Result<BigNumber, ChainError>>;
    estimateGas(chainId: number, transaction: TransactionRequest): Promise<Result<BigNumber, ChainError>>;
    getTokenAllowance(tokenAddress: string, owner: string, spender: string, chainId: number): Promise<Result<BigNumber, ChainError>>;
    getOnchainBalance(assetId: string, balanceOf: string, chainId: number): Promise<Result<BigNumber, ChainError>>;
    private tryEvm;
    private loadRegistry;
}
//# sourceMappingURL=ethReader.d.ts.map