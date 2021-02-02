"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const ARRAY_BUFFER = "arraybuffer";
class WSTransport {
    constructor(handlers) {
        this.stream = null;
        this.closed = false;
        this.debug = false;
        this.listeners = {};
        this.handlers = handlers;
    }
    static connect(options, handlers, debug = false) {
        return new Promise((resolve, reject) => {
            let transport = new WSTransport(handlers);
            transport.debug = debug;
            transport.stream = new WebSocket(options.url);
            transport.stream.binaryType = ARRAY_BUFFER;
            transport.listeners = {};
            let connected;
            let resolveTimeout;
            transport.stream.onclose = function (evt) {
                transport.trace('ws closed', evt);
                if (transport.closed) {
                    return;
                }
                if (connected) {
                    transport.handlers.closeHandler(evt);
                    transport.close();
                }
                else {
                    clearTimeout(resolveTimeout);
                    reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_CLOSED));
                }
            };
            transport.stream.onerror = function (evt) {
                let err;
                if (evt) {
                    err = evt.error;
                    if (!err) {
                        let m = evt.message;
                        if (!m) {
                            if (!connected) {
                                err = error_1.NatsError.errorForCode(error_1.ErrorCode.CONNECTION_REFUSED);
                            }
                            else {
                                err = error_1.NatsError.errorForCode(error_1.ErrorCode.UNKNOWN);
                            }
                        }
                        else {
                            err = new error_1.NatsError(m, error_1.ErrorCode.UNKNOWN);
                        }
                    }
                }
                transport.trace('ws error', err);
                if (transport.closed) {
                    return;
                }
                if (transport) {
                    transport.close();
                }
                if (connected) {
                    transport.handlers.errorHandler(evt);
                }
                else {
                    reject(err);
                }
            };
            transport.stream.onopen = function () {
                transport.trace('ws open');
            };
            transport.stream.onmessage = function (me) {
                transport.trace('>', [me.data]);
                if (connected) {
                    transport.handlers.messageHandler(me);
                }
                else {
                    connected = true;
                    resolve(transport);
                    setTimeout(function () {
                        transport.handlers.messageHandler(me);
                    }, 100);
                }
            };
        });
    }
    ;
    isClosed() {
        return this.closed;
    }
    isConnected() {
        return this.stream !== null && this.stream.readyState === WebSocket.OPEN;
    }
    write(data) {
        if (!this.stream || !this.isConnected()) {
            return;
        }
        this.trace('<', [data]);
        this.stream.send(data);
    }
    destroy() {
        if (!this.stream) {
            return;
        }
        if (this.closed) {
            this.stream.onclose = null;
            this.stream.onerror = null;
            this.stream.onopen = null;
            this.stream.onmessage = null;
        }
        if (this.stream.readyState !== WebSocket.CLOSED && this.stream.readyState !== WebSocket.CLOSING) {
            this.stream.close(1000);
        }
        this.stream = null;
    }
    close() {
        this.closed = true;
        if (this.stream && this.stream.bufferedAmount > 0) {
            setTimeout(this.close.bind(this), 100);
            return;
        }
        this.destroy();
    }
    trace(...args) {
        if (this.debug) {
            console.log(args);
        }
    }
    isSecure() {
        if (this.stream) {
            let protocol = new URL(this.stream.url).protocol;
            return protocol.toLowerCase() === "wss:";
        }
        return false;
    }
}
exports.WSTransport = WSTransport;
//# sourceMappingURL=transport.js.map