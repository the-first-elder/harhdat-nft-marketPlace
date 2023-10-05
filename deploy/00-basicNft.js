const { ethers, network } = require('hardhat')
const { developmentChains } = require("../helper-hardhat-config")

const { verify } = require("../utils/verify")

require("dotenv")
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { get, log, deploy } = deployments
    const { deployer } = await getNamedAccounts()

    log("-----------")
    // const BasicNftContract = await get("BasicNFT")

    // const BasicNFTs = await ethers.getContractAt(BasicNftContract.abi, BasicNftContract.address)
    const args = []
    const basicNft = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!(developmentChains.includes(network.name) && process.env.ETHERSCAN_KEY)) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }

    log("-------")
}

module.exports.tags = ["all", "basicNft", "main"]