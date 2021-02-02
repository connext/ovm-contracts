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
exports.MemoryLockService = exports.LOCK_TTL = void 0;
const crypto_1 = require("crypto");
const async_mutex_1 = require("async-mutex");
exports.LOCK_TTL = 30000;
class MemoryLockService {
    constructor() {
        this.locks = new Map();
        this.ttl = exports.LOCK_TTL;
    }
    acquireLock(lockName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let lock = (_a = this.locks.get(lockName)) === null || _a === void 0 ? void 0 : _a.lock;
            if (!lock) {
                lock = new async_mutex_1.Mutex();
                this.locks.set(lockName, { lock, releaser: undefined, timer: undefined, secret: undefined });
            }
            const releaser = yield lock.acquire();
            const secret = this.randomValue();
            const timer = setTimeout(() => this.releaseLock(lockName, secret), this.ttl);
            this.locks.set(lockName, { lock, releaser, timer, secret });
            return secret;
        });
    }
    releaseLock(lockName, lockValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const lock = this.locks.get(lockName);
            if (!lock) {
                throw new Error(`Can't release a lock that doesn't exist: ${lockName}`);
            }
            if (lockValue !== lock.secret) {
                throw new Error("Incorrect lock value");
            }
            clearTimeout(lock.timer);
            return lock.releaser();
        });
    }
    randomValue() {
        return crypto_1.randomBytes(16).toString("hex");
    }
}
exports.MemoryLockService = MemoryLockService;
//# sourceMappingURL=lock.js.map