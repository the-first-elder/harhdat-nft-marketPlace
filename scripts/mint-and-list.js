const { ethers, deployments } = require("hardhat")
const { get } = deployments
const nftAddress = "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a";
const price = ethers.parseEther("1")

const main = async () => {
  const nftMarketPlaceFactory = await get("NftMarketPlace")
  const nftMarketPlace = await ethers.getContractAt(nftMarketPlaceFactory.abi, nftMarketPlaceFactory.address)

  const BasicNFTFactory = await get("BasicNFT")
  const BasicNFT = await ethers.getContractAt("BasicNFT", BasicNFTFactory.address)

  console.log("minting.....")
  const mintTx = await BasicNFT.mintNft()
  const mintTxReceipt = await mintTx.wait(1)
  const tokenId = mintTxReceipt.logs[0].args.tokenId.toString()
  console.log(mintTxReceipt.logs[0].args.tokenId.toString())
  console.log("Approving nft.....")

  const approvalTx = await BasicNFT.approve(nftMarketPlaceFactory.address, tokenId)
  await approvalTx.wait(1)
  console.log("listing nft.....")
  const listingTx = await nftMarketPlace.listItems(BasicNFTFactory.address, tokenId, price)
  await listingTx.wait(1)
  console.log("Listed...")
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})