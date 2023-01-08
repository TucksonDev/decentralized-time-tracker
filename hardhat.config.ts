import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Load dotenv configuration
import * as dotenv from 'dotenv'
dotenv.config();

const config: HardhatUserConfig = {
    // Nodes
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
        },
        ganache: {
            url: process.env.LOCAL_RPC,
            accounts: [
                process.env.LOCAL_PRIVATE_KEY_0 as string,
                process.env.LOCAL_PRIVATE_KEY_1 as string,
                process.env.LOCAL_PRIVATE_KEY_2 as string,
                process.env.LOCAL_PRIVATE_KEY_3 as string,
                process.env.LOCAL_PRIVATE_KEY_4 as string,
                process.env.LOCAL_PRIVATE_KEY_5 as string,
                process.env.LOCAL_PRIVATE_KEY_6 as string,
                process.env.LOCAL_PRIVATE_KEY_7 as string,
                process.env.LOCAL_PRIVATE_KEY_8 as string,
                process.env.LOCAL_PRIVATE_KEY_9 as string,
            ]
        },
        goerli: {
            url: "https://eth-goerli.g.alchemy.com/v2/" + process.env.ALCHEMY_GOERLI_KEY,
            accounts: [process.env.GOERLI_PRIVATE_KEY as string],

            // Use these if network is volatile and want to make sure your txn goes through
            // https://hardhat.org/config/
            // gas, gasPrice, ... are measured in "wei" (without 'g')
            gasPrice: 5000000000, // 5 gwei
        },
        polygonMumbai: {
            url: "https://polygon-mumbai.g.alchemy.com/v2/" + process.env.ALCHEMY_MUMBAI_KEY,
            accounts: [process.env.GOERLI_PRIVATE_KEY as string],

            // Use these if network is volatile and want to make sure your txn goes through
            // https://hardhat.org/config/
            // gas, gasPrice, ... are measured in "wei" (without 'g')
            gasPrice: 25000000000,  // 25 gwei
        },
    },

    // Compiler options
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
};

export default config;
