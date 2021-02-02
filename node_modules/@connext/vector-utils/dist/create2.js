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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreate2MultisigAddress = exports.getMinimalProxyInitCode = void 0;
const solidity_1 = require("@ethersproject/solidity");
const address_1 = require("@ethersproject/address");
const vector_types_1 = require("@connext/vector-types");
const identifiers_1 = require("./identifiers");
exports.getMinimalProxyInitCode = (mastercopyAddress) => `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${mastercopyAddress
    .toLowerCase()
    .replace(/^0x/, "")}5af43d82803e903d91602b57fd5bf3`;
exports.getCreate2MultisigAddress = (initiatorIdentifier, responderIdentifier, chainId, channelFactoryAddress, chainReader) => __awaiter(void 0, void 0, void 0, function* () {
    const mastercopyRes = yield chainReader.getChannelMastercopyAddress(channelFactoryAddress, chainId);
    if (mastercopyRes.isError) {
        return mastercopyRes;
    }
    try {
        return vector_types_1.Result.ok(address_1.getCreate2Address(channelFactoryAddress, solidity_1.keccak256(["address", "address", "uint256"], [
            identifiers_1.getSignerAddressFromPublicIdentifier(initiatorIdentifier),
            identifiers_1.getSignerAddressFromPublicIdentifier(responderIdentifier),
            chainId,
        ]), solidity_1.keccak256(["bytes"], [exports.getMinimalProxyInitCode(mastercopyRes.getValue())])));
    }
    catch (e) {
        return vector_types_1.Result.fail(e);
    }
});
//# sourceMappingURL=create2.js.map