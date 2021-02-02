import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-typechain";
import "@nomiclabs/hardhat-etherscan";
import "@eth-optimism/plugins/hardhat/compiler/0.7.6";
import "@eth-optimism/plugins/hardhat/ethers";
import { HardhatUserConfig } from "hardhat/types";
import "./src.ts/tasks";
declare const config: HardhatUserConfig;
export default config;
//# sourceMappingURL=hardhat.config.d.ts.map