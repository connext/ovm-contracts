"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hdnode_1 = require("@ethersproject/hdnode");
const wallet_1 = require("@ethersproject/wallet");
const config_1 = require("hardhat/config");
const pino_1 = __importDefault(require("pino"));
exports.default = config_1.task("display-accounts", "Displays first 3 accounts and their recommended gifts")
    .addParam("mnemonic", "The mnemonic to display accounts for")
    .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
    .setAction(async (args) => {
    const { mnemonic, logLevel } = args;
    const log = pino_1.default({ level: logLevel || "info" });
    const hdNode = hdnode_1.HDNode.fromMnemonic(mnemonic).derivePath("m/44'/60'/0'/0");
    const wallets = Array(20)
        .fill(0)
        .map((_, idx) => {
        const wallet = new wallet_1.Wallet(hdNode.derivePath(idx.toString()).privateKey);
        return wallet;
    });
    log.info({ wallets: wallets.map(w => w.address), privateKeys: wallets.map(w => w.privateKey) }, "All contract testing accounts");
    log.info({ alice: wallets[0].address, recommended: "1 ETH" }, "Alice");
    log.info({ bob: wallets[1].address, recommended: "0.5 ETH" }, "Bob");
    log.info({ rando: wallets[2].address, recommended: "0.1 ETH" }, "Rando");
});
//# sourceMappingURL=displayAccounts.js.map