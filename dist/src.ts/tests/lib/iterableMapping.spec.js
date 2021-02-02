"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_1 = require("@ethersproject/bignumber");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
describe("LibIterableMapping.sol", function () {
    this.timeout(120000);
    let mapping;
    let transferDefs;
    const loadMapping = async () => {
        for (const transfer of transferDefs) {
            const info = await transfer.getRegistryInformation();
            const tx = await mapping.addTransferDefinition(info);
            await tx.wait();
        }
    };
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        mapping = await utils_1.getContract("TestLibIterableMapping", constants_1.alice);
        chai_1.expect(mapping.address).to.be.a("string");
        transferDefs = [await utils_1.getContract("HashlockTransfer", constants_1.alice), await utils_1.getContract("Withdraw", constants_1.alice)];
        chai_1.expect(transferDefs[0].address).to.be.a("string");
        chai_1.expect(transferDefs[1].address).to.be.a("string");
    });
    describe("stringEqual", () => {
        it("should work", async () => {
            chai_1.expect(await mapping.stringEqual("test", "test")).to.be.true;
            chai_1.expect(await mapping.stringEqual("test", "fails")).to.be.false;
        });
    });
    describe("isEmptyString", () => {
        it("should work", async () => {
            chai_1.expect(await mapping.isEmptyString("")).to.be.true;
            chai_1.expect(await mapping.isEmptyString("test")).to.be.false;
        });
    });
    describe("nameExists", () => {
        it("should work", async () => {
            await loadMapping();
            chai_1.expect(await mapping.nameExists("HashlockTransfer")).to.be.true;
        });
        it("should return false if name is empty", async () => {
            await loadMapping();
            chai_1.expect(await mapping.nameExists("")).to.be.false;
        });
        it("should return false if contract.names is empty", async () => {
            chai_1.expect(await mapping.nameExists("HashlockTransfer")).to.be.false;
        });
        it("should return false if name is not in contract.names", async () => {
            chai_1.expect(await mapping.nameExists("Fail")).to.be.false;
        });
    });
    describe("length", () => {
        it("should work", async () => {
            chai_1.expect(await mapping.length()).to.be.eq(0);
            await loadMapping();
            chai_1.expect(await mapping.length()).to.be.eq(transferDefs.length);
        });
    });
    describe("getTransferDefinitionByName", () => {
        beforeEach(async () => await loadMapping());
        it("should work", async () => {
            const hashlockRegistry = await transferDefs[0].getRegistryInformation();
            chai_1.expect(await mapping.getTransferDefinitionByName("HashlockTransfer")).to.be.deep.eq(hashlockRegistry);
        });
        it("should fail if name is not in contract.names", async () => {
            await chai_1.expect(mapping.getTransferDefinitionByName("Test")).revertedWith("LibIterableMapping: NAME_NOT_FOUND");
        });
    });
    describe("getTransferDefinitionByIndex", () => {
        beforeEach(async () => await loadMapping());
        it("should work", async () => {
            for (const transfer of transferDefs) {
                const idx = transferDefs.findIndex((t) => t.address === transfer.address);
                const registry = await transferDefs[idx].getRegistryInformation();
                chai_1.expect(await mapping.getTransferDefinitionByIndex(bignumber_1.BigNumber.from(idx))).to.be.deep.eq(registry);
            }
        });
        it("should fail if index > self.names.length", async () => {
            await chai_1.expect(mapping.getTransferDefinitionByIndex(bignumber_1.BigNumber.from(2))).revertedWith("LibIterableMapping: INVALID_INDEX");
        });
    });
    describe("getTransferDefinitions", () => {
        beforeEach(async () => await loadMapping());
        it("should work", async () => {
            const info = await Promise.all(transferDefs.map((t) => t.getRegistryInformation()));
            chai_1.expect(await mapping.getTransferDefinitions()).to.be.deep.eq(info);
        });
    });
    describe("addTransferDefinition", () => {
        let info;
        beforeEach(async () => {
            info = await Promise.all(transferDefs.map((t) => t.getRegistryInformation()));
        });
        it("should work", async () => {
            await loadMapping();
            chai_1.expect(await mapping.length()).to.be.eq(bignumber_1.BigNumber.from(2));
            chai_1.expect(await mapping.getTransferDefinitions()).to.be.deep.eq(info);
        });
        it("should fail if name is an empty string", async () => {
            await chai_1.expect(mapping.addTransferDefinition(Object.assign(Object.assign({}, info[0]), { name: "" }))).revertedWith("LibIterableMapping: EMPTY_NAME");
        });
        it("should fail if name is in contract.names", async () => {
            await loadMapping();
            await chai_1.expect(mapping.addTransferDefinition(info[0])).revertedWith("LibIterableMapping: NAME_ALREADY_ADDED");
        });
    });
    describe("removeTransferDefinition", () => {
        let info;
        beforeEach(async () => {
            info = await Promise.all(transferDefs.map((t) => t.getRegistryInformation()));
            await loadMapping();
        });
        it("should work with the last element", async () => {
            const tx = await mapping.removeTransferDefinition(info[1].name);
            await tx.wait();
            chai_1.expect(await mapping.length()).to.be.eq(info.length - 1);
            chai_1.expect(await mapping.nameExists(info[1].name)).to.be.false;
        });
        it("should work with another element than the last", async () => {
            const tx = await mapping.removeTransferDefinition(info[0].name);
            await tx.wait();
            chai_1.expect(await mapping.length()).to.be.eq(info.length - 1);
            chai_1.expect(await mapping.nameExists(info[0].name)).to.be.false;
        });
        it("should fail if name is an empty string", async () => {
            await chai_1.expect(mapping.removeTransferDefinition("")).revertedWith("LibIterableMapping: EMPTY_NAME");
        });
        it("should fail if name is not in contract.names", async () => {
            await chai_1.expect(mapping.removeTransferDefinition("Test")).revertedWith("LibIterableMapping: NAME_NOT_FOUND");
        });
    });
});
//# sourceMappingURL=iterableMapping.spec.js.map