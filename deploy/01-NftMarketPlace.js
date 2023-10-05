const { ethers, network } = require("hardhat")
const { verify } = require("../utils/verify.js")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy, get, log } = deployments
    const { deployer } = await getNamedAccounts()
    const nftMarketPlace = await deploy("NftMarketPlace", {
        from: deployer,
        args: [],
        log: true
    })
    log("contract deployed----")
    if (!developmentChains.includes(network.name)) {
        await verify(nftMarketPlace.address, [])
    }
}
module.exports.tags = ['all', "market"]