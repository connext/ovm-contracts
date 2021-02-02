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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const natsws = __importStar(require("@provide/nats.ws"));
const env_1 = require("./env");
const uuidv4 = require('uuid/v4');
class NatsWebsocketService {
    constructor(log, servers, bearerToken, token) {
        this.pubCount = 0;
        this.subscriptions = {};
        this.bearerToken = bearerToken;
        this.config = env_1.Config.fromEnv();
        this.log = log;
        this.servers = servers ? servers : (this.config.natsServers || '').split(',');
        this.token = token ? token : this.config.natsToken;
    }
    connect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection && !this.connection.isClosed()) {
                (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug('Attempted to establish NATS connection short-circuirted; connection is already open');
                return Promise.resolve(this.connection);
            }
            return new Promise((resolve, reject) => {
                const clientId = `${this.config.natsClientPrefix}-${uuidv4()}`;
                natsws.connect({
                    name: clientId,
                    noEcho: this.config.natsNoEcho,
                    pedantic: this.config.natsPedantic,
                    token: this.token || undefined,
                    url: this.servers[0],
                    userJWT: this.bearerToken || undefined,
                    verbose: this.config.natsVerbose,
                }).then((nc) => {
                    this.connection = nc;
                    nc.addEventListener('close', () => {
                        var _a;
                        (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug('Connection closed');
                        this.connection = null;
                    });
                    nc.addEventListener('error', () => {
                        var _a;
                        if (nc.isClosed()) {
                            (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug('Connection closed');
                            this.connection = null;
                        }
                    });
                    resolve(nc);
                }).catch((err) => {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`Error establishing NATS connection: ${clientId}; ${err}"`);
                    reject(err);
                });
            });
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            return new Promise((resolve, reject) => {
                this.flush().then(() => {
                    var _a, _b;
                    (_a = this.connection) === null || _a === void 0 ? void 0 : _a.drain();
                    (_b = this.connection) === null || _b === void 0 ? void 0 : _b.close();
                    this.connection = null;
                    resolve();
                }).catch((err) => {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`NATS flush failed; ${err}`);
                    reject(err);
                });
            });
        });
    }
    getSubscribedSubjects() {
        return Object.keys(this.subscriptions);
    }
    isConnected() {
        return this.connection ? !this.connection.isClosed() : false;
    }
    publish(subject, payload, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            return new Promise((resolve) => {
                var _a;
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.publish(subject, payload, reply);
                this.pubCount++;
                resolve();
            });
        });
    }
    publishCount() {
        return this.pubCount;
    }
    request(subject, timeout, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            return new Promise((resolve, reject) => {
                var _a;
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.request(subject, timeout, data).then((msg) => {
                    resolve(msg);
                }).catch((err) => {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`NATS request failed; ${err}`);
                    reject(err);
                });
            });
        });
    }
    subscribe(subject, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            return new Promise((resolve, reject) => {
                var _a;
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.subscribe(subject, callback).then((sub) => {
                    this.subscriptions[subject] = sub;
                    resolve(sub);
                }).catch((err) => {
                    var _a;
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`NATS subscription failed; ${err}`);
                    callback(undefined, err);
                    reject(err);
                });
            });
        });
    }
    unsubscribe(subject) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            const sub = this.subscriptions[subject];
            if (!sub) {
                (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`Unable to unsubscribe from subject: ${subject}; subscription not found`);
                return;
            }
            sub.unsubscribe();
            delete this.subscriptions[subject];
        });
    }
    flush() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnected();
            return (_a = this.connection) === null || _a === void 0 ? void 0 : _a.flush();
        });
    }
    assertConnected() {
        if (!this.connection) {
            throw new Error('No connection established');
        }
        if (this.connection.isClosed()) {
            throw new Error(`Connection is closed`);
        }
    }
}
exports.NatsWebsocketService = NatsWebsocketService;
//# sourceMappingURL=natsws.js.map