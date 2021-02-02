"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
describe("TransferRegistry.sol", function () {
    this.timeout(120000);
    let transfer;
    let registry;
    let registryInfo;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        registry = await utils_1.getContract("TransferRegistry", constants_1.alice);
        await (await registry.removeTransferDefinition("HashlockTransfer")).wait();
        await (await registry.removeTransferDefinition("Withdraw")).wait();
        transfer = await utils_1.getContract("HashlockTransfer", constants_1.alice);
        registryInfo = await transfer.getRegistryInformation();
    });
    describe("addTransferDefinition", () => {
        it("should work", async () => {
            await (await registry.addTransferDefinition(registryInfo)).wait();
            chai_1.expect(await registry.getTransferDefinitions()).to.be.deep.eq([registryInfo]);
        });
        it("should fail IFF not called by the owner", async () => {
            await chai_1.expect(registry.connect(constants_1.rando).addTransferDefinition(registryInfo)).revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("removeTransferDefinition", () => {
        beforeEach(async () => {
            await (await registry.addTransferDefinition(registryInfo)).wait();
        });
        it("should work", async () => {
            await (await registry.removeTransferDefinition("HashlockTransfer")).wait();
            chai_1.expect(await registry.getTransferDefinitions()).to.be.deep.eq([]);
        });
        it("should fail IFF not called by the owner", async () => {
            await chai_1.expect(registry.connect(constants_1.rando).removeTransferDefinition(transfer.address)).revertedWith("Ownable: caller is not the owner");
        });
    });
});
//# sourceMappingURL=transferRegistry.spec.js.map