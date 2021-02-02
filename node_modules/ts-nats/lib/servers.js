"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const url = __importStar(require("url"));
const const_1 = require("./const");
const util_1 = require("./util");
/**
 * @hidden
 */
class Server {
    constructor(u, implicit = false) {
        // add scheme if not specified
        if (!/^.*:\/\/.*/.test(u)) {
            u = `nats://${u}`;
        }
        this.url = url.parse(u);
        if (!this.url.port) {
            this.url.port = `${const_1.DEFAULT_PORT}`;
        }
        this.didConnect = false;
        this.reconnects = 0;
        this.lastConnect = 0;
        this.implicit = implicit;
    }
    toString() {
        return this.url.href || '';
    }
    getCredentials() {
        if ('auth' in this.url && !!this.url.auth) {
            return this.url.auth.split(':');
        }
        return undefined;
    }
}
exports.Server = Server;
/**
 * @hidden
 */
class Servers {
    constructor(randomize, urls, firstServer) {
        this.firstSelect = true;
        this.servers = [];
        if (urls) {
            urls.forEach(element => {
                this.servers.push(new Server(element));
            });
            if (randomize) {
                this.servers = util_1.shuffle(this.servers);
            }
        }
        if (firstServer) {
            let index = urls.indexOf(firstServer);
            if (index === -1) {
                this.addServer(firstServer, false);
            }
            else {
                let fs = this.servers[index];
                this.servers.splice(index, 1);
                this.servers.unshift(fs);
            }
        }
        else {
            if (this.servers.length === 0) {
                this.addServer(const_1.DEFAULT_URI, false);
            }
        }
        this.currentServer = this.servers[0];
    }
    getCurrentServer() {
        return this.currentServer;
    }
    addServer(u, implicit = false) {
        this.servers.push(new Server(u, implicit));
    }
    selectServer() {
        // allow using select without breaking the order of the servers
        if (this.firstSelect) {
            this.firstSelect = false;
            return this.currentServer;
        }
        let t = this.servers.shift();
        if (t) {
            this.servers.push(t);
            this.currentServer = t;
        }
        return t;
    }
    removeCurrentServer() {
        this.removeServer(this.currentServer);
    }
    removeServer(server) {
        if (server) {
            let index = this.servers.indexOf(server);
            this.servers.splice(index, 1);
        }
    }
    length() {
        return this.servers.length;
    }
    next() {
        return this.servers.length ? this.servers[0] : undefined;
    }
    getServers() {
        return this.servers;
    }
    processServerUpdate(info) {
        let added = [];
        let deleted = [];
        if (info.connect_urls && info.connect_urls.length > 0) {
            let discovered = {};
            info.connect_urls.forEach(server => {
                // protocol in node includes the ':'
                let protocol = this.currentServer.url.protocol;
                let u = `${protocol}//${server}`;
                discovered[u] = new Server(u, true);
            });
            // remove implicit servers that are no longer reported
            let toDelete = [];
            this.servers.forEach((s, index) => {
                let u = s.toString();
                if (s.implicit && this.currentServer.url.href !== u && discovered[u] === undefined) {
                    // server was removed
                    toDelete.push(index);
                }
                // remove this entry from reported
                delete discovered[u];
            });
            // perform the deletion
            toDelete.reverse();
            toDelete.forEach(index => {
                let removed = this.servers.splice(index, 1);
                deleted = deleted.concat(removed[0].url.toString());
            });
            // remaining servers are new
            for (let k in discovered) {
                if (discovered.hasOwnProperty(k)) {
                    this.servers.push(discovered[k]);
                    added.push(k);
                }
            }
        }
        return { added: added, deleted: deleted };
    }
}
exports.Servers = Servers;
//# sourceMappingURL=servers.js.map