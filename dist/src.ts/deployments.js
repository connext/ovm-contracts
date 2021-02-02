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
exports.deployments = void 0;
exports.deployments = {};
const mainnetChannelFactory = __importStar(require("../deployments/mainnet/ChannelFactory.json"));
const mainnetChannelMastercopy = __importStar(require("../deployments/mainnet/ChannelMastercopy.json"));
const mainnetHashlockTransfer = __importStar(require("../deployments/mainnet/HashlockTransfer.json"));
const mainnetTestToken = __importStar(require("../deployments/mainnet/TestToken.json"));
const mainnetTransferRegistry = __importStar(require("../deployments/mainnet/TransferRegistry.json"));
const mainnetWithdraw = __importStar(require("../deployments/mainnet/Withdraw.json"));
const mainnetDeployment = {
    ChannelFactory: mainnetChannelFactory,
    ChannelMastercopy: mainnetChannelMastercopy,
    HashlockTransfer: mainnetHashlockTransfer,
    TestToken: mainnetTestToken,
    TransferRegistry: mainnetTransferRegistry,
    Withdraw: mainnetWithdraw,
};
exports.deployments.mainnet = mainnetDeployment;
exports.deployments["1"] = mainnetDeployment;
const rinkebyChannelFactory = __importStar(require("../deployments/rinkeby/ChannelFactory.json"));
const rinkebyChannelMastercopy = __importStar(require("../deployments/rinkeby/ChannelMastercopy.json"));
const rinkebyHashlockTransfer = __importStar(require("../deployments/rinkeby/HashlockTransfer.json"));
const rinkebyTestToken = __importStar(require("../deployments/rinkeby/TestToken.json"));
const rinkebyTransferRegistry = __importStar(require("../deployments/rinkeby/TransferRegistry.json"));
const rinkebyWithdraw = __importStar(require("../deployments/rinkeby/Withdraw.json"));
const rinkebyDeployment = {
    ChannelFactory: rinkebyChannelFactory,
    ChannelMastercopy: rinkebyChannelMastercopy,
    HashlockTransfer: rinkebyHashlockTransfer,
    TestToken: rinkebyTestToken,
    TransferRegistry: rinkebyTransferRegistry,
    Withdraw: rinkebyWithdraw,
};
exports.deployments.rinkeby = rinkebyDeployment;
exports.deployments["4"] = rinkebyDeployment;
const goerliChannelFactory = __importStar(require("../deployments/goerli/ChannelFactory.json"));
const goerliChannelMastercopy = __importStar(require("../deployments/goerli/ChannelMastercopy.json"));
const goerliHashlockTransfer = __importStar(require("../deployments/goerli/HashlockTransfer.json"));
const goerliTestToken = __importStar(require("../deployments/goerli/TestToken.json"));
const goerliTransferRegistry = __importStar(require("../deployments/goerli/TransferRegistry.json"));
const goerliWithdraw = __importStar(require("../deployments/goerli/Withdraw.json"));
const goerliDeployment = {
    ChannelFactory: goerliChannelFactory,
    ChannelMastercopy: goerliChannelMastercopy,
    HashlockTransfer: goerliHashlockTransfer,
    TestToken: goerliTestToken,
    TransferRegistry: goerliTransferRegistry,
    Withdraw: goerliWithdraw,
};
exports.deployments.goerli = goerliDeployment;
exports.deployments["5"] = goerliDeployment;
const kovanChannelFactory = __importStar(require("../deployments/kovan/ChannelFactory.json"));
const kovanChannelMastercopy = __importStar(require("../deployments/kovan/ChannelMastercopy.json"));
const kovanHashlockTransfer = __importStar(require("../deployments/kovan/HashlockTransfer.json"));
const kovanTestToken = __importStar(require("../deployments/kovan/TestToken.json"));
const kovanTransferRegistry = __importStar(require("../deployments/kovan/TransferRegistry.json"));
const kovanWithdraw = __importStar(require("../deployments/kovan/Withdraw.json"));
const kovanDeployment = {
    ChannelFactory: kovanChannelFactory,
    ChannelMastercopy: kovanChannelMastercopy,
    HashlockTransfer: kovanHashlockTransfer,
    TestToken: kovanTestToken,
    TransferRegistry: kovanTransferRegistry,
    Withdraw: kovanWithdraw,
};
exports.deployments.kovan = kovanDeployment;
exports.deployments["42"] = kovanDeployment;
const maticChannelFactory = __importStar(require("../deployments/matic/ChannelFactory.json"));
const maticChannelMastercopy = __importStar(require("../deployments/matic/ChannelMastercopy.json"));
const maticHashlockTransfer = __importStar(require("../deployments/matic/HashlockTransfer.json"));
const maticTestToken = __importStar(require("../deployments/matic/TestToken.json"));
const maticTransferRegistry = __importStar(require("../deployments/matic/TransferRegistry.json"));
const maticWithdraw = __importStar(require("../deployments/matic/Withdraw.json"));
const maticDeployment = {
    ChannelFactory: maticChannelFactory,
    ChannelMastercopy: maticChannelMastercopy,
    HashlockTransfer: maticHashlockTransfer,
    TestToken: maticTestToken,
    TransferRegistry: maticTransferRegistry,
    Withdraw: maticWithdraw,
};
exports.deployments.matic = maticDeployment;
exports.deployments["137"] = maticDeployment;
const mumbaiChannelFactory = __importStar(require("../deployments/mumbai/ChannelFactory.json"));
const mumbaiChannelMastercopy = __importStar(require("../deployments/mumbai/ChannelMastercopy.json"));
const mumbaiHashlockTransfer = __importStar(require("../deployments/mumbai/HashlockTransfer.json"));
const mumbaiTestToken = __importStar(require("../deployments/mumbai/TestToken.json"));
const mumbaiTransferRegistry = __importStar(require("../deployments/mumbai/TransferRegistry.json"));
const mumbaiWithdraw = __importStar(require("../deployments/mumbai/Withdraw.json"));
const mumbaiDeployment = {
    ChannelFactory: mumbaiChannelFactory,
    ChannelMastercopy: mumbaiChannelMastercopy,
    HashlockTransfer: mumbaiHashlockTransfer,
    TestToken: mumbaiTestToken,
    TransferRegistry: mumbaiTransferRegistry,
    Withdraw: mumbaiWithdraw,
};
exports.deployments.mumbai = mumbaiDeployment;
exports.deployments["80001"] = mumbaiDeployment;
const arbitrumtestChannelFactory = __importStar(require("../deployments/arbitrumtest/ChannelFactory.json"));
const arbitrumtestChannelMastercopy = __importStar(require("../deployments/arbitrumtest/ChannelMastercopy.json"));
const arbitrumtestHashlockTransfer = __importStar(require("../deployments/arbitrumtest/HashlockTransfer.json"));
const arbitrumtestTestToken = __importStar(require("../deployments/arbitrumtest/TestToken.json"));
const arbitrumtestTransferRegistry = __importStar(require("../deployments/arbitrumtest/TransferRegistry.json"));
const arbitrumtestWithdraw = __importStar(require("../deployments/arbitrumtest/Withdraw.json"));
const arbitrumtestDeployment = {
    ChannelFactory: arbitrumtestChannelFactory,
    ChannelMastercopy: arbitrumtestChannelMastercopy,
    HashlockTransfer: arbitrumtestHashlockTransfer,
    TestToken: arbitrumtestTestToken,
    TransferRegistry: arbitrumtestTransferRegistry,
    Withdraw: arbitrumtestWithdraw,
};
exports.deployments.arbitrumtest = arbitrumtestDeployment;
exports.deployments["79377087078960"] = arbitrumtestDeployment;
//# sourceMappingURL=deployments.js.map