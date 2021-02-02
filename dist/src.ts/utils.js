"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceBlocktime = exports.createChannel = exports.registerTransfer = exports.getContract = void 0;
const hardhat_1 = require("hardhat");
const constants_1 = require("./constants");
exports.getContract = hardhat_1.l2ethers.getContract;
exports.registerTransfer = (transferName, signerAddress = constants_1.alice.address, logLevel = constants_1.defaultLogLevel) => hardhat_1.run("register-transfer", { transferName, signerAddress, logLevel });
exports.createChannel = (aliceAddress = constants_1.alice.address, bobAddress = constants_1.bob.address, logLevel = constants_1.defaultLogLevel, testMode = "yarp") => hardhat_1.run("create-channel", { aliceAddress, bobAddress, logLevel, testMode });
exports.advanceBlocktime = async (seconds) => {
    const { timestamp: currTime } = await constants_1.provider.getBlock("latest");
    await constants_1.provider.send("evm_increaseTime", [seconds]);
    await constants_1.provider.send("evm_mine", []);
    const { timestamp: finalTime } = await constants_1.provider.getBlock("latest");
    const desired = currTime + seconds;
    if (finalTime < desired) {
        const diff = finalTime - desired;
        await constants_1.provider.send("evm_increaseTime", [diff]);
    }
};
//# sourceMappingURL=utils.js.map