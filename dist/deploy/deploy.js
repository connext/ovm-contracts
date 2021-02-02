"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const hardhat_1 = require("hardhat");
const utils_1 = require("../src.ts/utils");
const constants_2 = require("../src.ts/constants");
const func = async () => {
    const log = constants_2.logger.child({ module: "Deploy" });
    const chainId = await hardhat_1.getChainId();
    const provider = hardhat_1.ethers.provider;
    const { deployer } = await hardhat_1.getNamedAccounts();
    const balance = await provider.getBalance(deployer);
    const nonce = await provider.getTransactionCount(deployer);
    log.info(`Preparing to migrate contracts to chain ${chainId}`);
    log.info(`Deployer address=${deployer} nonce=${nonce} balance=${units_1.formatEther(balance)}`);
    if (balance.eq(constants_1.Zero)) {
        throw new Error(`Account ${deployer} has zero balance on chain ${chainId}, aborting migration`);
    }
    const migrate = async (name, args) => {
        const processedArgs = await Promise.all(args.map(async (arg) => {
            try {
                return (await hardhat_1.deployments.get(arg)).address;
            }
            catch (e) {
                return arg;
            }
        }));
        log.info(`Deploying ${name} with args [${processedArgs.join(", ")}]`);
        await hardhat_1.deployments.deploy(name, {
            from: deployer,
            args: processedArgs,
        });
        const deployment = await hardhat_1.deployments.get(name);
        if (!deployment.transactionHash) {
            throw new Error(`Failed to deploy ${name}`);
        }
        const tx = await hardhat_1.ethers.provider.getTransaction(deployment.transactionHash);
        const receipt = await hardhat_1.ethers.provider.getTransactionReceipt(deployment.transactionHash);
        log.info(`Sent transaction to deploy ${name}, txHash: ${deployment.transactionHash}`);
        log.info(`Success! Consumed ${receipt.gasUsed} gas worth ${constants_1.EtherSymbol} ${units_1.formatEther((receipt.gasUsed || constants_1.Zero).mul(tx.gasPrice))} deploying ${name} to address: ${deployment.address}`);
    };
    const standardMigration = [
        ["ChannelMastercopy", []],
        ["ChannelFactory", ["ChannelMastercopy", constants_1.Zero]],
        ["HashlockTransfer", []],
        ["Withdraw", []],
        ["TransferRegistry", []],
        ["TestToken", []],
    ];
    if (hardhat_1.network.name === "hardhat") {
        log.info(`Running localnet migration`);
        for (const row of [
            ...standardMigration,
            ["TestChannel", []],
            ["TestChannelFactory", ["TestChannel", constants_1.Zero]],
            ["FailingToken", []],
            ["NonconformingToken", []],
            ["TestLibIterableMapping", []],
            ["CMCAsset", []],
        ]) {
            const name = row[0];
            const args = row[1];
            await migrate(name, args);
        }
        await utils_1.registerTransfer("Withdraw", deployer);
        await utils_1.registerTransfer("HashlockTransfer", deployer);
    }
    else {
        log.info(`Running testnet migration`);
        for (const row of standardMigration) {
            const name = row[0];
            const args = row[1];
            await migrate(name, args);
        }
        await utils_1.registerTransfer("Withdraw", deployer);
        await utils_1.registerTransfer("HashlockTransfer", deployer);
    }
    log.info("All done!");
    const spent = units_1.formatEther(balance.sub(await provider.getBalance(deployer)));
    const nTx = (await provider.getTransactionCount(deployer)) - nonce;
    log.info(`Sent ${nTx} transaction${nTx === 1 ? "" : "s"} & spent ${constants_1.EtherSymbol} ${spent}`);
};
exports.default = func;
//# sourceMappingURL=deploy.js.map