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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChainId = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const axios_1 = __importDefault(require("axios"));
exports.getChainId = (ethProviderUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const chainIdResponse = yield axios_1.default.post(`${ethProviderUrl}`, {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
    }, { headers: { "content-type": "application/json" } });
    return bignumber_1.BigNumber.from(chainIdResponse.data.result).toNumber();
});
//# sourceMappingURL=chainId.js.map