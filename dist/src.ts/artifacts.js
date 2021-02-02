"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdraw = exports.VectorChannel = exports.TransferRegistry = exports.TransferDefinition = exports.TestToken = exports.TestLibIterableMapping = exports.TestChannelFactory = exports.TestChannel = exports.ReentrantToken = exports.NonconformingToken = exports.HashlockTransfer = exports.FailingToken = exports.CMCAsset = exports.ChannelMastercopy = exports.ChannelFactory = exports.artifacts = void 0;
const ChannelFactory = __importStar(require("../artifacts/src.sol/ChannelFactory.sol/ChannelFactory.json"));
exports.ChannelFactory = ChannelFactory;
const ChannelMastercopy = __importStar(require("../artifacts/src.sol/ChannelMastercopy.sol/ChannelMastercopy.json"));
exports.ChannelMastercopy = ChannelMastercopy;
const CMCAsset = __importStar(require("../artifacts/src.sol/CMCAsset.sol/CMCAsset.json"));
exports.CMCAsset = CMCAsset;
const FailingToken = __importStar(require("../artifacts/src.sol/testing/FailingToken.sol/FailingToken.json"));
exports.FailingToken = FailingToken;
const HashlockTransfer = __importStar(require("../artifacts/src.sol/transferDefinitions/HashlockTransfer.sol/HashlockTransfer.json"));
exports.HashlockTransfer = HashlockTransfer;
const NonconformingToken = __importStar(require("../artifacts/src.sol/testing/NonconformingToken.sol/NonconformingToken.json"));
exports.NonconformingToken = NonconformingToken;
const TestChannel = __importStar(require("../artifacts/src.sol/testing/TestChannel.sol/TestChannel.json"));
exports.TestChannel = TestChannel;
const TestChannelFactory = __importStar(require("../artifacts/src.sol/testing/TestChannelFactory.sol/TestChannelFactory.json"));
exports.TestChannelFactory = TestChannelFactory;
const TestToken = __importStar(require("../artifacts/src.sol/testing/TestToken.sol/TestToken.json"));
exports.TestToken = TestToken;
const TransferDefinition = __importStar(require("../artifacts/src.sol/interfaces/ITransferDefinition.sol/ITransferDefinition.json"));
exports.TransferDefinition = TransferDefinition;
const TransferRegistry = __importStar(require("../artifacts/src.sol/TransferRegistry.sol/TransferRegistry.json"));
exports.TransferRegistry = TransferRegistry;
const VectorChannel = __importStar(require("../artifacts/src.sol/interfaces/IVectorChannel.sol/IVectorChannel.json"));
exports.VectorChannel = VectorChannel;
const Withdraw = __importStar(require("../artifacts/src.sol/transferDefinitions/Withdraw.sol/Withdraw.json"));
exports.Withdraw = Withdraw;
const TestLibIterableMapping = __importStar(require("../artifacts/src.sol/testing/TestLibIterableMapping.sol/TestLibIterableMapping.json"));
exports.TestLibIterableMapping = TestLibIterableMapping;
const ReentrantToken = __importStar(require("../artifacts/src.sol/testing/ReentrantToken.sol/ReentrantToken.json"));
exports.ReentrantToken = ReentrantToken;
exports.artifacts = {
    ChannelFactory,
    ChannelMastercopy,
    CMCAsset,
    FailingToken,
    HashlockTransfer,
    NonconformingToken,
    ReentrantToken,
    TestChannel,
    TestChannelFactory,
    TestLibIterableMapping,
    TestToken,
    TransferDefinition,
    TransferRegistry,
    VectorChannel,
    Withdraw,
};
//# sourceMappingURL=artifacts.js.map