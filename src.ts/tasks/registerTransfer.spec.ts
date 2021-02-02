import { TransferNames } from "@connext/vector-types";
import { expect } from "@connext/vector-utils";
import { Contract } from "@ethersproject/contracts";
import { deployments } from "hardhat";

import { alice } from "../constants";
import { getOvmContract, registerTransfer } from "../utils";

// requires changing task def, not commiting to that yet
describe.skip("registerTransfer", function () {
  this.timeout(120_000);
  let registry: Contract;
  let hashlock: Contract;

  beforeEach(async () => {
    registry = await getOvmContract("TransferRegistry", alice);
    hashlock = await getOvmContract("HashlockTransfer", alice);
  });

  it("should registry a new transfer", async () => {
    expect(registry.address).to.be.a("string");
    expect(
      await registerTransfer(TransferNames.HashlockTransfer, alice.address)
    ).to.be.ok;
  });
});
