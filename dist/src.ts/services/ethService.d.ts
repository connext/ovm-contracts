import { FullChannelState, IVectorChainService, MinimalTransaction, ChainError, Result, IChainServiceStore, FullTransferState } from "@connext/vector-types";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BaseLogger } from "pino";
import { EthereumChainReader } from "./ethReader";
export declare const EXTRA_GAS_PRICE: BigNumber;
export declare const EXTRA_GAS = 50000;
export declare class EthereumChainService extends EthereumChainReader implements IVectorChainService {
    private readonly store;
    private readonly defaultRetries;
    private signers;
    private queue;
    constructor(store: IChainServiceStore, chainProviders: {
        [chainId: string]: JsonRpcProvider;
    }, signer: string | Signer, log: BaseLogger, defaultRetries?: number);
    sendDisputeChannelTx(channelState: FullChannelState): Promise<Result<TransactionResponse, ChainError>>;
    sendDefundChannelTx(channelState: FullChannelState, assetsToDefund?: string[], indices?: string[]): Promise<Result<TransactionResponse, ChainError>>;
    sendDisputeTransferTx(transferIdToDispute: string, activeTransfers: FullTransferState[]): Promise<Result<TransactionResponse, ChainError>>;
    sendDefundTransferTx(transferState: FullTransferState, responderSignature?: string): Promise<Result<TransactionResponse, ChainError>>;
    sendDeployChannelTx(channelState: FullChannelState, gasPrice: BigNumber, deposit?: {
        amount: string;
        assetId: string;
    }): Promise<Result<TransactionResponse, ChainError>>;
    sendWithdrawTx(channelState: FullChannelState, minTx: MinimalTransaction): Promise<Result<TransactionResponse, ChainError>>;
    sendDepositTx(channelState: FullChannelState, sender: string, amount: string, assetId: string): Promise<Result<TransactionResponse, ChainError>>;
    private sendTxWithRetries;
    private sendTxAndParseResponse;
    private approveTokens;
    private sendDepositATx;
    private sendDepositBTx;
}
//# sourceMappingURL=ethService.d.ts.map