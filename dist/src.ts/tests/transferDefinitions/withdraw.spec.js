"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const hardhat_1 = require("hardhat");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
describe("Withdraw", function () {
    this.timeout(120000);
    let withdraw;
    before(async () => {
        await hardhat_1.deployments.fixture();
        withdraw = await utils_1.getContract("Withdraw", constants_2.alice);
    });
    const createInitialState = async (data, overrides = { balance: {}, state: {} }) => {
        var _a, _b;
        return {
            balance: Object.assign({ amount: ["10000", constants_1.Zero.toString()], to: [vector_utils_1.getRandomAddress(), vector_utils_1.getRandomAddress()] }, ((_a = overrides.balance) !== null && _a !== void 0 ? _a : {})),
            state: Object.assign({ initiatorSignature: await vector_utils_1.signChannelMessage(data, constants_2.alice.privateKey), initiator: constants_2.alice.address, responder: constants_2.bob.address, data, nonce: vector_utils_1.getRandomBytes32(), fee: "0", callData: "0x", callTo: constants_1.AddressZero }, ((_b = overrides.state) !== null && _b !== void 0 ? _b : {})),
        };
    };
    const createTransfer = async (balance, initialState) => {
        const encodedState = vector_utils_1.encodeTransferState(initialState, vector_types_1.WithdrawStateEncoding);
        const encodedBalance = vector_utils_1.encodeBalance(balance);
        const ret = (await withdraw.functions.create(encodedBalance, encodedState))[0];
        return ret;
    };
    const resolveTransfer = async (balance, initialState, resolver) => {
        const encodedState = vector_utils_1.encodeTransferState(initialState, vector_types_1.WithdrawStateEncoding);
        const encodedResolver = vector_utils_1.encodeTransferResolver(resolver, vector_types_1.WithdrawResolverEncoding);
        const encodedBalance = vector_utils_1.encodeBalance(balance);
        const ret = (await withdraw.functions.resolve(encodedBalance, encodedState, encodedResolver))[0];
        return vector_utils_1.keyify(balance, ret);
    };
    const validateResult = async (initialBalance, initialState, resolver, result) => {
        if (resolver.responderSignature !== vector_utils_1.mkSig("0x0")) {
            vector_utils_1.expect(result.to).to.deep.equal(initialBalance.to);
            vector_utils_1.expect(result.amount[0].toString()).to.eq("0");
            vector_utils_1.expect(result.amount[1].toString()).to.eq(initialState.fee.toString());
        }
        else {
            vector_utils_1.expect(result.amount[0].toString()).to.eq(initialBalance.amount[0]);
            vector_utils_1.expect(result.amount[1].toString()).to.eq(initialBalance.amount[1]);
            vector_utils_1.expect(result.to).to.deep.equal(initialBalance.to);
        }
    };
    it("should deploy", async () => {
        vector_utils_1.expect(withdraw.address).to.be.a("string");
    });
    it("should return the registry information", async () => {
        const registry = await withdraw.getRegistryInformation();
        vector_utils_1.expect(registry.name).to.be.eq("Withdraw");
        vector_utils_1.expect(registry.stateEncoding).to.be.eq("tuple(bytes initiatorSignature, address initiator, address responder, bytes32 data, uint256 nonce, uint256 fee, address callTo, bytes callData)");
        vector_utils_1.expect(registry.resolverEncoding).to.be.eq("tuple(bytes responderSignature)");
        vector_utils_1.expect(registry.definition).to.be.eq(withdraw.address);
        vector_utils_1.expect(registry.encodedCancel).to.be.eq(vector_utils_1.encodeTransferResolver({ responderSignature: vector_utils_1.mkSig("0x0") }, registry.resolverEncoding));
    });
    describe("Create", () => {
        it("should create successfully", async () => {
            const data = vector_utils_1.getRandomBytes32();
            const { balance, state } = await createInitialState(data);
            vector_utils_1.expect(await createTransfer(balance, state)).to.be.true;
        });
        it("should fail if recipient has nonzero balance", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), { balance: { amount: ["0", "5"] } });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: NONZERO_RECIPIENT_BALANCE");
        });
        it("should fail if there is no responder", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { responder: constants_1.AddressZero },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: EMPTY_SIGNERS");
        });
        it("should fail if there is no initiator", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { initiator: constants_1.AddressZero },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: EMPTY_SIGNERS");
        });
        it("should fail if there is no data", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { data: constants_1.HashZero },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: EMPTY_DATA");
        });
        it("should fail if the nonce is 0", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { nonce: "0" },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: EMPTY_NONCE");
        });
        it("Withdraw: INSUFFICIENT_BALANCE", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { fee: bignumber_1.BigNumber.from("10000000").toString() },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: INSUFFICIENT_BALANCE");
        });
        it("should fail if the initiators signature is incorrect", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32(), {
                state: { initiatorSignature: await vector_utils_1.signChannelMessage(vector_utils_1.getRandomBytes32(), constants_2.alice.privateKey) },
            });
            await vector_utils_1.expect(createTransfer(balance, state)).revertedWith("Withdraw: INVALID_INITIATOR_SIG");
        });
    });
    describe("Resolve", () => {
        it("should resolve successfully", async () => {
            const data = vector_utils_1.getRandomBytes32();
            const { balance, state } = await createInitialState(data);
            const responderSignature = await vector_utils_1.signChannelMessage(data, constants_2.bob.privateKey);
            const result = await resolveTransfer(balance, state, { responderSignature });
            await validateResult(balance, state, { responderSignature }, result);
        });
        it("should resolve successfully with fees", async () => {
            const data = vector_utils_1.getRandomBytes32();
            const { balance, state } = await createInitialState(data, { state: { fee: "100" } });
            const responderSignature = await vector_utils_1.signChannelMessage(data, constants_2.bob.privateKey);
            const result = await resolveTransfer(balance, state, { responderSignature });
            await validateResult(balance, state, { responderSignature }, result);
        });
        it("should fail if the responder signature is invalid", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32());
            const responderSignature = await vector_utils_1.signChannelMessage(vector_utils_1.getRandomBytes32(), constants_2.bob.privateKey);
            await vector_utils_1.expect(resolveTransfer(balance, state, { responderSignature })).revertedWith("Withdraw: INVALID_RESPONDER_SIG");
        });
        it("should cancel if the responder gives empty signature", async () => {
            const { balance, state } = await createInitialState(vector_utils_1.getRandomBytes32());
            const result = await resolveTransfer(balance, state, { responderSignature: vector_utils_1.mkSig("0x0") });
            await validateResult(balance, state, { responderSignature: vector_utils_1.mkSig("0x0") }, result);
        });
    });
});
//# sourceMappingURL=withdraw.spec.js.map