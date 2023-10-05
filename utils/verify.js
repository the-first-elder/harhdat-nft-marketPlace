const { run } = require("hardhat")

async function verify(contractAddress, args) {
    console.log("verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.includes("already verified")) {
            console.log("already verified")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }