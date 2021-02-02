"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-typechain");
require("@nomiclabs/hardhat-etherscan");
require("@eth-optimism/plugins/hardhat/compiler/0.7.6");
require("@eth-optimism/plugins/hardhat/ethers");
require("./src.ts/tasks");
const urlOverride = process.env.ETH_PROVIDER_URL;
const chainId = parseInt((_a = process.env.CHAIN_ID) !== null && _a !== void 0 ? _a : "1337", 10);
const mnemonic = process.env.SUGAR_DADDY ||
    process.env.MNEMONIC ||
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const config = {
    paths: {
        artifacts: "./artifacts",
        deploy: "./deploy",
        deployments: "./deployments",
        sources: "./src.sol",
        tests: "./src.ts",
    },
    solidity: {
        version: "0.7.3",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    defaultNetwork: "hardhat",
    namedAccounts: {
        deployer: { default: 0 },
        alice: { default: 1 },
        bob: { default: 2 },
        rando: { default: 3 },
    },
    etherscan: {
        apiKey: process.env.API_KEY || "",
    },
    networks: {
        hardhat: {
            accounts: {
                accountsBalance: "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                mnemonic,
            },
            chainId,
            loggingEnabled: false,
            saveDeployments: false,
        },
        localhost: {
            accounts: {
                accountsBalance: "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                mnemonic,
            },
            chainId,
            loggingEnabled: false,
            saveDeployments: false,
            url: urlOverride || "http://localhost:8545",
        },
        mainnet: {
            accounts: { mnemonic },
            chainId: 1,
            url: urlOverride || "http://localhost:8545",
        },
        rinkeby: {
            accounts: { mnemonic },
            chainId: 4,
            url: urlOverride || "http://localhost:8545",
        },
        goerli: {
            accounts: { mnemonic },
            chainId: 5,
            url: urlOverride || "http://localhost:8545",
        },
        kovan: {
            accounts: { mnemonic },
            chainId: 42,
            url: urlOverride || "http://localhost:8545",
        },
        matic: {
            accounts: { mnemonic },
            chainId: 137,
            url: urlOverride || "http://localhost:8545",
        },
        mumbai: {
            accounts: { mnemonic },
            chainId: 80001,
            url: urlOverride || "https://rpc-mumbai.matic.today",
        },
        arbitrumtest: {
            accounts: { mnemonic },
            chainId: 79377087078960,
            url: urlOverride || "https://kovan3.arbitrum.io/rpc",
        },
    },
};
exports.default = config;
//# sourceMappingURL=hardhat.config.js.map