"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVectorChannelMessage = void 0;
const vector_types_1 = require("@connext/vector-types");
const channel_1 = require("./channel");
const util_1 = require("./util");
function createVectorChannelMessage(overrides = {}) {
    var _a, _b, _c, _d, _e, _f;
    const { data } = overrides, defaults = __rest(overrides, ["data"]);
    const update = Object.assign({}, channel_1.createTestChannelUpdate((_b = (_a = data === null || data === void 0 ? void 0 : data.update) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : vector_types_1.UpdateType.setup, data === null || data === void 0 ? void 0 : data.update));
    const latestUpdate = (data === null || data === void 0 ? void 0 : data.latestUpdate) && Object.assign({}, channel_1.createTestChannelUpdate((_d = (_c = data === null || data === void 0 ? void 0 : data.latestUpdate) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : vector_types_1.UpdateType.setup, data === null || data === void 0 ? void 0 : data.latestUpdate));
    return Object.assign({ to: util_1.mkPublicIdentifier("vectorBBB"), from: util_1.mkPublicIdentifier("vectorAAA"), inbox: "test_inbox", data: {
            update: Object.assign(Object.assign({}, update), { fromIdentifier: (_e = defaults.from) !== null && _e !== void 0 ? _e : update.fromIdentifier, toIdentifier: (_f = defaults.to) !== null && _f !== void 0 ? _f : update.toIdentifier }),
            latestUpdate,
        } }, defaults);
}
exports.createVectorChannelMessage = createVectorChannelMessage;
//# sourceMappingURL=message.js.map