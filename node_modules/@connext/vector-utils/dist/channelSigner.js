"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelSigner = exports.getRandomChannelSigner = void 0;
const abstract_signer_1 = require("@ethersproject/abstract-signer");
const providers_1 = require("@ethersproject/providers");
const wallet_1 = require("@ethersproject/wallet");
const crypto_1 = require("./crypto");
const identifiers_1 = require("./identifiers");
const chainId_1 = require("./chainId");
exports.getRandomChannelSigner = (provider) => new ChannelSigner(crypto_1.getRandomPrivateKey(), provider);
class ChannelSigner extends abstract_signer_1.Signer {
    constructor(privateKey, provider) {
        super();
        this.privateKey = privateKey;
        this._ethersType = "Signer";
        this.encrypt = crypto_1.encrypt;
        this.privateKey = privateKey;
        this.publicKey = crypto_1.getPublicKeyFromPrivateKey(privateKey);
        this.address = crypto_1.getAddressFromPublicKey(this.publicKey);
        this.publicIdentifier = identifiers_1.getPublicIdentifierFromPublicKey(this.publicKey);
        this.connectProvider(provider);
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.address;
        });
    }
    connectProvider(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.provider = typeof provider === "string" ? new providers_1.JsonRpcProvider(provider, yield chainId_1.getChainId(provider)) : provider;
        });
    }
    connect(provider) {
        this.provider = provider;
        return this;
    }
    decrypt(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return crypto_1.decrypt(message, this.privateKey);
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return crypto_1.signChannelMessage(message, this.privateKey);
        });
    }
    signUtilityMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return crypto_1.signUtilityMessage(message, this.privateKey);
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                throw new Error(`ChannelSigner can't send transactions without being connected to a provider`);
            }
            const wallet = new wallet_1.Wallet(this.privateKey, this.provider);
            return wallet.signTransaction(transaction);
        });
    }
    sendTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                throw new Error(`ChannelSigner can't send transactions without being connected to a provider`);
            }
            const wallet = new wallet_1.Wallet(this.privateKey, this.provider);
            return wallet.sendTransaction(transaction);
        });
    }
}
exports.ChannelSigner = ChannelSigner;
//# sourceMappingURL=channelSigner.js.map