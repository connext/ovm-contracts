"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = 36;
const preLen = 12;
const seqLen = 10;
const maxSeq = 3656158440062976;
const minInc = 33;
const maxInc = 333;
const totalLen = preLen + seqLen;
let cryptoObj;
function initCrypto() {
    if (window) {
        if ('crypto' in window && window.crypto.getRandomValues) {
            cryptoObj = window.crypto;
        }
        else if ('msCrypto' in window && window.msCrypto.getRandomValues) {
            cryptoObj = window.msCrypto;
        }
    }
    if (!cryptoObj) {
        cryptoObj = {
            getRandomValues: function (array) {
                for (let i = 0; i < array.length; i++) {
                    array[i] = Math.floor(Math.random() * (255));
                }
            }
        };
    }
    return cryptoObj;
}
class Nuid {
    constructor() {
        this.buf = new Uint8Array(totalLen);
        this.init();
    }
    init() {
        initCrypto();
        this.setPre();
        this.initSeqAndInc();
        this.fillSeq();
    }
    initSeqAndInc() {
        this.seq = Math.floor(Math.random() * maxSeq);
        this.inc = Math.floor(Math.random() * (maxInc - minInc) + minInc);
    }
    setPre() {
        let cbuf = new Uint8Array(preLen);
        cryptoObj.getRandomValues(cbuf);
        for (let i = 0; i < preLen; i++) {
            let di = cbuf[i] % base;
            this.buf[i] = digits.charCodeAt(di);
        }
    }
    ;
    fillSeq() {
        let n = this.seq;
        for (let i = totalLen - 1; i >= preLen; i--) {
            this.buf[i] = digits.charCodeAt(n % base);
            n = Math.floor(n / base);
        }
    }
    ;
    next() {
        this.seq += this.inc;
        if (this.seq > maxSeq) {
            this.setPre();
            this.initSeqAndInc();
        }
        this.fillSeq();
        return String.fromCharCode.apply(String, this.buf);
    }
    ;
    reset() {
        this.init();
    }
}
exports.Nuid = Nuid;
//# sourceMappingURL=nuid.js.map