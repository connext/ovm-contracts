"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayAndThrow = exports.delay = void 0;
exports.delay = (ms) => new Promise((res) => setTimeout(res, ms));
exports.delayAndThrow = (ms, msg = "") => new Promise((res, rej) => setTimeout(() => rej(new Error(msg)), ms));
//# sourceMappingURL=delay.js.map