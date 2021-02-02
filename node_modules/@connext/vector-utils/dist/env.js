"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = void 0;
exports.isNode = () => typeof process !== "undefined" &&
    typeof process.versions !== "undefined" &&
    typeof process.versions.node !== "undefined";
//# sourceMappingURL=env.js.map