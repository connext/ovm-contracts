"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = void 0;
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_subset_1 = __importDefault(require("chai-subset"));
const chai_2 = require("@ethereum-waffle/chai");
chai_1.use(chai_subset_1.default);
chai_1.use(chai_as_promised_1.default);
chai_1.use(chai_2.waffleChai);
var chai_3 = require("chai");
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return chai_3.expect; } });
//# sourceMappingURL=expect.js.map