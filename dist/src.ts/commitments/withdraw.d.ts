import { MinimalTransaction, WithdrawCommitmentJson } from "@connext/vector-types";
export declare class WithdrawCommitment {
    readonly channelAddress: string;
    readonly alice: string;
    readonly bob: string;
    readonly recipient: string;
    readonly assetId: string;
    readonly amount: string;
    readonly nonce: string;
    readonly callTo: string;
    readonly callData: string;
    private aliceSignature?;
    private bobSignature?;
    constructor(channelAddress: string, alice: string, bob: string, recipient: string, assetId: string, amount: string, nonce: string, callTo?: string, callData?: string);
    get signatures(): string[];
    toJson(): WithdrawCommitmentJson;
    static fromJson(json: WithdrawCommitmentJson): Promise<WithdrawCommitment>;
    getCallData(): {
        to: string;
        data: string;
    };
    getWithdrawData(): string[];
    hashToSign(): string;
    getSignedTransaction(): MinimalTransaction;
    addSignatures(signature1?: string, signature2?: string): Promise<void>;
}
//# sourceMappingURL=withdraw.d.ts.map