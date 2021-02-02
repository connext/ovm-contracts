"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rando = exports.bob = exports.alice = exports.chainIdReq = exports.wallets = exports.provider = exports.networkName = exports.logger = exports.defaultLogLevel = void 0;
const hdnode_1 = require("@ethersproject/hdnode");
const wallet_1 = require("@ethersproject/wallet");
const providers_1 = require("@ethersproject/providers");
const hardhat_1 = require("hardhat");
const pino_1 = __importDefault(require("pino"));
const chainProviders = JSON.parse((_a = process.env.CHAIN_PROVIDERS) !== null && _a !== void 0 ? _a : "{}");
const chainId = Object.keys(chainProviders)[0];
const url = Object.values(chainProviders)[0];
const mnemonic = (_b = process.env.SUGAR_DADDY) !== null && _b !== void 0 ? _b : "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
exports.defaultLogLevel = process.env.LOG_LEVEL || "info";
exports.logger = pino_1.default({ level: exports.defaultLogLevel });
exports.networkName = hardhat_1.network.name;
exports.provider = url
    ? new providers_1.JsonRpcProvider(url, parseInt(chainId))
    : hardhat_1.ethers.provider;
const hdNode = hdnode_1.HDNode.fromMnemonic(mnemonic).derivePath("m/44'/60'/0'/0");
exports.wallets = Array(20)
    .fill(0)
    .map((_, idx) => {
    const wallet = new wallet_1.Wallet(hdNode.derivePath(idx.toString()).privateKey, exports.provider);
    return wallet;
});
exports.chainIdReq = exports.provider.getNetwork().then(net => net.chainId);
exports.alice = exports.wallets[0];
exports.bob = exports.wallets[1];
exports.rando = exports.wallets[2];
//# sourceMappingURL=constants.js.map