"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructRpcRequest = exports.payloadId = void 0;
function payloadId() {
    const date = new Date().getTime() * Math.pow(10, 3);
    const extra = Math.floor(Math.random() * Math.pow(10, 3));
    return date + extra;
}
exports.payloadId = payloadId;
exports.constructRpcRequest = (method, params) => {
    return {
        id: payloadId(),
        jsonrpc: "2.0",
        method,
        params,
    };
};
//# sourceMappingURL=rpc.js.map