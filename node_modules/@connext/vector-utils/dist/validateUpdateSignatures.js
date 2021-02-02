"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChannelUpdateSignatures = void 0;
const vector_types_1 = require("@connext/vector-types");
const channel_1 = require("./channel");
const crypto_1 = require("./crypto");
function validateChannelUpdateSignatures(state, aliceSignature, bobSignature, requiredSigners = "both", logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const log = (msg, details = {}, level = "info") => {
            if (!logger) {
                return;
            }
            logger[level](details, msg);
        };
        const { networkContext } = state, core = __rest(state, ["networkContext"]);
        let hash;
        try {
            hash = channel_1.hashChannelCommitment(core);
        }
        catch (e) {
            return vector_types_1.Result.fail(new Error("Failed to generate channel commitment hash"));
        }
        const tryRecovery = (sig, expectedSigner) => __awaiter(this, void 0, void 0, function* () {
            log("Attempting recovery", { hash, sig }, "debug");
            if (!sig) {
                return "No signature provided";
            }
            let recovered;
            try {
                recovered = yield crypto_1.recoverAddressFromChannelMessage(hash, sig);
            }
            catch (e) {
                log("Recovery failed", { hash, sig, recoveryError: e.message, expectedSigner, state }, "error");
                recovered = e.message;
            }
            return recovered;
        });
        const [rAlice, rBob] = yield Promise.all([
            tryRecovery(aliceSignature, state.alice),
            tryRecovery(bobSignature, state.bob),
        ]);
        const aliceSigned = rAlice === state.alice;
        const bobSigned = rBob === state.bob;
        const bobNeeded = requiredSigners === "bob" || requiredSigners === "both";
        const aliceNeeded = requiredSigners === "alice" || requiredSigners === "both";
        if (aliceNeeded && bobNeeded && aliceSigned && bobSigned) {
            return vector_types_1.Result.ok(undefined);
        }
        if (aliceNeeded && aliceSigned && !bobSignature && !bobNeeded) {
            return vector_types_1.Result.ok(undefined);
        }
        if (bobNeeded && bobSigned && !aliceSignature && !aliceNeeded) {
            return vector_types_1.Result.ok(undefined);
        }
        if (aliceSignature && aliceSigned && bobSignature && bobSigned) {
            return vector_types_1.Result.ok(undefined);
        }
        const prefix = `Expected ${requiredSigners === "both" ? "alice + bob" : requiredSigners} ${aliceNeeded ? state.alice : ""}${bobNeeded ? " + " + state.bob : ""}. Got: `;
        const details = `${aliceNeeded ? "(alice) " + rAlice : ""}${bobNeeded ? "+ (bob) " + rBob : ""}`;
        return vector_types_1.Result.fail(new Error(prefix + details));
    });
}
exports.validateChannelUpdateSignatures = validateChannelUpdateSignatures;
//# sourceMappingURL=validateUpdateSignatures.js.map