const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect, assert } = require("chai")

describe("market Place Test", () => {
  let marketPlaceContract, marketPlaceFactory, signer, NftContract, deployer, signerOne;
  const nftAddress = "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a";
  const ownerAddreess = "0x9b47b8aD2C3848609EE13470bA4286d5C5fF2BF2"
  const tokenId = 3220
  const price = ethers.parseEther('10')
  beforeEach("deploy contract", async () => {
    await deployments.fixture(["all"])
    const { get } = deployments
    signer = await ethers.getImpersonatedSigner(ownerAddreess)
    deployer = await getNamedAccounts().deployer
    signerOne = await ethers.getSigners()
    signerOne = signerOne[0]
    console.log(signerOne.address)

    marketPlaceFactory = await get("NftMarketPlace")
    marketPlaceContract = await ethers.getContractAt(marketPlaceFactory.abi, marketPlaceFactory.address)

    NftContract = await ethers.getContractAt("GenArt721", "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a")
  })

  describe("test  List Items Function....", () => {
    it("should revert if nft function is not called by the owner, if price is less than or equal to zero, ", async () => {

      await expect(marketPlaceContract.listItems(nftAddress, tokenId, price)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__NotOwner")


      await expect(marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, 0)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__PriceMustBeAboveZero")

      await expect(marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__NotApprovedForMarketPlace")

      await NftContract.connect(signer).approve(marketPlaceFactory.address, tokenId)

      expect(await marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)).to.emit(marketPlaceContract, nftAddress, ownerAddreess, tokenId, price)

      const listing = await marketPlaceContract.getListing(nftAddress, tokenId)
      assert.equal(listing.price, price)
      assert.equal(listing.seller, ownerAddreess)

    })
  })

  describe("buyItems function", () => {
    it("should revert if token is not listed", async () => {

      await expect(marketPlaceContract.buyItems(nftAddress, tokenId, 0)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__NotListed").withArgs(nftAddress, tokenId)

      await NftContract.connect(signer).approve(marketPlaceFactory.address, tokenId)

      await marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)

      await marketPlaceContract.buyItems(nftAddress, tokenId, ethers.parseEther("11"), { value: ethers.parseEther("11") })

      const listing = await marketPlaceContract.getListing(nftAddress, tokenId)
      assert.equal(listing.price, price)
      assert.equal(listing.seller, ownerAddreess)
      assert.equal(await marketPlaceContract.connect(signer).getProceeds(ownerAddreess), ethers.parseEther("11"))
      console.log(deployer)
      assert.equal(await NftContract.balanceOf(signerOne.address), 1)
    })
  })

  describe("cancelListing function", () => {
    it("should revert if not listed and owner", async () => {

      await expect(marketPlaceContract.cancelListing(nftAddress, tokenId)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__NotOwner")


      await NftContract.connect(signer).approve(marketPlaceFactory.address, tokenId)

      await expect(marketPlaceContract.connect(signer).cancelListing(nftAddress, tokenId)).to.be.revertedWithCustomError(marketPlaceContract, "NftMarketPlace__NotListed").withArgs(nftAddress, tokenId)

      await marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)
      await marketPlaceContract.connect(signer).cancelListing(nftAddress, tokenId)

      assert.equal(await marketPlaceContract.getListing(nftAddress, tokenId).price, undefined)

      await marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)

      expect(await marketPlaceContract.connect(signer).cancelListing(nftAddress, tokenId)).to.emit(marketPlaceContract, nftAddress, ownerAddreess, tokenId, price)

    })
  })

  describe('withdraw', () => {
    it("should revert if proceeds is zero", async () => {
      await expect(marketPlaceContract.withdrawProceeds()).to.be.reverted
      await NftContract.connect(signer).approve(marketPlaceFactory.address, tokenId)
      await marketPlaceContract.connect(signer).listItems(nftAddress, tokenId, price)
      const tx = await marketPlaceContract.buyItems(nftAddress, tokenId, ethers.parseEther("11"), { value: ethers.parseEther("11") })
      await tx.wait(1)
      await marketPlaceContract.connect(signer).withdrawProceeds()
      assert.equal(await marketPlaceContract.getProceeds(ownerAddreess), 0)
    })

  });
})