"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestLoggers = void 0;
const pino_1 = __importDefault(require("pino"));
exports.getTestLoggers = (name, level = "info", fast = 20, slow = 200) => {
    const log = pino_1.default({ level, name });
    const timer = start => msg => {
        const diff = Date.now() - start;
        if (diff < fast) {
            log.debug(msg);
        }
        else if (diff < slow) {
            log.info(msg);
        }
        else {
            log.warn(msg);
        }
    };
    return { log, timer };
};
//# sourceMappingURL=logger.js.map