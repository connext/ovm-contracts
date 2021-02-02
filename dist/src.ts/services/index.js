"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTRA_GAS_PRICE = exports.VectorChainService = exports.VectorChainReader = void 0;
var ethReader_1 = require("./ethReader");
Object.defineProperty(exports, "VectorChainReader", { enumerable: true, get: function () { return ethReader_1.EthereumChainReader; } });
var ethService_1 = require("./ethService");
Object.defineProperty(exports, "VectorChainService", { enumerable: true, get: function () { return ethService_1.EthereumChainService; } });
Object.defineProperty(exports, "EXTRA_GAS_PRICE", { enumerable: true, get: function () { return ethService_1.EXTRA_GAS_PRICE; } });
//# sourceMappingURL=index.js.map