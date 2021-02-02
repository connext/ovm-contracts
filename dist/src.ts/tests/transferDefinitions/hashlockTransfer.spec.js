"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const solidity_1 = require("@ethersproject/solidity");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
describe("HashlockTransfer", function () {
    this.timeout(120000);
    let transfer;
    beforeEach(async () => {
        await hardhat_1.deployments.fixture();
        transfer = await utils_1.getContract("HashlockTransfer", constants_2.alice);
    });
    const createlockHash = (preImage) => solidity_1.sha256(["bytes32"], [preImage]);
    const createInitialState = async (preImage) => {
        const senderAddr = vector_utils_1.getRandomAddress();
        const receiverAddr = vector_utils_1.getRandomAddress();
        const transferAmount = "10000";
        const lockHash = createlockHash(preImage);
        const expiry = "0";
        return {
            balance: {
                amount: [transferAmount, constants_1.Zero.toString()],
                to: [senderAddr, receiverAddr],
            },
            state: { lockHash, expiry },
        };
    };
    const createTransfer = async (balance, initialState) => {
        const encodedState = vector_utils_1.encodeTransferState(initialState, vector_types_1.HashlockTransferStateEncoding);
        const encodedBalance = vector_utils_1.encodeBalance(balance);
        return transfer.functions.create(encodedBalance, encodedState);
    };
    const resolveTransfer = async (balance, initialState, resolver) => {
        const encodedState = vector_utils_1.encodeTransferState(initialState, vector_types_1.HashlockTransferStateEncoding);
        const encodedResolver = vector_utils_1.encodeTransferResolver(resolver, vector_types_1.HashlockTransferResolverEncoding);
        const encodedBalance = vector_utils_1.encodeBalance(balance);
        const res = await transfer.functions.resolve(encodedBalance, encodedState, encodedResolver);
        const ret = res[0];
        return vector_utils_1.keyify(balance, ret);
    };
    const validateResult = async (balance, initialState, resolver, result) => {
        const latestBlockTime = (await constants_2.provider.getBlock("latest")).timestamp;
        if (resolver.preImage !== constants_1.HashZero &&
            (initialState.expiry === "0" || bignumber_1.BigNumber.from(initialState.expiry).gt(latestBlockTime))) {
            vector_utils_1.expect(result.to).to.deep.equal(balance.to);
            vector_utils_1.expect(result.amount[0].toString()).to.eq("0");
            vector_utils_1.expect(result.amount[1].toString()).to.eq(balance.amount[0]);
        }
        else {
            vector_utils_1.expect(result.to).to.deep.equal(balance.to);
            vector_utils_1.expect(result.amount[0].toString()).to.eq(balance.amount[0]);
            vector_utils_1.expect(result.amount[1].toString()).to.eq(balance.amount[1]);
        }
    };
    it("should deploy", async () => {
        vector_utils_1.expect(transfer.address).to.be.a("string");
    });
    it("should return the registry information", async () => {
        const registry = await transfer.getRegistryInformation();
        vector_utils_1.expect(registry.name).to.be.eq("HashlockTransfer");
        vector_utils_1.expect(registry.stateEncoding).to.be.eq("tuple(bytes32 lockHash, uint256 expiry)");
        vector_utils_1.expect(registry.resolverEncoding).to.be.eq("tuple(bytes32 preImage)");
        vector_utils_1.expect(registry.definition).to.be.eq(transfer.address);
        vector_utils_1.expect(registry.encodedCancel).to.be.eq(vector_utils_1.encodeTransferResolver({ preImage: constants_1.HashZero }, registry.resolverEncoding));
    });
    describe("Create", () => {
        it("should create successfully", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            const res = await createTransfer(balance, state);
            vector_utils_1.expect(res[0]).to.be.true;
        });
        it("should fail create if sender balance is zero", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            balance.amount[0] = "0";
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("HashlockTransfer: ZER0_SENDER_BALANCE");
        });
        it("should fail create if receiver balance is nonzero", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            balance.amount[1] = balance.amount[0];
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("HashlockTransfer: NONZERO_RECIPIENT_BALANCE");
        });
        it("should fail create if lockHash is empty", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.lockHash = constants_1.HashZero;
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("HashlockTransfer: EMPTY_LOCKHASH");
        });
        it("should fail create if expiry is nonzero and expired", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.expiry = Math.floor((Date.now() - 1000000) / 1000).toString();
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("HashlockTransfer: EXPIRED_TIMELOCK");
        });
        it("should create successfully if expiry is nonzero and not expired", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.expiry = (Date.now() + 30).toString();
            const res = await createTransfer(balance, state);
            vector_utils_1.expect(res[0]).to.be.true;
        });
    });
    describe("Resolve", () => {
        it("should resolve successfully with zero expiry", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            const result = await resolveTransfer(balance, state, { preImage });
            await validateResult(balance, state, { preImage }, result);
        });
        it("should resolve successfully with nonzero expiry that is not expired", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.expiry = (Date.now() + 30).toString();
            const result = await resolveTransfer(balance, state, { preImage });
            await validateResult(balance, state, { preImage }, result);
        });
        it("should refund if preimage is HashZero", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            const result = await resolveTransfer(balance, state, { preImage: constants_1.HashZero });
            await validateResult(balance, state, { preImage: constants_1.HashZero }, result);
        });
        it("should refund if expiry is nonzero and is expired", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.expiry = "1";
            const result = await resolveTransfer(balance, state, { preImage: constants_1.HashZero });
            await validateResult(balance, state, { preImage: constants_1.HashZero }, result);
        });
        it("should fail if the hash generated does not match preimage", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            const incorrectPreImage = vector_utils_1.getRandomBytes32();
            await vector_utils_1.expect(resolveTransfer(balance, state, { preImage: incorrectPreImage })).revertedWith("HashlockTransfer: INVALID_PREIMAGE");
        });
        it("should fail if the payment is expired and trying to resolve", async () => {
            const preImage = vector_utils_1.getRandomBytes32();
            const { state, balance } = await createInitialState(preImage);
            state.expiry = "1";
            await vector_utils_1.expect(resolveTransfer(balance, state, { preImage })).revertedWith("HashlockTransfer: PAYMENT_EXPIRED");
        });
    });
});
//# sourceMappingURL=hashlockTransfer.spec.js.map