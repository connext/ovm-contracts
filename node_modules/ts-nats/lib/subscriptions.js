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
const events_1 = require("events");
/**
 * @hidden
 */
class Subscriptions extends events_1.EventEmitter {
    constructor() {
        super();
        this.subs = {};
        this.sidCounter = 0;
        this.length = 0;
        events_1.EventEmitter.call(this);
    }
    add(s) {
        this.sidCounter++;
        this.length++;
        s.sid = this.sidCounter;
        this.subs[s.sid] = s;
        let se = { sid: s.sid, subject: s.subject, queue: s.queue };
        this.emit('subscribe', se);
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
            delete s.timeout;
        }
        if (s.sid in this.subs) {
            let sub = this.subs[s.sid];
            let se = { sid: sub.sid, subject: sub.subject, queue: sub.queue };
            delete this.subs[s.sid];
            this.length--;
            this.emit('unsubscribe', se);
        }
    }
    close() {
        let subs = this.all();
        for (let i = 0; i < subs.length; i++) {
            this.cancel(subs[i]);
        }
    }
}
exports.Subscriptions = Subscriptions;
//# sourceMappingURL=subscriptions.js.map