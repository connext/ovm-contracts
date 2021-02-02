"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const config_1 = require("hardhat/config");
const pino_1 = __importDefault(require("pino"));
exports.default = config_1.task("register-transfer", "Registers transfers")
    .addParam("transferName", "The name of the transfer to register")
    .addParam("signerAddress", "The address that will sign the registration tx")
    .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
    .setAction(async (args, hre) => {
    const { transferName, signerAddress, logLevel } = args;
    const log = pino_1.default({ level: logLevel || "info" });
    log.info(`Preparing to add ${transferName} to registry (Sender=${signerAddress})`);
    const registry = await hre.ethers.getContract("TransferRegistry", signerAddress);
    const transfer = await hre.ethers.getContract(transferName, signerAddress);
    const registered = await registry.getTransferDefinitions();
    const transferInfo = await transfer.getRegistryInformation();
    const entry = registered.find((info) => info.name === transferName);
    if (entry && entry.definition === transfer.address) {
        log.info({ transferName }, `Transfer has already been registered`);
        return;
    }
    if (entry && entry.definition !== transfer.address) {
        log.info({ transferName, registered: entry.definition, latest: transfer.address }, `Transfer has stale registration, removing and updating`);
        const removal = await registry.removeTransferDefinition(transferName);
        log.info({ hash: removal.hash }, "Removal tx broadcast");
        await removal.wait();
        log.info("Removal tx mined");
    }
    log.info({ transferName, latest: transfer.address }, `Getting registry information`);
    const cleaned = {
        name: transferInfo.name,
        definition: transferInfo.definition,
        resolverEncoding: vector_types_1.tidy(transferInfo.resolverEncoding),
        stateEncoding: vector_types_1.tidy(transferInfo.stateEncoding),
        encodedCancel: transferInfo.encodedCancel,
    };
    log.info(cleaned, `Adding transfer to registry`);
    const response = await registry.addTransferDefinition(cleaned);
    log.info(`Added: ${response.hash}`);
    await response.wait();
    log.info(`Tx mined, successfully added ${cleaned.name} on ${cleaned.definition}`);
});
//# sourceMappingURL=registerTransfer.js.map