// require('@nomiclabs/hardhat-waffle')

require("@nomiclabs/hardhat-ethers")
// require('ethereum-waffle')
require("@nomicfoundation/hardhat-ethers")
require('@nomiclabs/hardhat-etherscan')
require('hardhat-deploy')
require('solidity-coverage')
require('hardhat-gas-reporter')
require("@nomicfoundation/hardhat-chai-matchers")
// require('hardhat-contract-sizer')
require('dotenv').config()


const sepoliaUrl = process.env.SEPOLIA_RPC_URL || ""
const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY || 'key'
const coinMarketCapKey = process.env.COINMARKETCAP_KEY || 'key'
const etherscan = process.env.ETHERSCAN_KEY || 'key'
const arbitrumurl = process.env.ARBITRUM_RPC_URL || 'key'
const maiNetKey = process.env.ETHEREUM_MAINET_RPC || "key"

// 0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a nft addr
// console.log(sepoliaPRIVATEKEY)
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: maiNetKey,
      }
    },
    // hardhat: {
    //   chainId: 31337,
    //   // gasPrice: 130000000000,
    // },
    sepolia: {
      url: sepoliaUrl,
      accounts: [sepoliaPrivateKey],
      chainId: 11155111,
      blockConfirmations: 3,
    },
    arbitrum: {
      url: arbitrumurl, accounts: [sepoliaPrivateKey],
      chainId: 42161,
      blockConfirmations: 3,

    }
  },
  solidity: {
    compilers: [{ version: "0.8.20" }, { version: "0.4.19" }, { version: "0.6.12" }, { version: "0.6.6" }, { version: "0.8.7" },{version:"0.5.0"}]
  },

  namedAccounts: {
    deployer: {
      default: 0
    },
    player: {
      default: 1
    }
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      sepolia: etherscan
      // polygon: POLYGONSCAN_API_KEY,
    }
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: coinMarketCapKey,
    token: "MATIC",
    gasPriceApi:
      "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  },
  mocha: {
    timeout: 200000 // 200sec
  },
  contractSizer: {
    runOnCompile: false,
    only: ["Raffle"],
  },
}