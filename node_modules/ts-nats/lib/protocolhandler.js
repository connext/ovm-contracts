"use strict";
/*
 * Copyright 2018-2020 The NATS Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_1 = require("./nats");
const muxsubscriptions_1 = require("./muxsubscriptions");
const error_1 = require("./error");
const events_1 = require("events");
const const_1 = require("./const");
const servers_1 = require("./servers");
const tcptransport_1 = require("./tcptransport");
const subscriptions_1 = require("./subscriptions");
const databuffer_1 = require("./databuffer");
const messagebuffer_1 = require("./messagebuffer");
const util_1 = require("./util");
const fs = __importStar(require("fs"));
const nkeys = __importStar(require("ts-nkeys"));
// Protocol
const MSG = /^MSG\s+([^\s\r\n]+)\s+([^\s\r\n]+)\s+(([^\s\r\n]+)[^\S\r\n]+)?(\d+)\r\n/i, OK = /^\+OK\s*\r\n/i, ERR = /^-ERR\s+('.+')?\r\n/i, PING = /^PING\r\n/i, PONG = /^PONG\r\n/i, INFO = /^INFO\s+([^\r\n]+)\r\n/i, SUBRE = /^SUB\s+([^\r\n]+)\r\n/i, CREDS = /\s*(?:(?:[-]{3,}[^\n]*[-]{3,}\n)(.+)(?:\n\s*[-]{3,}[^\n]*[-]{3,}\n))/i, 
// Protocol
SUB = 'SUB', UNSUB = 'UNSUB', CONNECT = 'CONNECT', FLUSH_THRESHOLD = 65536;
const CRLF_BUF = Buffer.from('\r\n');
// Parser state
var ParserState;
(function (ParserState) {
    ParserState[ParserState["CLOSED"] = -1] = "CLOSED";
    ParserState[ParserState["AWAITING_CONTROL"] = 0] = "AWAITING_CONTROL";
    ParserState[ParserState["AWAITING_MSG_PAYLOAD"] = 1] = "AWAITING_MSG_PAYLOAD";
})(ParserState || (ParserState = {}));
var TlsRequirement;
(function (TlsRequirement) {
    TlsRequirement[TlsRequirement["OFF"] = -1] = "OFF";
    TlsRequirement[TlsRequirement["ANY"] = 0] = "ANY";
    TlsRequirement[TlsRequirement["ON"] = 1] = "ON";
})(TlsRequirement || (TlsRequirement = {}));
/**
 * @hidden
 */
class ProtocolHandler extends events_1.EventEmitter {
    constructor(client, options) {
        super();
        this.muxSubscriptions = new muxsubscriptions_1.MuxSubscriptions();
        this.closed = false;
        this.connected = false;
        this.inbound = new databuffer_1.DataBuffer();
        this.info = {};
        this.infoReceived = false;
        this.outbound = new databuffer_1.DataBuffer();
        this.pongs = [];
        this.pout = 0;
        this.reconnecting = false;
        this.ssid = 1;
        this.state = ParserState.AWAITING_CONTROL;
        this.wasConnected = false;
        this.draining = false;
        this.noMorePublishing = false;
        events_1.EventEmitter.call(this);
        this.client = client;
        this.options = options;
        this.encoding = options.encoding || 'utf8';
        this.payload = options.payload || nats_1.Payload.STRING;
        this.subscriptions = new subscriptions_1.Subscriptions();
        this.subscriptions.on('subscribe', (sub) => {
            this.client.emit('subscribe', sub);
        });
        this.subscriptions.on('unsubscribe', (unsub) => {
            this.client.emit('unsubscribe', unsub);
        });
        this.servers = new servers_1.Servers(!this.options.noRandomize, this.options.servers || [], this.options.url);
        this.transport = new tcptransport_1.TCPTransport(this.getTransportHandlers());
    }
    static connect(client, opts) {
        let lastError;
        // loop through all the servers and bail or loop until connect if waitOnFirstConnect
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let ph = new ProtocolHandler(client, opts);
            while (true) {
                let wait = ph.options.reconnectTimeWait || 0;
                let maxWait = wait;
                for (let i = 0; i < ph.servers.length(); i++) {
                    const srv = ph.selectServer();
                    if (srv) {
                        const now = Date.now();
                        if (srv.lastConnect === 0 || srv.lastConnect + wait <= now) {
                            try {
                                yield ph.connect();
                                resolve(ph);
                                ph.startHandshakeTimeout();
                                return;
                            }
                            catch (err) {
                                lastError = err;
                                // if waitOnFirstConnect and fail, remove the server
                                if (!ph.options.waitOnFirstConnect) {
                                    ph.servers.removeCurrentServer();
                                }
                            }
                        }
                        else {
                            maxWait = Math.min(maxWait, srv.lastConnect + wait - now);
                        }
                    }
                }
                // we could have removed all the known servers
                if (ph.servers.length() === 0) {
                    const err = lastError || error_1.NatsError.errorForCode(error_1.ErrorCode.UNABLE_TO_CONNECT);
                    reject(err);
                    return;
                }
                // soonest to retry is maxWait
                yield util_1.delay(maxWait);
            }
        }));
    }
    startHandshakeTimeout() {
        if (this.options.timeout) {
            this.connectionTimer = setTimeout(() => {
                this.processErr('conn_timeout');
            }, this.options.timeout - this.transport.dialDuration());
        }
    }
    flush(cb) {
        if (this.closed) {
            if (typeof cb === 'function') {
                cb(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED));
                return;
            }
            else {
                throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED);
            }
        }
        this.pongs.push(cb);
        this.sendCommand(ProtocolHandler.buildProtocolMessage('PING'));
    }
    closeAndEmit() {
        this.close();
        this.client.emit('close');
    }
    close() {
        this.cancelHeartbeat();
        this.closed = true;
        this.removeAllListeners();
        this.closeStream();
        this.ssid = -1;
        this.subscriptions.close();
        this.muxSubscriptions.close();
        this.state = ParserState.CLOSED;
        this.pongs = [];
        this.outbound.reset();
    }
    ;
    drain() {
        if (this.closed) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED));
        }
        if (this.draining) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_DRAINING));
        }
        this.draining = true;
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
                process.nextTick(() => {
                    // send pending buffer
                    this.flush(() => {
                        this.close();
                        resolve(a);
                    });
                });
            })
                .catch(() => {
                // cannot happen
            });
        });
    }
    publish(subject, data, reply = '') {
        if (this.closed) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED);
        }
        if (this.noMorePublishing) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_DRAINING);
        }
        data = this.toBuffer(data);
        let len = data.length;
        let proto;
        if (reply) {
            proto = `PUB ${subject} ${reply} ${len}`;
        }
        else {
            proto = `PUB ${subject} ${len}`;
        }
        this.sendCommand(ProtocolHandler.buildProtocolMessage(proto, data));
    }
    subscribe(s) {
        if (this.isClosed()) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED);
        }
        if (this.draining) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_DRAINING);
        }
        let sub = this.subscriptions.add(s);
        if (sub.queue) {
            this.sendCommand(ProtocolHandler.buildProtocolMessage(`SUB ${sub.subject} ${sub.queue} ${sub.sid}`));
        }
        else {
            this.sendCommand(ProtocolHandler.buildProtocolMessage(`SUB ${sub.subject} ${sub.sid}`));
        }
        if (s.max) {
            this.unsubscribe(this.ssid, s.max);
        }
        return new nats_1.Subscription(sub, this);
    }
    drainSubscription(sid) {
        if (this.closed) {
            return Promise.reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED));
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
            this.sendCommand(ProtocolHandler.buildProtocolMessage(`UNSUB ${sid}`));
            this.flush(() => {
                this.subscriptions.cancel(sub);
                resolve({ sid: sub.sid, subject: sub.subject, queue: sub.queue });
            });
        });
    }
    unsubscribe(sid, max) {
        if (!sid || this.closed) {
            return;
        }
        let s = this.subscriptions.get(sid);
        if (s) {
            if (max) {
                this.sendCommand(ProtocolHandler.buildProtocolMessage(`${UNSUB} ${sid} ${max}`));
            }
            else {
                this.sendCommand(ProtocolHandler.buildProtocolMessage(`${UNSUB} ${sid}`));
            }
            s.max = max;
            if (s.max === undefined || s.received >= s.max) {
                this.subscriptions.cancel(s);
            }
        }
    }
    request(r) {
        if (this.closed) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_CLOSED);
        }
        if (this.draining) {
            throw error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_DRAINING);
        }
        this.initMux();
        this.muxSubscriptions.add(r);
        return new Request(r, this);
    }
    numSubscriptions() {
        return this.subscriptions.length;
    }
    isClosed() {
        return this.closed;
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
    connect() {
        this.currentServer.lastConnect = Date.now();
        this.prepareConnection();
        if (this.reconnecting) {
            this.currentServer.reconnects += 1;
            this.client.emit('reconnecting', this.url.href);
        }
        return this.transport.connect(this.url, this.options.timeout);
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
    static buildProtocolMessage(protocol, payload) {
        let protoLen = Buffer.byteLength(protocol);
        let cmd = protoLen + 2;
        let len = cmd;
        if (payload) {
            len += payload.byteLength + 2;
        }
        let buf = Buffer.allocUnsafe(len);
        buf.write(protocol);
        CRLF_BUF.copy(buf, protoLen);
        if (payload) {
            payload.copy(buf, cmd);
            CRLF_BUF.copy(buf, buf.byteLength - 2);
        }
        return buf;
    }
    sendCommand(cmd) {
        // Buffer to cut down on system calls, increase throughput.
        // When receive gets faster, should make this Buffer based..
        if (this.closed) {
            return;
        }
        let buf;
        if (typeof cmd === 'string') {
            let len = Buffer.byteLength(cmd);
            buf = Buffer.allocUnsafe(len);
            buf.write(cmd, 0, len, 'utf8');
        }
        else {
            buf = cmd;
        }
        if (buf.byteLength === 0) {
            return;
        }
        this.outbound.fill(buf);
        if (this.outbound.length() === 1) {
            setImmediate(() => {
                this.flushPending();
            });
        }
        else if (this.outbound.size() > FLUSH_THRESHOLD) {
            this.flushPending();
        }
    }
    getTransportHandlers() {
        let handlers = {};
        handlers.connect = () => {
            this.connected = true;
        };
        handlers.close = () => {
            this.cancelHeartbeat();
            let wasConnected = this.connected;
            this.closeStream();
            if (wasConnected) {
                this.client.emit('disconnect', this.currentServer.url.href);
            }
            if (this.closed) {
                this.closeAndEmit();
            }
            else {
                this.scheduleReconnect();
            }
        };
        handlers.error = (exception) => {
            // If we were connected just return, close event will process
            if (this.wasConnected && this.currentServer.didConnect) {
                return;
            }
            // if the current server did not connect at all, and we in
            // general have not connected to any server, remove it from
            // this list. Unless overridden
            if (!this.wasConnected && !this.currentServer.didConnect) {
                // We can override this behavior with waitOnFirstConnect, which will
                // treat it like a reconnect scenario.
                if (this.options.waitOnFirstConnect) {
                    // Pretend to move us into a reconnect state.
                    this.currentServer.didConnect = true;
                }
                else {
                    this.servers.removeCurrentServer();
                }
            }
            // Only bubble up error if we never had connected
            // to the server and we only have one.
            if (!this.wasConnected && this.servers.length() === 0) {
                this.client.emit('error', new error_1.NatsError(error_1.CONN_ERR_PREFIX + exception, error_1.ErrorCode.CONN_ERR, exception));
            }
            this.closeStream();
        };
        handlers.data = (data) => {
            // If inbound exists, concat them together. We try to avoid this for split
            // messages, so this should only really happen for a split control line.
            // Long term answer is hand rolled parser and not regexp.
            this.inbound.fill(data);
            // Process the inbound queue.
            this.processInbound();
        };
        return handlers;
    }
    prepareConnection() {
        // Commands may have been queued during reconnect. Discard everything except:
        // 1) ping requests with a pong callback
        // 2) publish requests
        //
        // Rationale: CONNECT and SUBs are written directly upon connecting, any PONG
        // response is no longer relevant, and any UNSUB will be accounted for when we
        // sync our SUBs. Without this, users of the client may miss state transitions
        // via callbacks, would have to track the client's internal connection state,
        // and may have to double buffer messages (which we are already doing) if they
        // wanted to ensure their messages reach the server.
        // copy outbound and reset it
        let buffers = this.outbound.reset();
        let pongs = [];
        if (buffers.length) {
            let pongIndex = 0;
            // find all the pings with associated callback, and pubs
            buffers.forEach((buf) => {
                let cmd = buf.toString('binary');
                if (PING.test(cmd) && this.pongs !== null && pongIndex < this.pongs.length) {
                    let f = this.pongs[pongIndex++];
                    if (f) {
                        this.outbound.fill(buf);
                        pongs.push(f);
                    }
                }
                else if (cmd.length > 3 && cmd[0] === 'P' && cmd[1] === 'U' && cmd[2] === 'B') {
                    this.outbound.fill(buf);
                }
            });
        }
        this.pongs = pongs;
        this.state = ParserState.AWAITING_CONTROL;
        // Clear info processing.
        this.info = {};
        this.infoReceived = false;
    }
    ;
    getInfo() {
        if (this.infoReceived) {
            return this.info;
        }
        return null;
    }
    /**
     * Strips all SUBS commands from pending during initial connection completed since
     * we send the subscriptions as a separate operation.
     *
     * @api private
     */
    stripPendingSubs() {
        if (this.outbound.size() === 0) {
            return;
        }
        // FIXME: outbound doesn't peek so there's no packing
        let buffers = this.outbound.reset();
        for (let i = 0; i < buffers.length; i++) {
            let s = buffers[i].toString('binary');
            if (!SUBRE.test(s)) {
                // requeue the command
                this.sendCommand(buffers[i]);
            }
        }
    }
    /**
     * Sends existing subscriptions to new server after reconnect.
     *
     * @api private
     */
    sendSubscriptions() {
        if (this.subscriptions.length === 0 || !this.transport.isConnected()) {
            return;
        }
        let cmds = [];
        this.subscriptions.all().forEach((s) => {
            if (s.queue) {
                cmds.push(`${SUB} ${s.subject} ${s.queue} ${s.sid}${const_1.CR_LF}`);
            }
            else {
                cmds.push(`${SUB} ${s.subject} ${s.sid}${const_1.CR_LF}`);
            }
            if (s.max) {
                const max = s.max - s.received;
                if (max > 0) {
                    cmds.push(`${UNSUB} ${s.sid} ${max}${const_1.CR_LF}`);
                }
                else {
                    cmds.push(`${UNSUB} ${s.sid}${const_1.CR_LF}`);
                }
            }
        });
        if (cmds.length) {
            this.transport.write(cmds.join(''));
        }
    }
    /**
     * Process the inbound data queue.
     *
     * @api private
     */
    processInbound() {
        // Hold any regex matches.
        let m;
        // For optional yield
        let start;
        if (!this.transport) {
            // if we are here, the stream was reaped and errors raised
            // if we continue.
            return;
        }
        // unpause if needed.
        this.transport.resume();
        if (this.options.yieldTime !== undefined) {
            start = Date.now();
        }
        while (!this.closed && this.inbound.size()) {
            switch (this.state) {
                case ParserState.AWAITING_CONTROL:
                    // Regex only works on strings, so convert once to be more efficient.
                    // Long term answer is a hand rolled parser, not regex.
                    let len = this.inbound.protoLen();
                    if (len === -1) {
                        return;
                    }
                    let bb = this.inbound.drain(len);
                    if (bb.byteLength === 0) {
                        return;
                    }
                    // specifying an encoding here like 'ascii' slows it down
                    let buf = bb.toString();
                    if ((m = MSG.exec(buf)) !== null) {
                        this.msgBuffer = new messagebuffer_1.MsgBuffer(m, this.payload, this.encoding);
                        this.state = ParserState.AWAITING_MSG_PAYLOAD;
                    }
                    else if ((m = OK.exec(buf)) !== null) {
                        // Ignore for now..
                    }
                    else if ((m = ERR.exec(buf)) !== null) {
                        if (this.processErr(m[1])) {
                            return;
                        }
                    }
                    else if ((m = PONG.exec(buf)) !== null) {
                        this.pout = 0;
                        let cb = this.pongs && this.pongs.shift();
                        if (cb) {
                            try {
                                cb();
                            }
                            catch (err) {
                                console.error('error while processing pong', err);
                            }
                        } // FIXME: Should we check for exceptions?
                    }
                    else if ((m = PING.exec(buf)) !== null) {
                        this.sendCommand(ProtocolHandler.buildProtocolMessage('PONG'));
                    }
                    else if ((m = INFO.exec(buf)) !== null) {
                        this.info = JSON.parse(m[1]);
                        // Check on TLS mismatch.
                        if (this.checkTLSMismatch()) {
                            return;
                        }
                        if (this.checkNoEchoMismatch()) {
                            return;
                        }
                        if (this.checkNonceSigner()) {
                            return;
                        }
                        // Always try to read the connect_urls from info
                        let change = this.servers.processServerUpdate(this.info);
                        if (change.deleted.length > 0 || change.added.length > 0) {
                            this.client.emit('serversChanged', change);
                        }
                        // Process first INFO
                        if (!this.infoReceived) {
                            // Switch over to TLS as needed.
                            // are we a tls socket?
                            let encrypted = this.transport.isEncrypted();
                            if (this.info.tls_required === true && !encrypted) {
                                this.transport.upgrade(this.options.tls, () => {
                                    this.flushPending();
                                });
                            }
                            // Send the connect message and subscriptions immediately
                            let cs = JSON.stringify(new Connect(this.currentServer, this.options, this.info));
                            this.transport.write(`${CONNECT} ${cs}${const_1.CR_LF}`);
                            this.pongs.unshift(() => {
                                if (this.connectionTimer) {
                                    clearTimeout(this.connectionTimer);
                                    this.connectionTimer = undefined;
                                }
                                this.sendSubscriptions();
                                this.stripPendingSubs();
                                this.scheduleHeartbeat();
                                this.connectCB();
                            });
                            this.transport.write(ProtocolHandler.buildProtocolMessage('PING'));
                            // Mark as received
                            this.flushPending();
                            this.infoReceived = true;
                        }
                    }
                    else {
                        // FIXME, check line length for something weird.
                        // Nothing here yet, return
                        return;
                    }
                    break;
                case ParserState.AWAITING_MSG_PAYLOAD:
                    if (!this.msgBuffer) {
                        break;
                    }
                    // wait for more data to arrive
                    if (this.inbound.size() < this.msgBuffer.length) {
                        return;
                    }
                    // drain the number of bytes we need
                    let dd = this.inbound.drain(this.msgBuffer.length);
                    this.msgBuffer.fill(dd);
                    this.processMsg();
                    this.state = ParserState.AWAITING_CONTROL;
                    this.msgBuffer = null;
                    // Check to see if we have an option to yield for other events after yieldTime.
                    if (start !== undefined && this.options && this.options.yieldTime) {
                        if ((Date.now() - start) > this.options.yieldTime) {
                            this.transport.pause();
                            this.client.emit('yield');
                            setImmediate(() => {
                                this.processInbound();
                            });
                            return;
                        }
                    }
                    break;
            }
        }
    }
    clientTLSRequirement() {
        if (this.options.tls === undefined) {
            return TlsRequirement.ANY;
        }
        if (this.options.tls === false) {
            return TlsRequirement.OFF;
        }
        return TlsRequirement.ON;
    }
    /**
     * Check for TLS configuration mismatch.
     *
     * @api private
     */
    checkTLSMismatch() {
        switch (this.clientTLSRequirement()) {
            case TlsRequirement.OFF:
                if (this.info.tls_required) {
                    this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.SECURE_CONN_REQ));
                    this.closeStream();
                    return true;
                }
                break;
            case TlsRequirement.ON:
                if (!this.info.tls_required) {
                    this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.NON_SECURE_CONN_REQ));
                    this.closeStream();
                    return true;
                }
                break;
            case TlsRequirement.ANY:
                // tls auto-upgrade
                break;
        }
        let cert = false;
        if (this.options.tls && typeof this.options.tls === 'object') {
            cert = this.options.tls.cert != null;
        }
        if (this.info.tls_verify && !cert) {
            this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.CLIENT_CERT_REQ));
            this.closeStream();
            return true;
        }
        return false;
    }
    /**
     * Check no echo
     * @api private
     */
    checkNoEchoMismatch() {
        if ((this.info.proto === undefined || this.info.proto < 1) && this.options.noEcho) {
            this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.NO_ECHO_NOT_SUPPORTED));
            this.closeStream();
            return true;
        }
        return false;
    }
    checkNonceSigner() {
        if (this.info.nonce === undefined) {
            return false;
        }
        if (this.options.nkeyCreds) {
            try {
                let seed = nkeys.fromSeed(this.getNkeyCreds());
                this.options.nkey = seed.getPublicKey().toString();
                this.options.nonceSigner = (nonce) => {
                    return this.nkeyNonceSigner(Buffer.from(nonce));
                };
            }
            catch (err) {
                this.client.emit('error', err);
                this.closeStream();
                return true;
            }
        }
        if (this.options.userCreds) {
            try {
                // simple test that we got a creds file - exception is thrown
                // if the file is not a valid creds file
                this.getUserCreds(true);
                this.options.nonceSigner = (nonce) => {
                    return this.credsNonceSigner(Buffer.from(nonce));
                };
                this.options.userJWT = () => {
                    return this.loadJwt();
                };
            }
            catch (err) {
                this.client.emit('error', err);
                this.closeStream();
                return true;
            }
        }
        if (this.options.nonceSigner === undefined) {
            this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.SIGNATURE_REQUIRED));
            this.closeStream();
            return true;
        }
        if (this.options.nkey === undefined && this.options.userJWT === undefined) {
            this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.NKEY_OR_JWT_REQ));
            this.closeStream();
            return true;
        }
        return false;
    }
    getNkeyCreds() {
        if (this.options.nkeyCreds) {
            return fs.readFileSync(this.options.nkeyCreds);
        }
        throw error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_NKEY_SEED);
    }
    // returns a regex array - first match is the jwt, second match is the nkey
    getUserCreds(jwt = false) {
        if (this.options.userCreds) {
            let buf = fs.readFileSync(this.options.userCreds);
            if (buf) {
                let re = jwt ? CREDS : new RegExp(CREDS, 'g');
                let contents = buf.toString();
                // first match jwt
                let m = re.exec(contents);
                if (m === null) {
                    throw error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_CREDS);
                }
                if (jwt) {
                    return m;
                }
                // second match the seed
                m = re.exec(contents);
                if (m === null) {
                    throw error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_CREDS);
                }
                return m;
            }
        }
        throw error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_CREDS);
    }
    // built-in handler for signing nonces based on a nkey seed file
    nkeyNonceSigner(nonce) {
        try {
            let m = this.getNkeyCreds();
            let sk = nkeys.fromSeed(m);
            return sk.sign(nonce);
        }
        catch (ex) {
            this.closeStream();
            this.client.emit('error', ex);
        }
    }
    // built-in handler for signing nonces based on user creds file
    credsNonceSigner(nonce) {
        try {
            let m = this.getUserCreds();
            let sk = nkeys.fromSeed(Buffer.from(m[1]));
            return sk.sign(nonce);
        }
        catch (ex) {
            this.closeStream();
            this.client.emit('error', ex);
        }
    }
    // built-in handler for loading user jwt based on user creds file
    loadJwt() {
        try {
            let m = this.getUserCreds(true);
            return m[1];
        }
        catch (ex) {
            this.closeStream();
            this.client.emit('error', ex);
        }
    }
    /**
     * Process a delivered message and deliver to appropriate subscriber.
     *
     * @api private
     */
    processMsg() {
        if (this.subscriptions.length === 0 || !this.msgBuffer) {
            return;
        }
        let sub = this.subscriptions.get(this.msgBuffer.msg.sid);
        if (!sub) {
            return;
        }
        sub.received += 1;
        // cancel the timeout if we got the expected number of messages
        if (sub.timeout && (sub.max === undefined || sub.received >= sub.max)) {
            nats_1.Subscription.cancelTimeout(sub);
        }
        // if we got max number of messages, unsubscribe
        if (sub.max !== undefined && sub.received >= sub.max) {
            this.unsubscribe(sub.sid);
        }
        if (sub.callback) {
            try {
                if (this.msgBuffer.error) {
                    sub.callback(this.msgBuffer.error, this.msgBuffer.msg);
                }
                else {
                    sub.callback(null, this.msgBuffer.msg);
                }
            }
            catch (error) {
                // client could have died
                this.client.emit('error', error);
            }
        }
    }
    ;
    static toError(s) {
        let t = s ? s.toLowerCase() : '';
        if (t.indexOf('permissions violation') !== -1) {
            return new error_1.NatsError(s, error_1.ErrorCode.PERMISSIONS_VIOLATION);
        }
        else if (t.indexOf('authorization violation') !== -1) {
            return new error_1.NatsError(s, error_1.ErrorCode.AUTHORIZATION_VIOLATION);
        }
        else if (t.indexOf('conn_timeout') !== -1) {
            return error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_TIMEOUT);
        }
        else {
            return new error_1.NatsError(s, error_1.ErrorCode.NATS_PROTOCOL_ERR);
        }
    }
    /**
     * ProcessErr processes any error messages from the server
     * Return true if the error closed the connection
     * @api private
     */
    processErr(s) {
        // current NATS clients, will raise an error and close on any errors
        // except stale connection and permission errors
        let err = ProtocolHandler.toError(s);
        switch (err.code) {
            case error_1.ErrorCode.AUTHORIZATION_VIOLATION:
                this.client.emit('error', err);
                // closeStream() triggers a reconnect if allowed
                this.closeStream();
                return true;
            case error_1.ErrorCode.PERMISSIONS_VIOLATION:
                // just emit
                this.client.emit('permissionError', err);
                return false;
            case error_1.ErrorCode.CONN_TIMEOUT:
                this.client.emit('error', error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_TIMEOUT));
                this.closeStream();
                return true;
            default:
                this.client.emit('error', err);
                // closeStream() triggers a reconnect if allowed
                this.closeStream();
                return true;
        }
    }
    ;
    /**
     * Close down the stream and clear state.
     *
     * @api private
     */
    closeStream() {
        this.transport.destroy();
        if (this.connected || this.closed) {
            this.pongs = [];
            this.pout = 0;
            this.connected = false;
            this.inbound.reset();
        }
    }
    ;
    /**
     * Setup a timer event to attempt reconnect.
     *
     * @api private
     */
    scheduleReconnect() {
        if (this.closed) {
            return;
        }
        // Just return if no more servers or if no reconnect is desired
        if (this.servers.length() === 0 || this.options.reconnect === false) {
            this.closeAndEmit();
            return;
        }
        // Don't set reconnecting state if we are just trying for the first time.
        if (this.wasConnected) {
            this.reconnecting = true;
        }
        let wait = this.options.reconnectTimeWait || 0;
        let maxWait = wait;
        const now = Date.now();
        for (let i = 0; i < this.servers.length(); i++) {
            const srv = this.selectServer();
            if (srv) {
                const mra = this.options.maxReconnectAttempts || 0;
                if (mra !== -1 && srv.reconnects >= mra) {
                    this.servers.removeCurrentServer();
                    continue;
                }
                // if never connected or last connect is past the wait, try right away
                if (srv.lastConnect === 0 || srv.lastConnect + wait <= now) {
                    this.reconnect();
                    return;
                }
                // start collecting min retry
                maxWait = Math.min(maxWait, srv.lastConnect + wait - now);
            }
        }
        // we could have removed all the known servers
        if (this.servers.length() === 0) {
            this.closeAndEmit();
            return;
        }
        // soonest to retry is maxWait
        setTimeout(() => {
            this.scheduleReconnect();
        }, maxWait);
    }
    scheduleHeartbeat() {
        this.pingTimer = setTimeout(() => {
            this.client.emit('pingtimer');
            if (this.closed) {
                return;
            }
            // we could be waiting on the socket to connect
            if (this.transport.isConnected()) {
                this.client.emit('pingcount', this.pout);
                this.pout++;
                // @ts-ignore
                if (this.pout > this.options.maxPingOut) {
                    // processErr will scheduleReconnect
                    this.processErr(error_1.ErrorCode.STALE_CONNECTION_ERR);
                    // don't reschedule, new connection initiated
                    return;
                }
                else {
                    // send the ping
                    this.sendCommand(ProtocolHandler.buildProtocolMessage('PING'));
                    if (this.pongs) {
                        // no callback
                        this.pongs.push(undefined);
                    }
                }
            }
            // reschedule
            this.scheduleHeartbeat();
        }, this.options.pingInterval || const_1.DEFAULT_PING_INTERVAL, this);
    }
    cancelHeartbeat() {
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
            delete this.pingTimer;
        }
    }
    /**
     * Reconnect to the server.
     *
     * @api private
     */
    reconnect() {
        if (this.closed) {
            return;
        }
        const ph = this;
        this.connect().then(() => {
            ph.startHandshakeTimeout();
            // all good the pong handler deals with it
        }).catch(() => {
            // the stream handler deals with it
        });
    }
    /**
     * Properly select the next server.
     * We rotate the server list as we go,
     * we also pull auth from urls as needed, or
     * if they were set in options use that as override.
     *
     * @api private
     */
    selectServer() {
        let server = this.servers.selectServer();
        if (server === undefined) {
            return undefined;
        }
        // Place in client context.
        this.currentServer = server;
        this.url = server.url;
        return this.currentServer;
    }
    toBuffer(data = undefined) {
        if (this.options.payload === nats_1.Payload.JSON) {
            // undefined is not a valid JSON-serializable value, but null is
            data = data === undefined ? null : data;
            try {
                data = JSON.stringify(data);
            }
            catch (e) {
                throw error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_JSON);
            }
        }
        else {
            data = data || const_1.EMPTY;
        }
        // if not a buffer, it is already serialized json or a string
        if (!Buffer.isBuffer(data)) {
            // must be utf8 - omitting encoding to prevent clever change
            data = Buffer.from(data);
        }
        return data;
    }
    initMux() {
        let mux = this.subscriptions.getMux();
        if (!mux) {
            let inbox = this.muxSubscriptions.init();
            let sub = nats_1.defaultSub();
            // dot is already part of mux
            sub.subject = `${inbox}*`;
            sub.callback = this.muxSubscriptions.dispatcher();
            this.subscriptions.setMux(sub);
            this.subscribe(sub);
        }
    }
    /**
     * Callback for first flush/connect.
     *
     * @api private
     */
    connectCB() {
        let event = this.reconnecting ? 'reconnect' : 'connect';
        this.reconnecting = false;
        this.wasConnected = true;
        if (this.currentServer) {
            this.currentServer.didConnect = true;
            this.currentServer.reconnects = 0;
        }
        // copy the info
        let info = {};
        try {
            info = JSON.parse(JSON.stringify(this.info));
        }
        catch (err) {
            // ignore
        }
        this.client.emit(event, this.client, this.currentServer.url.href, info);
        this.flushPending();
    }
}
exports.ProtocolHandler = ProtocolHandler;
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
class Connect {
    constructor(server, opts, info) {
        this.lang = 'typescript';
        this.version = nats_1.VERSION;
        this.verbose = false;
        this.pedantic = false;
        this.protocol = 1;
        opts = opts || {};
        if (opts.user) {
            this.user = opts.user;
            this.pass = opts.pass;
        }
        if (opts.token) {
            this.auth_token = opts.token;
        }
        let auth = server.getCredentials();
        if (auth) {
            if (auth.length !== 1) {
                if (this.user === undefined) {
                    this.user = auth[0];
                }
                if (this.pass === undefined) {
                    this.pass = auth[1];
                }
            }
            else if (this.auth_token === undefined) {
                this.auth_token = auth[0];
            }
        }
        if (opts.name) {
            this.name = opts.name;
        }
        if (opts.verbose !== undefined) {
            this.verbose = opts.verbose;
        }
        if (opts.pedantic !== undefined) {
            this.pedantic = opts.pedantic;
        }
        if (opts.noEcho) {
            this.echo = false;
        }
        if (info.nonce && opts.nonceSigner) {
            let sig = opts.nonceSigner(info.nonce);
            this.sig = sig.toString('base64');
        }
        if (opts.userJWT) {
            if (typeof opts.userJWT === 'function') {
                this.jwt = opts.userJWT();
            }
            else {
                this.jwt = opts.userJWT;
            }
        }
        if (opts.nkey) {
            this.nkey = opts.nkey;
        }
    }
}
exports.Connect = Connect;
//# sourceMappingURL=protocolhandler.js.map