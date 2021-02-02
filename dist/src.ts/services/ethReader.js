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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumChainReader = void 0;
const evm = __importStar(require("@connext/pure-evm-wasm"));
const vector_types_1 = require("@connext/vector-types");
const axios_1 = __importDefault(require("axios"));
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const artifacts_1 = require("../artifacts");
const execEvmBytecode = (bytecode, payload) => evm.exec(Uint8Array.from(Buffer.from(bytecode.replace(/^0x/, ""), "hex")), Uint8Array.from(Buffer.from(payload.replace(/^0x/, ""), "hex")));
class EthereumChainReader {
    constructor(chainProviders, log) {
        this.chainProviders = chainProviders;
        this.log = log;
        this.transferRegistries = new Map();
    }
    getChainProviders() {
        const ret = {};
        Object.entries(this.chainProviders).forEach(([name, value]) => {
            ret[parseInt(name)] = value.connection.url;
        });
        return vector_types_1.Result.ok(ret);
    }
    getHydratedProviders() {
        return vector_types_1.Result.ok(this.chainProviders);
    }
    async getSyncing(chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const res = await provider.send("eth_syncing", []);
            return vector_types_1.Result.ok(res);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getChannelDispute(channelAddress, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const code = await this.getCode(channelAddress, chainId);
            if (code.isError) {
                return vector_types_1.Result.fail(code.getError());
            }
            if (code.getValue() === "0x") {
                return vector_types_1.Result.ok(undefined);
            }
            const dispute = await new contracts_1.Contract(channelAddress, artifacts_1.VectorChannel.abi, provider).getChannelDispute();
            if (dispute.channelStateHash === constants_1.HashZero) {
                return vector_types_1.Result.ok(undefined);
            }
            return vector_types_1.Result.ok({
                channelStateHash: dispute.channelStateHash,
                nonce: dispute.nonce.toString(),
                merkleRoot: dispute.merkleRoot,
                consensusExpiry: dispute.consensusExpiry.toString(),
                defundExpiry: dispute.defundExpiry.toString(),
                defundNonce: dispute.defundNonce.toString(),
            });
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getRegisteredTransferByDefinition(definition, transferRegistry, chainId, bytecode) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        let registry = this.transferRegistries.get(chainId.toString());
        if (!this.transferRegistries.has(chainId.toString())) {
            const loadRes = await this.loadRegistry(transferRegistry, chainId, bytecode);
            if (loadRes.isError) {
                return vector_types_1.Result.fail(loadRes.getError());
            }
            registry = loadRes.getValue();
        }
        const info = registry.find((r) => r.definition === definition);
        if (!info) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TransferNotRegistered, {
                definition,
                transferRegistry,
                chainId,
            }));
        }
        return vector_types_1.Result.ok(info);
    }
    async getRegisteredTransferByName(name, transferRegistry, chainId, bytecode) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        let registry = this.transferRegistries.get(chainId.toString());
        if (!registry) {
            const loadRes = await this.loadRegistry(transferRegistry, chainId, bytecode);
            if (loadRes.isError) {
                return vector_types_1.Result.fail(loadRes.getError());
            }
            registry = loadRes.getValue();
        }
        const info = registry.find((r) => r.name === name);
        if (!info) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TransferNotRegistered, {
                name,
                transferRegistry,
                chainId,
            }));
        }
        return vector_types_1.Result.ok(info);
    }
    async getRegisteredTransfers(transferRegistry, chainId, bytecode) {
        let registry = this.transferRegistries.get(chainId.toString());
        if (!registry) {
            const loadRes = await this.loadRegistry(transferRegistry, chainId, bytecode);
            if (loadRes.isError) {
                return vector_types_1.Result.fail(loadRes.getError());
            }
            registry = loadRes.getValue();
        }
        return vector_types_1.Result.ok(registry);
    }
    async getChannelFactoryBytecode(channelFactoryAddress, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const factory = new contracts_1.Contract(channelFactoryAddress, artifacts_1.ChannelFactory.abi, provider);
            const proxyBytecode = await factory.getProxyCreationCode();
            return vector_types_1.Result.ok(proxyBytecode);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getChannelMastercopyAddress(channelFactoryAddress, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const factory = new contracts_1.Contract(channelFactoryAddress, artifacts_1.ChannelFactory.abi, provider);
            const mastercopy = await factory.getMastercopy();
            return vector_types_1.Result.ok(mastercopy);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getChannelOnchainBalance(channelAddress, chainId, assetId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const channelContract = new contracts_1.Contract(channelAddress, artifacts_1.ChannelMastercopy.abi, provider);
        let onchainBalance;
        try {
            onchainBalance = await channelContract.getBalance(assetId);
        }
        catch (e) {
            return this.getOnchainBalance(assetId, channelAddress, chainId);
        }
        return vector_types_1.Result.ok(onchainBalance);
    }
    async getTotalDepositedA(channelAddress, chainId, assetId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const channelContract = new contracts_1.Contract(channelAddress, artifacts_1.ChannelMastercopy.abi, provider);
        let totalDepositsAlice;
        try {
            totalDepositsAlice = await channelContract.getTotalDepositsAlice(assetId);
        }
        catch (e) {
            totalDepositsAlice = bignumber_1.BigNumber.from(0);
        }
        return vector_types_1.Result.ok(totalDepositsAlice);
    }
    async getTotalDepositedB(channelAddress, chainId, assetId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const channelContract = new contracts_1.Contract(channelAddress, artifacts_1.ChannelMastercopy.abi, provider);
        let totalDepositsBob;
        try {
            totalDepositsBob = await channelContract.getTotalDepositsBob(assetId);
        }
        catch (e) {
            const deposited = await this.getChannelOnchainBalance(channelAddress, chainId, assetId);
            if (deposited.isError) {
                return deposited;
            }
            totalDepositsBob = deposited.getValue();
        }
        return vector_types_1.Result.ok(totalDepositsBob);
    }
    async create(initialState, balance, transferDefinition, transferRegistryAddress, chainId, bytecode) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const registryRes = await this.getRegisteredTransferByDefinition(transferDefinition, transferRegistryAddress, chainId, bytecode);
        if (registryRes.isError) {
            return vector_types_1.Result.fail(registryRes.getError());
        }
        let encodedState;
        let encodedBalance;
        try {
            encodedState = vector_utils_1.encodeTransferState(initialState, registryRes.getValue().stateEncoding);
            encodedBalance = vector_utils_1.encodeBalance(balance);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
        const contract = new contracts_1.Contract(transferDefinition, artifacts_1.TransferDefinition.abi, provider);
        if (bytecode) {
            const evmRes = this.tryEvm(contract.interface.encodeFunctionData("create", [encodedBalance, encodedState]), bytecode);
            if (!evmRes.isError) {
                const decoded = contract.interface.decodeFunctionResult("create", evmRes.getValue())[0];
                return vector_types_1.Result.ok(decoded);
            }
        }
        this.log.debug({
            transferDefinition,
        }, "Calling create onchain");
        try {
            const valid = await contract.create(encodedBalance, encodedState);
            return vector_types_1.Result.ok(valid);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async resolve(transfer, chainId, bytecode) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        let encodedState;
        let encodedResolver;
        let encodedBalance;
        try {
            encodedState = vector_utils_1.encodeTransferState(transfer.transferState, transfer.transferEncodings[0]);
            encodedResolver = vector_utils_1.encodeTransferResolver(transfer.transferResolver, transfer.transferEncodings[1]);
            encodedBalance = vector_utils_1.encodeBalance(transfer.balance);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
        const contract = new contracts_1.Contract(transfer.transferDefinition, artifacts_1.TransferDefinition.abi, provider);
        if (bytecode) {
            const evmRes = this.tryEvm(contract.interface.encodeFunctionData("resolve", [encodedBalance, encodedState, encodedResolver]), bytecode);
            if (!evmRes.isError) {
                const decoded = contract.interface.decodeFunctionResult("resolve", evmRes.getValue())[0];
                return vector_types_1.Result.ok(decoded);
            }
        }
        this.log.debug({
            transferDefinition: transfer.transferDefinition,
            transferId: transfer.transferId,
        }, "Calling resolve onchain");
        try {
            const ret = await contract.resolve(encodedBalance, encodedState, encodedResolver);
            return vector_types_1.Result.ok({
                to: ret.to,
                amount: ret.amount.map((a) => a.toString()),
            });
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getChannelAddress(alice, bob, channelFactoryAddress, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const channelFactory = new contracts_1.Contract(channelFactoryAddress, artifacts_1.ChannelFactory.abi, provider);
        try {
            const derivedAddress = await channelFactory.getChannelAddress(alice, bob);
            return vector_types_1.Result.ok(derivedAddress);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getCode(address, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const code = await provider.getCode(address);
            return vector_types_1.Result.ok(code);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getBlockNumber(chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const blockNumber = await provider.getBlockNumber();
            return vector_types_1.Result.ok(blockNumber);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getGasPrice(chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        let gasPrice = undefined;
        if (chainId === 1) {
            try {
                const gasNowResponse = await axios_1.default.get(`https://www.gasnow.org/api/v3/gas/price`);
                const { fast } = gasNowResponse.data;
                gasPrice = typeof fast !== "undefined" ? bignumber_1.BigNumber.from(fast) : undefined;
            }
            catch (e) {
                this.log.warn({ error: e }, "Gasnow failed, using provider");
            }
        }
        if (!gasPrice) {
            try {
                gasPrice = await provider.getGasPrice();
            }
            catch (e) {
                return vector_types_1.Result.fail(e);
            }
        }
        return vector_types_1.Result.ok(gasPrice);
    }
    async estimateGas(chainId, transaction) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        try {
            const gas = await provider.estimateGas(transaction);
            return vector_types_1.Result.ok(gas);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getTokenAllowance(tokenAddress, owner, spender, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const erc20 = new contracts_1.Contract(tokenAddress, vector_types_1.ERC20Abi, provider);
        try {
            const res = await erc20.allowance(owner, spender);
            return vector_types_1.Result.ok(res);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
    }
    async getOnchainBalance(assetId, balanceOf, chainId) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        let onchainBalance;
        try {
            onchainBalance =
                assetId === constants_1.AddressZero
                    ? await provider.getBalance(balanceOf)
                    : await new contracts_1.Contract(assetId, vector_types_1.ERC20Abi, provider).balanceOf(balanceOf);
        }
        catch (e) {
            return vector_types_1.Result.fail(e);
        }
        return vector_types_1.Result.ok(onchainBalance);
    }
    tryEvm(encodedFunctionData, bytecode) {
        try {
            const output = execEvmBytecode(bytecode, encodedFunctionData);
            return vector_types_1.Result.ok(output);
        }
        catch (e) {
            this.log.debug({ error: e.message }, `Pure-evm failed`);
            return vector_types_1.Result.fail(e);
        }
    }
    async loadRegistry(transferRegistry, chainId, bytecode) {
        const provider = this.chainProviders[chainId];
        if (!provider) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ProviderNotFound));
        }
        const registry = new contracts_1.Contract(transferRegistry, artifacts_1.TransferRegistry.abi, provider);
        let registered;
        if (bytecode) {
            const evm = this.tryEvm(registry.interface.encodeFunctionData("getTransferDefinitions"), bytecode);
            if (!evm.isError) {
                try {
                    registered = registry.interface.decodeFunctionResult("getTransferDefinitions", evm.getValue())[0];
                }
                catch (e) { }
            }
        }
        if (!registered) {
            try {
                registered = await registry.getTransferDefinitions();
            }
            catch (e) {
                return vector_types_1.Result.fail(new vector_types_1.ChainError(e.message, { chainId, transferRegistry }));
            }
        }
        const cleaned = registered.map((r) => {
            return {
                name: r.name,
                definition: r.definition,
                stateEncoding: vector_types_1.tidy(r.stateEncoding),
                resolverEncoding: vector_types_1.tidy(r.resolverEncoding),
                encodedCancel: r.encodedCancel,
            };
        });
        this.transferRegistries.set(chainId.toString(), cleaned);
        return vector_types_1.Result.ok(cleaned);
    }
}
exports.EthereumChainReader = EthereumChainReader;
//# sourceMappingURL=ethReader.js.map