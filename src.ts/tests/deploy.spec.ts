import { expect } from "@connext/vector-utils";
import { deployments } from "hardhat";

// NOTE: requires fixing task, skipping
describe.skip("deploy", function () {
  this.timeout(360_000);
  it("should run without error", async () => {
    expect(await deployments.fixture()).to.be.ok;
  });
});
