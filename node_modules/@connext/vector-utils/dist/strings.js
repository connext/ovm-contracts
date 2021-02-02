"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = exports.abrv = exports.abbreviate = void 0;
exports.abbreviate = (str, len = 4) => !str ? "undefined"
    : str.startsWith("vector") ? `${str.substring(0, 5 + len)}..${str.substring(str.length - len)}`
        : str.startsWith("0x") ? `${str.substring(0, 2 + len)}..${str.substring(str.length - len)}`
            : `${str.substring(0, len)}..${str.substring(str.length - len)}`;
exports.abrv = (str, len = 4) => exports.abbreviate(str, len);
exports.capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
//# sourceMappingURL=strings.js.map