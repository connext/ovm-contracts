"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const pino_1 = __importDefault(require("pino"));
exports.default = config_1.task("drip", "Mints tokens to given address")
    .addParam("address", "The address to drip funds to")
    .addOptionalParam("signerAddress", "The address that will sign the registration tx")
    .addOptionalParam("amount", "The amount to mint in wei (default: 10 tokens)")
    .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
    .setAction(async (args, hre) => {
    const { address, logLevel, amount, signerAddress } = args;
    const toDrip = amount !== null && amount !== void 0 ? amount : hre.ethers.utils.parseEther("10");
    const log = pino_1.default({ level: logLevel !== null && logLevel !== void 0 ? logLevel : "info" });
    log.info(`Preparing to drip ${hre.ethers.utils.formatEther(toDrip)} tokens to addr=${address}`);
    const token = await hre.ethers.getContract("TestToken", signerAddress !== null && signerAddress !== void 0 ? signerAddress : address);
    const mint = await token.mint(address, toDrip);
    log.info(`Transaction: ${mint.hash}`);
    await mint.wait();
    log.info(`Successfully minted tokens`);
});
//# sourceMappingURL=drip.js.map