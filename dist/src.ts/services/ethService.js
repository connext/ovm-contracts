"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumChainService = exports.EXTRA_GAS = exports.EXTRA_GAS_PRICE = void 0;
const vector_types_1 = require("@connext/vector-types");
const vector_utils_1 = require("@connext/vector-utils");
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const keccak256_1 = require("@ethersproject/keccak256");
const wallet_1 = require("@ethersproject/wallet");
const p_queue_1 = __importDefault(require("p-queue"));
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const merkletreejs_1 = require("merkletreejs");
const artifacts_1 = require("../artifacts");
const ethReader_1 = require("./ethReader");
exports.EXTRA_GAS_PRICE = units_1.parseUnits("20", "gwei");
exports.EXTRA_GAS = 50000;
class EthereumChainService extends ethReader_1.EthereumChainReader {
    constructor(store, chainProviders, signer, log, defaultRetries = 1) {
        super(chainProviders, log.child({ module: "EthereumChainService" }));
        this.store = store;
        this.defaultRetries = defaultRetries;
        this.signers = new Map();
        this.queue = new p_queue_1.default({ concurrency: 1 });
        Object.entries(chainProviders).forEach(([chainId, provider]) => {
            this.signers.set(parseInt(chainId), typeof signer === "string" ? new wallet_1.Wallet(signer, provider) : signer.connect(provider));
        });
    }
    async sendDisputeChannelTx(channelState) {
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        if (!channelState.latestUpdate.aliceSignature || !channelState.latestUpdate.bobSignature) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.MissingSigs));
        }
        return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.disputeChannel, () => {
            const channel = new contracts_1.Contract(channelState.channelAddress, artifacts_1.VectorChannel.abi, signer);
            return channel.disputeChannel(channelState, channelState.latestUpdate.aliceSignature, channelState.latestUpdate.bobSignature);
        });
    }
    async sendDefundChannelTx(channelState, assetsToDefund = channelState.assetIds, indices = []) {
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        if (!channelState.latestUpdate.aliceSignature || !channelState.latestUpdate.bobSignature) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.MissingSigs));
        }
        return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.defundChannel, () => {
            const channel = new contracts_1.Contract(channelState.channelAddress, artifacts_1.VectorChannel.abi, signer);
            return channel.defundChannel(channelState, assetsToDefund, indices);
        });
    }
    async sendDisputeTransferTx(transferIdToDispute, activeTransfers) {
        const transferState = activeTransfers.find((t) => t.transferId === transferIdToDispute);
        if (!transferState) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TransferNotFound, {
                transfer: transferIdToDispute,
                active: activeTransfers.map((t) => t.transferId),
            }));
        }
        const signer = this.signers.get(transferState.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        const hashes = activeTransfers.map((t) => vector_utils_1.bufferify(vector_utils_1.hashCoreTransferState(t)));
        const hash = vector_utils_1.bufferify(vector_utils_1.hashCoreTransferState(transferState));
        const merkle = new merkletreejs_1.MerkleTree(hashes, keccak256_1.keccak256);
        return this.sendTxWithRetries(transferState.channelAddress, vector_types_1.TransactionReason.disputeTransfer, () => {
            const channel = new contracts_1.Contract(transferState.channelAddress, artifacts_1.VectorChannel.abi, signer);
            return channel.disputeTransfer(transferState, merkle.getHexProof(hash));
        });
    }
    async sendDefundTransferTx(transferState, responderSignature = constants_1.HashZero) {
        const signer = this.signers.get(transferState.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        if (!transferState.transferResolver) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.ResolverNeeded));
        }
        if (transferState.balance.amount[1] !== "0") {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.NotInitialState));
        }
        const encodedState = vector_utils_1.encodeTransferState(transferState.transferState, transferState.transferEncodings[0]);
        const encodedResolver = vector_utils_1.encodeTransferResolver(transferState.transferResolver, transferState.transferEncodings[1]);
        return this.sendTxWithRetries(transferState.channelAddress, vector_types_1.TransactionReason.defundTransfer, () => {
            const channel = new contracts_1.Contract(transferState.channelAddress, artifacts_1.VectorChannel.abi, signer);
            return channel.defundTransfer(transferState, encodedState, encodedResolver, responderSignature);
        });
    }
    async sendDeployChannelTx(channelState, gasPrice, deposit) {
        const method = "sendDeployChannelTx";
        const methodId = vector_utils_1.getRandomBytes32();
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        const sender = await signer.getAddress();
        const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
        if (multisigRes.isError) {
            return vector_types_1.Result.fail(multisigRes.getError());
        }
        if (multisigRes.getValue() !== `0x`) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.MultisigDeployed));
        }
        const channelFactory = new contracts_1.Contract(channelState.networkContext.channelFactoryAddress, artifacts_1.ChannelFactory.abi, signer);
        if (!deposit) {
            this.log.info({ channelAddress: channelState.channelAddress, sender, method, methodId }, "Deploying channel without deposit");
            const result = await this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.deploy, async () => {
                const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
                if (multisigRes.isError) {
                    return vector_types_1.Result.fail(multisigRes.getError());
                }
                if (multisigRes.getValue() !== `0x`) {
                    return undefined;
                }
                const _gas = await channelFactory.estimateGas.createChannel(channelState.alice, channelState.bob);
                const gas = _gas.add(exports.EXTRA_GAS);
                return channelFactory.createChannel(channelState.alice, channelState.bob, { gasPrice, gasLimit: gas });
            });
            if (result.isError) {
                return result;
            }
            if (!result.getValue()) {
                return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.MultisigDeployed));
            }
            return result;
        }
        if (sender !== channelState.alice) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.FailedToDeploy, {
                message: "Sender is not alice",
                sender,
                alice: channelState.alice,
                channel: channelState.channelAddress,
            }));
        }
        const { assetId, amount } = deposit;
        const balanceRes = await this.getOnchainBalance(assetId, channelState.alice, channelState.networkContext.chainId);
        if (balanceRes.isError) {
            return vector_types_1.Result.fail(balanceRes.getError());
        }
        const balance = balanceRes.getValue();
        if (balance.lt(amount)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.NotEnoughFunds, {
                balance: balance.toString(),
                amount,
                assetId,
                chainId: channelState.networkContext.chainId,
            }));
        }
        this.log.info({ balance: balance.toString(), method, methodId, assetId, chainId: channelState.networkContext.chainId }, "Onchain balance sufficient");
        if (assetId === constants_1.AddressZero) {
            return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.deployWithDepositAlice, async () => {
                const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
                if (multisigRes.isError) {
                    return vector_types_1.Result.fail(multisigRes.getError());
                }
                if (multisigRes.getValue() !== `0x`) {
                    return this.sendDepositATx(channelState, amount, constants_1.AddressZero, gasPrice);
                }
                const _gas = await channelFactory.estimateGas.createChannelAndDepositAlice(channelState.alice, channelState.bob, assetId, amount, {
                    value: amount,
                });
                const gas = _gas.add(exports.EXTRA_GAS);
                return channelFactory.createChannelAndDepositAlice(channelState.alice, channelState.bob, assetId, amount, {
                    value: amount,
                    gasPrice,
                    gasLimit: gas,
                });
            });
        }
        this.log.info({ assetId, amount, channel: channelState.channelAddress, sender }, "Approving tokens");
        const approveRes = await this.approveTokens(channelState.channelAddress, channelState.networkContext.channelFactoryAddress, sender, vector_types_1.UINT_MAX, assetId, channelState.networkContext.chainId, gasPrice);
        if (approveRes.isError) {
            return vector_types_1.Result.fail(approveRes.getError());
        }
        if (approveRes.getValue()) {
            const receipt = await approveRes.getValue().wait();
            if (receipt.status === 0) {
                return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TxReverted, { receipt }));
            }
            this.log.info({ txHash: receipt.transactionHash, method, assetId }, "Token approval confirmed");
        }
        return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.deployWithDepositAlice, async () => {
            const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
            if (multisigRes.isError) {
                return vector_types_1.Result.fail(multisigRes.getError());
            }
            if (multisigRes.getValue() !== `0x`) {
                return this.sendDepositATx(channelState, amount, assetId, gasPrice);
            }
            const _gas = await channelFactory.estimateGas.createChannelAndDepositAlice(channelState.alice, channelState.bob, assetId, amount);
            const gas = _gas.add(exports.EXTRA_GAS);
            return channelFactory.createChannelAndDepositAlice(channelState.alice, channelState.bob, assetId, amount, {
                gasPrice,
                gasLimit: gas,
            });
        });
    }
    async sendWithdrawTx(channelState, minTx) {
        var _a;
        const method = "sendWithdrawTx";
        const methodId = vector_utils_1.getRandomBytes32();
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        const sender = await signer.getAddress();
        if (channelState.alice !== sender && channelState.bob !== sender) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SenderNotInChannel));
        }
        const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
        if (multisigRes.isError) {
            return vector_types_1.Result.fail(multisigRes.getError());
        }
        const gasPriceRes = await this.getGasPrice(channelState.networkContext.chainId);
        if (gasPriceRes.isError) {
            vector_types_1.Result.fail(gasPriceRes.getError());
        }
        const _gasPrice = gasPriceRes.getValue();
        const gasPrice = _gasPrice.add(exports.EXTRA_GAS_PRICE);
        this.log.info({
            channelAddress: channelState.channelAddress,
            sender,
            method,
            methodId,
            gasPrice: gasPrice.toString(),
            chainId: channelState.networkContext.chainId,
        }, "Got gas price");
        if (multisigRes.getValue() === `0x`) {
            this.log.info({ channelAddress: channelState.channelAddress, sender, method, methodId }, "Deploying channel");
            const txRes = await this.sendDeployChannelTx(channelState, gasPrice);
            if (txRes.isError && ((_a = txRes.getError()) === null || _a === void 0 ? void 0 : _a.message) !== vector_types_1.ChainError.reasons.MultisigDeployed) {
                return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.FailedToDeploy, {
                    method,
                    error: txRes.getError().message,
                    channel: channelState.channelAddress,
                }));
            }
            const deployTx = txRes.isError ? undefined : txRes.getValue();
            if (deployTx) {
                this.log.info({ method, methodId, deployTx: deployTx.hash }, "Deploy tx broadcast");
                try {
                    this.log.debug({
                        method,
                        methodId,
                    }, "Waiting for event to be emitted");
                    const receipt = await deployTx.wait();
                    if (receipt.status === 0) {
                        return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TxReverted, {
                            receipt,
                            deployTx: deployTx.hash,
                            channel: channelState.channelAddress,
                            chainId: channelState.networkContext.chainId,
                        }));
                    }
                }
                catch (e) {
                    this.log.error({ method, methodId, error: vector_types_1.jsonifyError(e) }, "Caught error waiting for tx");
                    return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.FailedToDeploy, {
                        error: e.message,
                        deployTx: deployTx.hash,
                        channel: channelState.channelAddress,
                        chainId: channelState.networkContext.chainId,
                    }));
                }
                this.log.debug({ method, methodId }, "Deploy tx mined");
            }
            else {
                this.log.info({ method, methodId }, "Multisig already deployed");
            }
        }
        this.log.info({ sender, method, methodId, channel: channelState.channelAddress }, "Sending withdraw tx to chain");
        return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.withdraw, async () => {
            const _gas = await signer.estimateGas(minTx);
            const gas = _gas.add(exports.EXTRA_GAS);
            return signer.sendTransaction(Object.assign(Object.assign({}, minTx), { gasPrice, gasLimit: gas }));
        });
    }
    async sendDepositTx(channelState, sender, amount, assetId) {
        var _a, _b;
        const method = "sendDepositTx";
        const methodId = vector_utils_1.getRandomBytes32();
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        if (channelState.alice !== sender && channelState.bob !== sender) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SenderNotInChannel));
        }
        const multisigRes = await this.getCode(channelState.channelAddress, channelState.networkContext.chainId);
        if (multisigRes.isError) {
            return vector_types_1.Result.fail(multisigRes.getError());
        }
        const gasPriceRes = await this.getGasPrice(channelState.networkContext.chainId);
        if (gasPriceRes.isError) {
            vector_types_1.Result.fail(gasPriceRes.getError());
        }
        const _gasPrice = gasPriceRes.getValue();
        const gasPrice = _gasPrice.add(exports.EXTRA_GAS_PRICE);
        this.log.info({
            channelAddress: channelState.channelAddress,
            sender,
            method,
            methodId,
            gasPrice: gasPrice.toString(),
            chainId: channelState.networkContext.chainId,
        }, "Got gas price");
        const multisigCode = multisigRes.getValue();
        if (multisigCode === `0x` && sender === channelState.alice) {
            this.log.info({
                method,
                methodId,
                channelAddress: channelState.channelAddress,
                assetId,
                amount,
                senderAddress: await signer.getAddress(),
            }, `Deploying channel with deposit`);
            return this.sendDeployChannelTx(channelState, gasPrice, { amount, assetId });
        }
        const balanceRes = await this.getOnchainBalance(assetId, channelState.alice, channelState.networkContext.chainId);
        if (balanceRes.isError) {
            return vector_types_1.Result.fail(balanceRes.getError());
        }
        const balance = balanceRes.getValue();
        if (balance.lt(amount)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.NotEnoughFunds, {
                balance: balance.toString(),
                amount,
                assetId,
                chainId: channelState.networkContext.chainId,
            }));
        }
        this.log.info({ balance: balance.toString(), method, methodId, assetId, chainId: channelState.networkContext.chainId }, "Onchain balance sufficient");
        this.log.info({ method, methodId, assetId, amount }, "Channel is deployed, sending deposit");
        if (sender === channelState.alice) {
            this.log.info({ method, sender, alice: channelState.alice, bob: channelState.bob }, "Detected participant A, sending tx");
            const txRes = await this.sendDepositATx(channelState, amount, assetId, gasPrice);
            if (txRes.isError) {
                this.log.error({ method, error: (_a = txRes.getError()) === null || _a === void 0 ? void 0 : _a.message }, "Error sending tx");
            }
            else {
                this.log.info({ method, txHash: txRes.getValue().hash }, "Submitted tx");
            }
            return txRes;
        }
        else {
            this.log.info({ method, sender, alice: channelState.alice, bob: channelState.bob }, "Detected participant B, sendng tx");
            const txRes = await this.sendDepositBTx(channelState, amount, assetId, gasPrice);
            if (txRes.isError) {
                this.log.error({ method, error: (_b = txRes.getError()) === null || _b === void 0 ? void 0 : _b.message }, "Error sending tx");
            }
            else {
                this.log.info({ method, txHash: txRes.getValue().hash }, "Submitted tx");
            }
            return txRes;
        }
    }
    async sendTxWithRetries(channelAddress, reason, txFn) {
        const method = "sendTxWithRetries";
        const methodId = vector_utils_1.getRandomBytes32();
        const errors = [];
        for (let attempt = 1; attempt++; attempt < this.defaultRetries) {
            this.log.info({
                method,
                methodId,
                retries: this.defaultRetries,
                attempt,
                channelAddress,
                reason,
            }, "Attempting to send tx");
            const response = await this.sendTxAndParseResponse(channelAddress, reason, txFn);
            if (!response.isError) {
                return response;
            }
            const error = response.getError();
            if (!error.canRetry) {
                this.log.error({ error: error.message, channelAddress, reason, stack: error.stack, method, methodId }, "Failed to send tx, will not retry");
                return response;
            }
            errors.push(error);
            this.log.warn({ error: error.message, channelAddress, attempt, retries: this.defaultRetries, method, methodId }, "Tx failed, waiting before retry");
            await vector_utils_1.delay(1000);
        }
        return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.FailedToSendTx, {
            errors: errors.map((e) => e.message).toString(),
            retries: this.defaultRetries,
            channelAddress,
            reason,
        }));
    }
    async sendTxAndParseResponse(channelAddress, reason, txFn) {
        try {
            const response = await this.queue.add(async () => {
                const response = await txFn();
                if (!response) {
                    this.log.warn({ channelAddress, reason }, "Did not attempt tx");
                    return response;
                }
                await this.store.saveTransactionResponse(channelAddress, reason, response);
                response
                    .wait()
                    .then((receipt) => {
                    if (receipt.status === 0) {
                        this.log.error({ method: "sendTxAndParseResponse", receipt }, "Transaction reverted");
                        this.store.saveTransactionFailure(channelAddress, response.hash, "Tx reverted");
                    }
                    else {
                        this.store.saveTransactionReceipt(channelAddress, receipt);
                    }
                })
                    .catch((e) => {
                    this.log.error({ method: "sendTxAndParseResponse", error: vector_types_1.jsonifyError(e) }, "Transaction reverted");
                    this.store.saveTransactionFailure(channelAddress, response.hash, e.message);
                });
                return response;
            });
            return vector_types_1.Result.ok(response);
        }
        catch (e) {
            let error = e;
            if (e.message.includes("sender doesn't have enough funds")) {
                error = new vector_types_1.ChainError(vector_types_1.ChainError.reasons.NotEnoughFunds);
            }
            return vector_types_1.Result.fail(error);
        }
    }
    async approveTokens(channelAddress, spender, owner, amount, assetId, chainId, gasPrice) {
        var _a, _b;
        const signer = this.signers.get(chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        this.log.info({ assetId, channelAddress: spender }, "Approving token");
        const erc20 = new contracts_1.Contract(assetId, vector_types_1.ERC20Abi, signer);
        const checkApprovalRes = await this.getTokenAllowance(assetId, owner, spender, chainId);
        if (checkApprovalRes.isError) {
            this.log.error({
                method: "approveTokens",
                spender,
                owner,
                assetId,
                error: (_a = checkApprovalRes.getError()) === null || _a === void 0 ? void 0 : _a.message,
            }, "Error checking approved tokens for deposit A");
            return vector_types_1.Result.fail(checkApprovalRes.getError());
        }
        if (bignumber_1.BigNumber.from(checkApprovalRes.getValue()).gte(amount)) {
            this.log.info({
                method: "approveTokens",
                assetId,
                spender,
                owner,
                approved: checkApprovalRes.getValue().toString(),
            }, "Allowance is sufficient");
            return vector_types_1.Result.ok(undefined);
        }
        const approveRes = await this.sendTxWithRetries(channelAddress, vector_types_1.TransactionReason.approveTokens, () => erc20.approve(spender, amount, { gasPrice }));
        if (approveRes.isError) {
            this.log.error({
                method: "approveTokens",
                spender,
                error: (_b = approveRes.getError()) === null || _b === void 0 ? void 0 : _b.message,
            }, "Error approving tokens for deposit A");
            return approveRes;
        }
        const approveTx = approveRes.getValue();
        this.log.info({ txHash: approveTx.hash, method: "approveTokens", assetId, amount }, "Approve token tx submitted");
        return approveRes;
    }
    async sendDepositATx(channelState, amount, assetId, gasPrice) {
        var _a;
        const method = "sendDepositATx";
        const methodId = vector_utils_1.getRandomBytes32();
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        const vectorChannel = new contracts_1.Contract(channelState.channelAddress, artifacts_1.VectorChannel.abi, signer);
        if (assetId !== constants_1.AddressZero) {
            this.log.info({ method, methodId, assetId, channelAddress: channelState.channelAddress }, "Approving token");
            const approveRes = await this.approveTokens(channelState.channelAddress, channelState.channelAddress, channelState.alice, vector_types_1.UINT_MAX, assetId, channelState.networkContext.chainId, gasPrice);
            if (approveRes.isError) {
                this.log.error({
                    method,
                    methodId,
                    channelAddress: channelState.channelAddress,
                    error: (_a = approveRes.getError()) === null || _a === void 0 ? void 0 : _a.message,
                }, "Error approving tokens for deposit A");
                return vector_types_1.Result.fail(approveRes.getError());
            }
            const approveTx = approveRes.getValue();
            if (approveTx) {
                const receipt = await approveTx.wait();
                if (receipt.status === 0) {
                    return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.TxReverted, { receipt }));
                }
            }
            this.log.info({ txHash: approveTx === null || approveTx === void 0 ? void 0 : approveTx.hash, method, methodId, assetId }, "Token approval confirmed");
            return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.depositA, () => vectorChannel.depositAlice(assetId, amount, { gasPrice }));
        }
        return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.depositA, () => vectorChannel.depositAlice(assetId, amount, { value: amount, gasPrice }));
    }
    async sendDepositBTx(channelState, amount, assetId, gasPrice) {
        const signer = this.signers.get(channelState.networkContext.chainId);
        if (!(signer === null || signer === void 0 ? void 0 : signer._isSigner)) {
            return vector_types_1.Result.fail(new vector_types_1.ChainError(vector_types_1.ChainError.reasons.SignerNotFound));
        }
        if (assetId === constants_1.AddressZero) {
            return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.depositB, () => signer.sendTransaction({
                data: "0x",
                to: channelState.channelAddress,
                value: bignumber_1.BigNumber.from(amount),
                chainId: channelState.networkContext.chainId,
                gasPrice,
            }));
        }
        else {
            const erc20 = new contracts_1.Contract(channelState.networkContext.channelFactoryAddress, vector_types_1.ERC20Abi, signer);
            return this.sendTxWithRetries(channelState.channelAddress, vector_types_1.TransactionReason.depositB, () => erc20.transfer(channelState.channelAddress, amount, { gasPrice }));
        }
    }
}
exports.EthereumChainService = EthereumChainService;
//# sourceMappingURL=ethService.js.map