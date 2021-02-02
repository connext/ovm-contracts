"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_utils_1 = require("@connext/vector-utils");
const hardhat_1 = require("hardhat");
describe("deploy", function () {
    this.timeout(360000);
    it("should run without error", async () => {
        vector_utils_1.expect(await hardhat_1.deployments.fixture()).to.be.ok;
    });
});
//# sourceMappingURL=deploy.spec.js.map