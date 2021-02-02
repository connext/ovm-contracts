"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestTxReceipt = exports.createTestTxResponse = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const util_1 = require("./util");
exports.createTestTxResponse = (overrides = {}) => {
    var _a, _b, _c, _d, _e;
    const to = (_a = overrides.to) !== null && _a !== void 0 ? _a : util_1.mkAddress("0x1111");
    const from = (_b = overrides.from) !== null && _b !== void 0 ? _b : util_1.mkAddress("0x2222");
    const hash = (_c = overrides.hash) !== null && _c !== void 0 ? _c : util_1.mkHash("0xade134");
    const blockHash = (_d = overrides.blockHash) !== null && _d !== void 0 ? _d : util_1.mkHash("0xbbbbb");
    const blockNumber = (_e = overrides.blockNumber) !== null && _e !== void 0 ? _e : 487;
    return Object.assign({ hash,
        to,
        from, data: util_1.mkHash(), value: bignumber_1.BigNumber.from(10), chainId: 1, nonce: 43, gasLimit: bignumber_1.BigNumber.from(123576), gasPrice: bignumber_1.BigNumber.from(1657639), timestamp: Date.now(), raw: util_1.mkHash(), blockHash,
        blockNumber, confirmations: 0, wait: () => Promise.resolve(exports.createTestTxReceipt({ transactionHash: hash, to, from, contractAddress: to, blockHash, blockNumber })) }, overrides);
};
exports.createTestTxReceipt = (overrides = {}) => {
    return Object.assign({ transactionHash: util_1.mkHash("0xaecb"), to: util_1.mkAddress("0x1111"), from: util_1.mkAddress("0x2222"), blockHash: util_1.mkHash("0xbbbbb"), blockNumber: 487, contractAddress: util_1.mkAddress("0xcccc"), transactionIndex: 3, root: util_1.mkHash(), gasUsed: bignumber_1.BigNumber.from(1657639), logsBloom: "logs", logs: [], cumulativeGasUsed: bignumber_1.BigNumber.from(1657639), byzantium: true, confirmations: 15 }, overrides);
};
//# sourceMappingURL=chain.js.map