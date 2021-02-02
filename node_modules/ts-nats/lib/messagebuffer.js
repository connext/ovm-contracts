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
const error_1 = require("./error");
const nats_1 = require("./nats");
const const_1 = require("./const");
/**
 * @hidden
 */
class MsgBuffer {
    constructor(chunks, payload, encoding) {
        this.buffers = [];
        this.msg = {};
        this.encoding = encoding;
        this.msg.subject = chunks[1];
        this.msg.sid = parseInt(chunks[2], 10);
        this.msg.reply = chunks[4];
        this.msg.size = parseInt(chunks[5], 10);
        this.length = this.msg.size + const_1.CR_LF_LEN;
        this.payload = payload;
    }
    fill(data) {
        this.buffers.push(data);
        this.length -= data.byteLength;
        if (this.length === 0) {
            let buf = this.pack();
            buf = buf.slice(0, buf.byteLength - 2);
            switch (this.payload) {
                case nats_1.Payload.JSON:
                    this.msg.data = buf.toString();
                    try {
                        this.msg.data = JSON.parse(this.msg.data);
                    }
                    catch (ex) {
                        this.error = error_1.NatsError.errorForCode(error_1.ErrorCode.BAD_JSON, ex);
                    }
                    break;
                case nats_1.Payload.STRING:
                    this.msg.data = buf.toString(this.encoding);
                    break;
                case nats_1.Payload.BINARY:
                    this.msg.data = buf;
                    break;
            }
            this.buffers = [];
        }
    }
    pack() {
        if (this.buffers.length === 1) {
            return this.buffers[0];
        }
        else {
            return Buffer.concat(this.buffers);
        }
    }
}
exports.MsgBuffer = MsgBuffer;
//# sourceMappingURL=messagebuffer.js.map