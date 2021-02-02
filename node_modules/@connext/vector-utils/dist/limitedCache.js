"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitedCache = void 0;
class LimitedCache {
    constructor(maxLength) {
        this.length = 0;
        this.head = null;
        this.tail = null;
        this.cache = {};
        this.maxLength = maxLength;
    }
    set(k, v) {
        const exists = !!this.cache[k];
        this.cache[k] = v;
        if (exists) {
            return;
        }
        const node = {
            next: null,
            key: k,
        };
        if (!this.tail) {
            this.cache[k] = v;
            this.head = this.tail = node;
            this.length++;
            return;
        }
        this.tail.next = node;
        this.tail = node;
        if (this.length === this.maxLength) {
            const head = this.head;
            delete this.cache[head.key];
            this.head = head.next;
            return;
        }
        this.length++;
    }
    get(k) {
        const res = this.cache[k];
        if (!res) {
            return null;
        }
        return res;
    }
}
exports.LimitedCache = LimitedCache;
//# sourceMappingURL=limitedCache.js.map