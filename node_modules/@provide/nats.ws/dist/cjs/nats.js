"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
const protocol_1 = require("./protocol");
const error_1 = require("./error");
const nuid_1 = require("./nuid");
function connect(opts) {
    return Connection.connect(opts);
}
exports.connect = connect;
class Connection {
    constructor(opts) {
        this.closeListeners = [];
        this.errorListeners = [];
        this.draining = false;
        this.nuid = new nuid_1.Nuid();
        this.options = { url: "ws://localhost:4222" };
        if (opts.payload === undefined) {
            opts.payload = types_1.Payload.STRING;
        }
        let payloadTypes = ["json", "string", "binary"];
        if (!payloadTypes.includes(opts.payload)) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.INVALID_PAYLOAD_TYPE);
        }
        if (opts.user && opts.token) {
            throw (error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_AUTHENTICATION));
        }
        util_1.extend(this.options, opts);
    }
    static connect(opts) {
        return new Promise((resolve, reject) => {
            let nc = new Connection(opts);
            protocol_1.ProtocolHandler.connect(opts, nc)
                .then((ph) => {
                nc.protocol = ph;
                resolve(nc);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    close() {
        this.protocol.close();
    }
    publish(subject, data = undefined, reply = "") {
        subject = subject || "";
        if (subject.length === 0) {
            this.errorHandler(error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_SUBJECT));
            return this;
        }
        if (!util_1.isArrayBuffer(data)) {
            if (this.options.payload !== types_1.Payload.JSON) {
                data = data || "";
            }
            else {
                data = data === undefined ? null : data;
                data = JSON.stringify(data);
            }
            data = util_1.stringToUint8Array(data);
        }
        this.protocol.publish(subject, data, reply);
        return this;
    }
    subscribe(subject, cb, opts = {}) {
        return new Promise((resolve, reject) => {
            if (this.isClosed()) {
                reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED));
            }
            if (this.isDraining()) {
                reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_DRAINING));
            }
            let s = protocol_1.defaultSub();
            util_1.extend(s, opts);
            s.subject = subject;
            s.callback = cb;
            resolve(this.protocol.subscribe(s));
        });
    }
    request(subject, timeout = 1000, data = undefined) {
        return new Promise((resolve, reject) => {
            if (this.isClosed()) {
                reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED));
            }
            if (this.isDraining()) {
                reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_DRAINING));
            }
            let r = protocol_1.defaultReq();
            let opts = { max: 1 };
            util_1.extend(r, opts);
            r.token = this.nuid.next();
            r.timeout = setTimeout(() => {
                request.cancel();
                reject('timeout');
            }, timeout);
            r.callback = (msg) => {
                resolve(msg);
            };
            let request = this.protocol.request(r);
            this.publish(subject, data, `${this.protocol.muxSubscriptions.baseInbox}${r.token}`);
        });
    }
    flush(cb) {
        if (cb === undefined) {
            return new Promise((resolve) => {
                this.protocol.flush(() => {
                    resolve();
                });
            });
        }
        else {
            this.protocol.flush(cb);
        }
    }
    drain() {
        if (this.isClosed()) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED));
        }
        if (this.isDraining()) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_DRAINING));
        }
        this.draining = true;
        return this.protocol.drain();
    }
    errorHandler(error) {
        this.errorListeners.forEach((cb) => {
            try {
                cb(error);
            }
            catch (ex) {
            }
        });
    }
    closeHandler() {
        this.closeListeners.forEach((cb) => {
            try {
                cb();
            }
            catch (ex) {
            }
        });
    }
    addEventListener(type, listener) {
        if (type === "close") {
            this.closeListeners.push(listener);
        }
        else if (type === "error") {
            this.errorListeners.push(listener);
        }
    }
    isClosed() {
        return this.protocol.isClosed();
    }
    isDraining() {
        return this.draining;
    }
}
exports.Connection = Connection;
//# sourceMappingURL=nats.js.map