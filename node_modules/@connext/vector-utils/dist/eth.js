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
exports.hydrateProviders = exports.getGasPrice = exports.getEthProvider = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const providers_1 = require("@ethersproject/providers");
const classicProviders = ["https://www.ethercluster.com/etc"];
const classicChainIds = [61];
const minGasPrice = bignumber_1.BigNumber.from(1000);
exports.getEthProvider = (providerUrl, chainId) => new providers_1.JsonRpcProvider(providerUrl, classicProviders.includes(providerUrl) || classicChainIds.includes(chainId) ? "classic" : undefined);
exports.getGasPrice = (provider, providedChainId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chainId = providedChainId || ((_a = (yield provider.getNetwork())) === null || _a === void 0 ? void 0 : _a.chainId);
    const price = yield provider.getGasPrice();
    return chainId === 100 && price.lt(minGasPrice) ? minGasPrice : price;
});
exports.hydrateProviders = (chainProviders) => {
    const hydratedProviders = {};
    Object.entries(chainProviders).map(([chainId, url]) => {
        hydratedProviders[chainId] = new providers_1.JsonRpcProvider(url, parseInt(chainId));
    });
    return hydratedProviders;
};
//# sourceMappingURL=eth.js.map