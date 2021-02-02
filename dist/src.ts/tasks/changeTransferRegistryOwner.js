"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const pino_1 = __importDefault(require("pino"));
exports.default = config_1.task("change-transfer-registry-owner", "Change transfer registry owner")
    .addParam("newOwner", "Address of the new owner")
    .addParam("signerAddress", "The address that will sign the registration tx")
    .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
    .setAction(async (args, hre) => {
    const { newOwner, logLevel, signerAddress } = args;
    const log = pino_1.default({ level: logLevel || "info" });
    log.info(`Preparing to add ${newOwner} to as owner of transfer registry (Sender=${signerAddress})`);
    const registry = await hre.ethers.getContract("TransferRegistry", signerAddress);
    const currentOwner = await registry.owner();
    log.info(`Current owner: ${currentOwner}`);
    const tx = await registry.transferOwnership(newOwner);
    log.info({ hash: tx.hash }, "transferOwnership tx broadcast");
    await tx.wait();
    log.info(`transferOwnership tx mined!`);
    const _newOwner = await registry.owner();
    log.info(`New owner: ${_newOwner}`);
});
//# sourceMappingURL=changeTransferRegistryOwner.js.map