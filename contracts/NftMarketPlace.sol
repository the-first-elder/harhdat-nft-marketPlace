// SPDX-License-Identifier: MIT
pragma solidity ~0.8.20;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketPlace__PriceMustBeAboveZero();
error NftMarketPlace__NotApprovedForMarketPlace();
error NftMarketPlace__AlreadyListed(address, uint);
error NftMarketPlace__NotOwner();
error NftMarketPlace__NotListed(address, uint);
error NftMarketPlace__PriceNotMet(address, uint, uint);
error NftMarketPlace__NoProceeds();
error NftMarketPlace__TransferFailed();

contract NftMarketPlace is ReentrancyGuard {
    struct Listing {
        uint price;
        address seller;
    }

    mapping(address => mapping(uint => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    event ItemsList(
        address indexed nftAddress,
        address indexed seller,
        uint indexed tokenId,
        uint price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint indexed tokenId,
        uint price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint indexed tokenId
    );

    constructor() {}

    /*
     * @notice : method for listing nft marketPlace
     *@param nftAddress :Addres of the Nft
     *@paramtokenId : the token ID of the nft
     *@dev:this way people can still hold their nft's
     */
    modifier notListed(
        address nftAddress,
        uint tokenId,
        uint price
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketPlace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketPlace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        // Listing memory listing = s_listings[nftAddress][tokenId];
        if (spender != owner) {
            revert NftMarketPlace__NotOwner();
        }
        _;
    }

    function listItems(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, price)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketPlace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketPlace__NotApprovedForMarketPlace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemsList(nftAddress, msg.sender, tokenId, price);
    }

    function buyItems(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external payable nonReentrant isListed(nftAddress, tokenId) {
        Listing memory listedItems = s_listings[nftAddress][tokenId];
        if (msg.value < listedItems.price) {
            revert NftMarketPlace__PriceNotMet(nftAddress, tokenId, price);
        }
        s_proceeds[listedItems.seller] += msg.value;
        // delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listedItems.seller,
            msg.sender,
            tokenId
        );
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItems.price);
    }

    function cancelListing(
        address nftAddress,
        uint tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint tokenId,
        uint newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemsList(nftAddress, msg.sender, tokenId, newPrice);
    }

    function withdrawProceeds() public payable {
        uint proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketPlace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketPlace__TransferFailed();
        }
    }

    function getListing(
        address nftAddress,
        uint tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint) {
        return s_proceeds[seller];
    }
}
