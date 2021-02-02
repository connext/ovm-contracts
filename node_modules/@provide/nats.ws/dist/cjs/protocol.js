"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const transport_1 = require("./transport");
const error_1 = require("./error");
const util_1 = require("./util");
const nuid_1 = require("./nuid");
const databuffer_1 = require("./databuffer");
let nuid;
const FLUSH_THRESHOLD = 1024 * 8;
var ParserState;
(function (ParserState) {
    ParserState[ParserState["CLOSED"] = -1] = "CLOSED";
    ParserState[ParserState["AWAITING_CONTROL"] = 0] = "AWAITING_CONTROL";
    ParserState[ParserState["AWAITING_MSG_PAYLOAD"] = 1] = "AWAITING_MSG_PAYLOAD";
})(ParserState = exports.ParserState || (exports.ParserState = {}));
const MSG = /^MSG\s+([^\s\r\n]+)\s+([^\s\r\n]+)\s+(([^\s\r\n]+)[^\S\r\n]+)?(\d+)\r\n/i;
const OK = /^\+OK\s*\r\n/i;
const ERR = /^-ERR\s+('.+')?\r\n/i;
const PING = /^PING\r\n/i;
const PONG = /^PONG\r\n/i;
const INFO = /^INFO\s+([^\r\n]+)\r\n/i;
const CR_LF = '\r\n';
const CR_LF_LEN = CR_LF.length;
function createInbox() {
    if (!nuid) {
        nuid = new nuid_1.Nuid();
    }
    return `_INBOX.${nuid.next()}`;
}
exports.createInbox = createInbox;
class Connect {
    constructor(opts) {
        this.lang = "javascript";
        this.pedantic = false;
        this.protocol = 1;
        this.verbose = false;
        opts = opts || {};
        if (opts.token) {
            this.auth_token = opts.token;
        }
        if (opts.noEcho) {
            this.echo = false;
        }
        if (opts.userJWT) {
            if (typeof opts.userJWT === 'function') {
                this.jwt = opts.userJWT();
            }
            else {
                this.jwt = opts.userJWT;
            }
        }
        util_1.extend(this, opts);
    }
}
exports.Connect = Connect;
function defaultSub() {
    return { sid: 0, subject: "", received: 0 };
}
exports.defaultSub = defaultSub;
function defaultReq() {
    return { token: "", subject: "", received: 0, max: 1 };
}
exports.defaultReq = defaultReq;
class Request {
    constructor(req, protocol) {
        this.token = req.token;
        this.protocol = protocol;
    }
    cancel() {
        this.protocol.cancelRequest(this.token, 0);
    }
}
exports.Request = Request;
class Subscription {
    constructor(sub, protocol) {
        this.sid = sub.sid;
        this.protocol = protocol;
    }
    unsubscribe(max) {
        this.protocol.unsubscribe(this.sid, max);
    }
    hasTimeout() {
        let sub = this.protocol.subscriptions.get(this.sid);
        return sub !== null && sub.timeout !== null;
    }
    cancelTimeout() {
        let sub = this.protocol.subscriptions.get(this.sid);
        if (sub !== null && sub.timeout !== null) {
            clearTimeout(sub.timeout);
            sub.timeout = null;
        }
    }
    setTimeout(millis, cb) {
        let sub = this.protocol.subscriptions.get(this.sid);
        if (sub !== null) {
            if (sub.timeout) {
                clearTimeout(sub.timeout);
                sub.timeout = null;
            }
            sub.timeout = setTimeout(cb, millis);
            return true;
        }
        return false;
    }
    getReceived() {
        let sub = this.protocol.subscriptions.get(this.sid);
        if (sub) {
            return sub.received;
        }
        return 0;
    }
    drain() {
        return this.protocol.drainSubscription(this.sid);
    }
    isDraining() {
        let sub = this.protocol.subscriptions.get(this.sid);
        if (sub) {
            return sub.draining;
        }
        return false;
    }
    isCancelled() {
        return this.protocol.subscriptions.get(this.sid) === null;
    }
}
exports.Subscription = Subscription;
class MuxSubscription {
    constructor() {
        this.reqs = {};
        this.length = 0;
    }
    init() {
        this.baseInbox = `${createInbox()}.`;
        return this.baseInbox;
    }
    add(r) {
        if (!isNaN(r.received)) {
            r.received = 0;
        }
        this.length++;
        this.reqs[r.token] = r;
    }
    get(token) {
        if (token in this.reqs) {
            return this.reqs[token];
        }
        return null;
    }
    cancel(r) {
        if (r && r.timeout) {
            clearTimeout(r.timeout);
            r.timeout = null;
        }
        if (r.token in this.reqs) {
            delete this.reqs[r.token];
            this.length--;
        }
    }
    getToken(m) {
        let s = m.subject || "";
        if (s.indexOf(this.baseInbox) === 0) {
            return s.substring(this.baseInbox.length);
        }
        return null;
    }
    dispatcher() {
        let mux = this;
        return function (m) {
            let token = mux.getToken(m);
            if (token) {
                let r = mux.get(token);
                if (r) {
                    r.received++;
                    r.callback(m);
                    if (r.max && r.received >= r.max) {
                        mux.cancel(r);
                    }
                }
            }
        };
    }
    ;
}
exports.MuxSubscription = MuxSubscription;
class Subscriptions {
    constructor() {
        this.subs = {};
        this.sidCounter = 0;
        this.length = 0;
    }
    add(s) {
        this.sidCounter++;
        this.length++;
        s.sid = this.sidCounter;
        this.subs[s.sid] = s;
        return s;
    }
    setMux(s) {
        this.mux = s;
        return s;
    }
    getMux() {
        return this.mux;
    }
    get(sid) {
        if (sid in this.subs) {
            return this.subs[sid];
        }
        return null;
    }
    all() {
        let buf = [];
        for (let sid in this.subs) {
            let sub = this.subs[sid];
            buf.push(sub);
        }
        return buf;
    }
    cancel(s) {
        if (s && s.timeout) {
            clearTimeout(s.timeout);
            s.timeout = null;
        }
        if (s.sid in this.subs) {
            delete this.subs[s.sid];
            this.length--;
        }
    }
}
exports.Subscriptions = Subscriptions;
class MsgBuffer {
    constructor(chunks, payload = "string") {
        this.msg = {};
        this.msg.subject = chunks[1];
        this.msg.sid = parseInt(chunks[2], 10);
        this.msg.reply = chunks[4];
        this.msg.size = parseInt(chunks[5], 10);
        this.length = this.msg.size + CR_LF_LEN;
        this.payload = payload;
    }
    fill(data) {
        if (!this.buf) {
            this.buf = data;
        }
        else {
            this.buf = databuffer_1.DataBuffer.concat(this.buf, data);
        }
        this.length -= data.byteLength;
        if (this.length === 0) {
            this.msg.data = this.buf.slice(0, this.buf.byteLength - 2);
            switch (this.payload) {
                case types_1.Payload.JSON:
                    this.msg.data = Buffer.from(this.msg.data).toString('utf8');
                    this.msg.data = JSON.parse(this.msg.data);
                    break;
                case types_1.Payload.STRING:
                    this.msg.data = Buffer.from(this.msg.data).toString('utf8');
                    break;
                case types_1.Payload.BINARY:
                    break;
            }
            this.buf = null;
        }
    }
}
exports.MsgBuffer = MsgBuffer;
class ProtocolHandler {
    constructor(options, handlers) {
        this.infoReceived = false;
        this.payload = null;
        this.pongs = [];
        this.pout = 0;
        this.state = ParserState.AWAITING_CONTROL;
        this.noMorePublishing = false;
        this.options = options;
        this.clientHandlers = handlers;
        this.subscriptions = new Subscriptions();
        this.muxSubscriptions = new MuxSubscription();
        this.inbound = new databuffer_1.DataBuffer();
        this.outbound = new databuffer_1.DataBuffer();
    }
    static connect(options, handlers) {
        return new Promise((resolve, reject) => {
            let ph = new ProtocolHandler(options, handlers);
            ph.connectError = reject;
            let connectTimeout = options.connectTimeout || 10000;
            let pongPromise = new Promise((ok, fail) => {
                let timer = setTimeout(() => {
                    fail(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_TIMEOUT));
                }, connectTimeout);
                ph.pongs.push(() => {
                    clearTimeout(timer);
                    ok(true);
                });
            });
            transport_1.WSTransport.connect(options, ph, options.debug)
                .then((transport) => {
                ph.transport = transport;
            })
                .catch((err) => {
                ph.connectError = null;
                reject(err);
            });
            pongPromise.then(() => {
                ph.connectError = null;
                resolve(ph);
            }).catch((err) => {
                ph.connectError = null;
                reject(err);
            });
        });
    }
    static toError(s) {
        let t = s ? s.toLowerCase() : "";
        if (t.indexOf('permissions violation') !== -1) {
            return new error_1.NatsError(s, error_1.ErrorCode.PERMISSIONS_VIOLATION);
        }
        else if (t.indexOf('authorization violation') !== -1) {
            return new error_1.NatsError(s, error_1.ErrorCode.AUTHORIZATION_VIOLATION);
        }
        else {
            return new error_1.NatsError(s, error_1.ErrorCode.NATS_PROTOCOL_ERR);
        }
    }
    processInbound() {
        let m = null;
        while (this.inbound.size()) {
            switch (this.state) {
                case ParserState.CLOSED:
                    return;
                case ParserState.AWAITING_CONTROL:
                    let raw = this.inbound.peek();
                    let buf = util_1.extractProtocolMessage(raw);
                    if ((m = MSG.exec(buf))) {
                        this.payload = new MsgBuffer(m, this.options.payload);
                        this.state = ParserState.AWAITING_MSG_PAYLOAD;
                    }
                    else if ((m = OK.exec(buf))) {
                    }
                    else if ((m = ERR.exec(buf))) {
                        this.processError(m[1]);
                        return;
                    }
                    else if ((m = PONG.exec(buf))) {
                        this.pout = 0;
                        let cb = this.pongs.shift();
                        if (cb) {
                            cb();
                        }
                    }
                    else if ((m = PING.exec(buf))) {
                        this.transport.write(util_1.buildWSMessage(`PONG ${CR_LF}`));
                    }
                    else if ((m = INFO.exec(buf))) {
                        if (!this.infoReceived) {
                            let info = JSON.parse(m[1]);
                            if (info.tls_required && !this.transport.isSecure()) {
                                this.handleError(error_1.NatsError.errorForCode(error_1.ErrorCode.WSS_REQUIRED));
                                return;
                            }
                            let cs = JSON.stringify(new Connect(this.options));
                            this.transport.write(util_1.buildWSMessage(`CONNECT ${cs}${CR_LF}`));
                            this.sendSubscriptions();
                            this.transport.write(util_1.buildWSMessage(`PING ${CR_LF}`));
                            this.infoReceived = true;
                            this.flushPending();
                        }
                    }
                    else {
                        return;
                    }
                    break;
                case ParserState.AWAITING_MSG_PAYLOAD:
                    if (!this.payload) {
                        break;
                    }
                    if (this.inbound.size() < this.payload.length) {
                        let d = this.inbound.drain();
                        this.payload.fill(d);
                        return;
                    }
                    let dd = this.inbound.drain(this.payload.length);
                    this.payload.fill(dd);
                    try {
                        this.processMsg();
                    }
                    catch (ex) {
                    }
                    this.state = ParserState.AWAITING_CONTROL;
                    this.payload = null;
                    break;
            }
            if (m) {
                let psize = m[0].length;
                if (psize >= this.inbound.size()) {
                    this.inbound.drain();
                }
                else {
                    this.inbound.drain(psize);
                }
                m = null;
            }
        }
    }
    processMsg() {
        if (!this.payload || !this.subscriptions.sidCounter) {
            return;
        }
        let m = this.payload;
        let sub = this.subscriptions.get(m.msg.sid);
        if (!sub) {
            return;
        }
        sub.received += 1;
        if (sub.timeout && sub.max === undefined) {
            clearTimeout(sub.timeout);
            sub.timeout = null;
        }
        if (sub.callback) {
            sub.callback(m.msg);
        }
        if (sub.max !== undefined && sub.received >= sub.max) {
            this.unsubscribe(sub.sid);
        }
    }
    sendCommand(cmd) {
        let buf;
        if (typeof cmd === 'string') {
            buf = util_1.stringToUint8Array(cmd);
        }
        else {
            buf = cmd;
        }
        if (cmd) {
            this.outbound.fill(buf);
        }
        if (this.outbound.length() === 1) {
            setTimeout(() => {
                this.flushPending();
            });
        }
        else if (this.outbound.size() > FLUSH_THRESHOLD) {
            this.flushPending();
        }
    }
    publish(subject, data, reply) {
        if (this.isClosed()) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED);
        }
        if (this.noMorePublishing) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_DRAINING);
        }
        let len = Buffer.byteLength(data);
        reply = reply || "";
        let proto;
        if (reply) {
            proto = `PUB ${subject} ${reply} ${len}\r\n`;
        }
        else {
            proto = `PUB ${subject} ${len}\r\n`;
        }
        this.sendCommand(util_1.buildWSMessage(proto, data));
    }
    request(r) {
        this.initMux();
        this.muxSubscriptions.add(r);
        return new Request(r, this);
    }
    subscribe(s) {
        let sub = this.subscriptions.add(s);
        if (sub.queue) {
            this.sendCommand(`SUB ${sub.subject} ${sub.queue} ${sub.sid}\r\n`);
        }
        else {
            this.sendCommand(`SUB ${sub.subject} ${sub.sid}\r\n`);
        }
        return new Subscription(sub, this);
    }
    unsubscribe(sid, max) {
        if (!sid || this.isClosed()) {
            return;
        }
        let s = this.subscriptions.get(sid);
        if (s) {
            if (max) {
                this.sendCommand(`UNSUB ${sid} ${max}\r\n`);
            }
            else {
                this.sendCommand(`UNSUB ${sid}\r\n`);
            }
            s.max = max;
            if (s.max === undefined || s.received >= s.max) {
                this.subscriptions.cancel(s);
            }
        }
    }
    cancelRequest(token, max) {
        if (!token || this.isClosed()) {
            return;
        }
        let r = this.muxSubscriptions.get(token);
        if (r) {
            r.max = max;
            if (r.max === undefined || r.received >= r.max) {
                this.muxSubscriptions.cancel(r);
            }
        }
    }
    flush(f) {
        this.pongs.push(f);
        this.sendCommand(`PING ${CR_LF}`);
    }
    processError(s) {
        let err = ProtocolHandler.toError(s);
        let evt = { error: err };
        this.errorHandler(evt);
    }
    sendSubscriptions() {
        let cmds = [];
        this.subscriptions.all().forEach((s) => {
            if (s.queue) {
                cmds.push(`SUB ${s.subject} ${s.queue} ${s.sid} ${CR_LF}`);
            }
            else {
                cmds.push(`SUB ${s.subject} ${s.sid} ${CR_LF}`);
            }
        });
        if (cmds.length) {
            this.transport.write(util_1.buildWSMessage(cmds.join('')));
        }
    }
    openHandler(_) {
    }
    closeHandler(_) {
        this.close();
        this.clientHandlers.closeHandler();
    }
    errorHandler(evt) {
        let err;
        if (evt) {
            err = evt.error;
        }
        this.handleError(err);
    }
    messageHandler(evt) {
        this.inbound.fill(evt.data);
        this.processInbound();
    }
    close() {
        this.transport.close();
        this.state = ParserState.CLOSED;
    }
    isClosed() {
        return this.transport.isClosed();
    }
    drain() {
        let subs = this.subscriptions.all();
        let promises = [];
        subs.forEach((sub) => {
            let p = this.drainSubscription(sub.sid);
            promises.push(p);
        });
        return new Promise((resolve) => {
            util_1.settle(promises)
                .then((a) => {
                this.noMorePublishing = true;
                setTimeout(() => {
                    this.close();
                    resolve(a);
                });
            })
                .catch(() => {
            });
        });
    }
    drainSubscription(sid) {
        if (this.isClosed()) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED));
        }
        if (!sid) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.SUB_CLOSED));
        }
        let s = this.subscriptions.get(sid);
        if (!s) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.SUB_CLOSED));
        }
        if (s.draining) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.SUB_DRAINING));
        }
        let sub = s;
        return new Promise((resolve) => {
            sub.draining = true;
            this.sendCommand(`UNSUB ${sub.sid}\r\n`);
            this.flush(() => {
                this.subscriptions.cancel(sub);
                resolve(sub);
            });
        });
    }
    flushPending() {
        if (!this.infoReceived) {
            return;
        }
        if (this.outbound.size()) {
            let d = this.outbound.drain();
            this.transport.write(d);
        }
    }
    initMux() {
        let mux = this.subscriptions.getMux();
        if (!mux) {
            let inbox = this.muxSubscriptions.init();
            let sub = defaultSub();
            sub.subject = `${inbox}*`;
            sub.callback = this.muxSubscriptions.dispatcher();
            this.subscriptions.setMux(sub);
            this.subscribe(sub);
        }
    }
    handleError(err) {
        if (this.connectError) {
            this.connectError(err);
            this.connectError = null;
        }
        this.close();
        this.clientHandlers.errorHandler(err);
    }
}
exports.ProtocolHandler = ProtocolHandler;
//# sourceMappingURL=protocol.js.map