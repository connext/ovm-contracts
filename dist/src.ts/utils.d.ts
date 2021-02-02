import { Contract } from "@ethersproject/contracts";
export declare const getContract: any;
export declare const registerTransfer: (transferName: string, signerAddress?: string, logLevel?: string) => Promise<Contract>;
export declare const createChannel: (aliceAddress?: string, bobAddress?: string, logLevel?: string, testMode?: string) => Promise<Contract>;
export declare const advanceBlocktime: (seconds: number) => Promise<void>;
//# sourceMappingURL=utils.d.ts.map