"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const pino_1 = __importDefault(require("pino"));
exports.default = config_1.task("create-channel", "Creates a new channel")
    .addParam("aliceAddress", "The address of both the alice role AND the signer")
    .addParam("bobAddress", "The address of the channel's bob role")
    .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
    .addParam("testMode", "If provided then create a TestChannel else create a VectorChannel")
    .setAction(async (args, hre) => {
    const { aliceAddress, bobAddress, logLevel, testMode } = args;
    const log = pino_1.default({ level: logLevel || "info" });
    log.info(`Preparing to create a channel for alice=${aliceAddress} and bob=${bobAddress}`);
    const channelFactory = await hre.ethers.getContract(testMode ? "TestChannelFactory" : "ChannelFactory", aliceAddress);
    const channelAddress = await channelFactory.getChannelAddress(aliceAddress, bobAddress);
    const channelCode = await hre.ethers.provider.getCode(channelAddress);
    if (channelCode === "0x" || channelCode === "0x00") {
        await (await channelFactory.createChannel(aliceAddress, bobAddress)).wait();
        log.info(`Successfully created a channel at ${channelAddress}`);
    }
    else {
        log.info(`Channel already exists at ${channelAddress}`);
    }
    return hre.ethers.getContractAt(testMode ? "TestChannel" : "IVectorChannel", channelAddress, aliceAddress);
});
//# sourceMappingURL=createChannel.js.map