"use strict";
/*
 * Copyright 2018-2019 The NATS Authors
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const tls = __importStar(require("tls"));
const tls_1 = require("tls");
const error_1 = require("./error");
/**
 * @hidden
 */
class TCPTransport {
    constructor(handlers) {
        this.connectedOnce = false;
        this.stream = null;
        this.closed = false;
        this.dialTime = 0;
        this.handlers = handlers;
    }
    connect(url, timeout) {
        let dialStart = 0;
        if (timeout) {
            dialStart = Date.now();
        }
        return new Promise((resolve, reject) => {
            // Create the stream
            // See #45 if we have a stream release the listeners
            // otherwise in addition to the leak events will fire fire
            if (this.stream) {
                this.destroy();
            }
            let connected = false;
            let to;
            if (timeout) {
                to = setTimeout(() => {
                    if (!this.connectedOnce) {
                        reject(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_TIMEOUT));
                        this.destroy();
                    }
                    else {
                        // if the client didn't resolve, the error handler
                        // is not set, so emitting 'error' will shutdown node
                        this.handlers.error(error_1.NatsError.errorForCode(error_1.ErrorCode.CONN_TIMEOUT));
                    }
                }, timeout);
            }
            // @ts-ignore typescript requires this parsed to a number
            this.stream = net.createConnection(parseInt(url.port, 10), url.hostname, () => {
                if (to) {
                    this.dialTime = Date.now() - dialStart;
                    clearTimeout(to);
                    to = undefined;
                }
                resolve();
                connected = true;
                this.connectedOnce = true;
                this.handlers.connect();
            });
            // @ts-ignore
            this.stream.setNoDelay(true);
            // @ts-ignore
            this.stream.on('error', (error) => {
                if (!this.connectedOnce) {
                    reject(error);
                    this.destroy();
                }
                else {
                    // if the client didn't resolve, the error handler
                    // is not set, so emitting 'error' will shutdown node
                    this.handlers.error(error);
                }
            });
            // @ts-ignore
            this.stream.on('close', () => {
                if (this.connectedOnce) {
                    this.handlers.close();
                }
            });
            // @ts-ignore
            this.stream.on('data', (data) => {
                // console.log('data', '< ', data.toString());
                this.handlers.data(data);
            });
        });
    }
    isClosed() {
        return this.closed;
    }
    isConnected() {
        return this.stream != null && !this.stream.connecting;
    }
    isEncrypted() {
        return this.stream instanceof tls_1.TLSSocket && this.stream.encrypted;
    }
    isAuthorized() {
        return this.stream instanceof tls_1.TLSSocket && this.stream.authorized;
    }
    upgrade(tlsOptions, done) {
        if (this.stream) {
            let opts;
            if ('object' === typeof tlsOptions) {
                opts = tlsOptions;
            }
            else {
                opts = {};
            }
            opts.socket = this.stream;
            this.stream.removeAllListeners();
            try {
                this.stream = tls.connect(opts, () => {
                    done();
                });
                this.stream.on('error', (error) => {
                    this.handlers.error(error);
                });
                this.stream.on('close', () => {
                    this.handlers.close();
                });
                this.stream.on('data', (data) => {
                    this.handlers.data(data);
                });
            }
            catch (err) {
                this.handlers.error(new error_1.NatsError(error_1.Messages.getMessage(error_1.ErrorCode.SSL_ERR), error_1.ErrorCode.SSL_ERR, err));
            }
        }
    }
    write(data) {
        // if (typeof data === 'string') {
        //     console.log('>', [data]);
        // } else {
        //     console.log('>', [data.toString('binary')]);
        // }
        if (this.stream) {
            this.stream.write(data);
        }
    }
    destroy() {
        if (!this.stream) {
            return;
        }
        if (this.closed) {
            this.stream.removeAllListeners();
        }
        this.stream.destroy();
        this.stream = null;
    }
    close() {
        this.closed = true;
        this.destroy();
    }
    pause() {
        if (this.stream) {
            this.stream.pause();
        }
    }
    resume() {
        if (this.stream && this.stream.isPaused()) {
            this.stream.resume();
        }
    }
    dialDuration() {
        return this.dialTime;
    }
}
exports.TCPTransport = TCPTransport;
//# sourceMappingURL=tcptransport.js.map