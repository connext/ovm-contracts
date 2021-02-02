"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const hardhat_1 = require("hardhat");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
describe("registerTransfer", function () {
    this.timeout(120000);
    let registry;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        registry = await utils_1.getContract("TransferRegistry", constants_1.alice);
    });
    it("should registry a new transfer", async () => {
        vector_utils_1.expect(registry.address).to.be.a("string");
        vector_utils_1.expect(await utils_1.registerTransfer(vector_types_1.TransferNames.HashlockTransfer, constants_1.alice.address)).to.be.ok;
    });
});
//# sourceMappingURL=registerTransfer.spec.js.map