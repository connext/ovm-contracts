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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
/**
 * @hidden
 */
class MuxSubscriptions {
    constructor() {
        this.reqs = {};
        this.length = 0;
    }
    init() {
        this.baseInbox = `${util_1.createInbox()}.`;
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
    all() {
        let buf = [];
        for (let token in this.reqs) {
            let req = this.reqs[token];
            buf.push(req);
        }
        return buf;
    }
    cancel(r) {
        if (r && r.timeout) {
            clearTimeout(r.timeout);
            delete r.timeout;
        }
        if (r.token in this.reqs) {
            delete this.reqs[r.token];
            this.length--;
        }
    }
    close() {
        let reqs = this.all();
        for (let i = 0; i < reqs.length; i++) {
            this.cancel(reqs[i]);
        }
    }
    getToken(m) {
        let s = '';
        if (m) {
            s = m.subject || '';
        }
        if (s.indexOf(this.baseInbox) === 0) {
            return s.substring(this.baseInbox.length);
        }
        return null;
    }
    dispatcher() {
        let mux = this;
        return (error, m) => {
            let token = mux.getToken(m);
            if (token) {
                let r = mux.get(token);
                if (r) {
                    r.received++;
                    r.callback(error, m);
                    if (r.max && r.received >= r.max) {
                        mux.cancel(r);
                    }
                }
            }
        };
    }
    ;
}
exports.MuxSubscriptions = MuxSubscriptions;
//# sourceMappingURL=muxsubscriptions.js.map