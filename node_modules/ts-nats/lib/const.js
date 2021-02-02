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
// Connection defaults
exports.DEFAULT_PORT = 4222;
exports.DEFAULT_PRE = 'nats://localhost:';
exports.DEFAULT_URI = exports.DEFAULT_PRE + exports.DEFAULT_PORT;
// Reconnect Parameters, 2 sec wait, 10 tries
exports.DEFAULT_RECONNECT_TIME_WAIT = 2 * 1000;
exports.DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
// Ping interval
exports.DEFAULT_PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
exports.DEFAULT_MAX_PING_OUT = 2;
// Line handling
exports.CR_LF = '\r\n';
exports.CR_LF_LEN = exports.CR_LF.length;
exports.EMPTY = '';
//# sourceMappingURL=const.js.map