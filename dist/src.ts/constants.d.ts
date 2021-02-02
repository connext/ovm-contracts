import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import pino from "pino";
export declare const defaultLogLevel: string;
export declare const logger: pino.Logger;
export declare const networkName: string;
export declare const provider: JsonRpcProvider;
export declare const wallets: Wallet[];
export declare const chainIdReq: Promise<number>;
export declare const alice: Wallet;
export declare const bob: Wallet;
export declare const rando: Wallet;
//# sourceMappingURL=constants.d.ts.map