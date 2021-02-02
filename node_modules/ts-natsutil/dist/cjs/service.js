"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nats_1 = require("./nats");
const natsws_1 = require("./natsws");
const natsServiceTypeNats = 'nats';
const natsServiceTypeWebsocket = 'ws';
exports.natsPayloadTypeJson = 'json';
exports.natsPayloadTypeBinary = 'binary';
function natsServiceFactory(config, log) {
    const { natsServers, bearerToken, token } = config;
    if (!natsServers) {
        throw new Error('No NATS servers or websocket endpoints provided; check config');
    }
    let serviceType;
    if (typeof natsServers === 'string') {
        if (natsServers.startsWith('nats://')) {
            serviceType = natsServiceTypeNats;
        }
        else if (natsServers.startsWith('ws://') || natsServers.startsWith('wss://')) {
            serviceType = natsServiceTypeWebsocket;
        }
    }
    else if (natsServers.length > 0 && natsServers[0] && natsServers[0].startsWith('nats://')) {
        serviceType = natsServiceTypeNats;
    }
    else if (natsServers.length > 0 && natsServers[0] && natsServers[0].startsWith('ws://') || natsServers[0].startsWith('wss://')) {
        serviceType = natsServiceTypeWebsocket;
    }
    if (serviceType === natsServiceTypeNats) {
        return new nats_1.NatsService(log, natsServers, bearerToken, token);
    }
    else if (serviceType === natsServiceTypeWebsocket) {
        return new natsws_1.NatsWebsocketService(log, natsServers, bearerToken, token);
    }
    throw new Error('Invalid NATS config; unable to resolve protocol; check config');
}
exports.natsServiceFactory = natsServiceFactory;
//# sourceMappingURL=service.js.map