// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "hardhat/console.sol";
/**
 * 在智能合约中，您可以使用OpenZeppelin库中的Counters模块来创建和管理计数器。
 * 首先，您需要在合约中导入Counters模块并使用using Counters for Counters.Counter;
 * 语句为Counter结构体定义方法。然后，您可以定义一个Counter类型的变量来表示计数器，
 * 并使用increment()和decrement()方法来增加或减少计数器的值。例如，如果您定义了
 * 一个名为_tokenIds的计数器变量，您可以使用_tokenIds.increment()来增加计数器的值。
 * 此外，您还可以使用current()方法来获取计数器的当前值。例如，您可以使用
 * _tokenIds.current()来获取_tokenIds计数器的当前值。
 */
error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.00025 ether;
    address payable owner;

    // mapping(uint256 => Listing) private idToMarketItem;

    struct Listing {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    // 展示事件
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    // 取消事件
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    // 购买事件
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    /** RC721（"代币名称","代币符号"）构造函数来初始化合约并设置代币名称和符号 */
    constructor() ERC721("MyDappCoin", "MDC") {
        owner = payable(msg.sender);
    }

    /**
     * 函数修饰器可以被用来以声明的方式修改函数的语义(见合约部分的 函数修饰器)。重载，也就是具有
     * 同一个修饰器的名字但有不同的参数，是不可能的。与函数一样，修饰器也可以被 重载。
     * notListed修饰符接受两个参数：nftAddress和tokenId。它检查给定地址和代币ID的商品是否已
     * 在市场上列出。如果商品已列出（即其价格大于0），则会触发一个名为AlreadyListed的异常。
     */
    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }
    /**isListed修饰符也接受两个参数：nftAddress和tokenId。它检查给定地址和代币ID
     * 的商品是否已在市场上列出。如果商品未列出（即其价格小于等于0），则会触发一个名为NotListed的异常。
     */
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }
    /**
     *isOwner修饰符接受三个参数：nftAddress，tokenId和spender。它检查给定地址和
     *代币ID的NFT的所有者是否为spender。如果spender不是NFT的所有者，则会触发一个名为NotOwner的异常。
     */
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }

    /* 更新合约的列表价格 */
    function updateListingPrice(uint256 _listingPrice) public payable {
        require(owner == msg.sender, "Only marketplace owner can update listing price.");
        listingPrice = _listingPrice;
    }

    /* 返回合约的列表价格 */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* 铸造一个代币并将其列在marketplace上 */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        // createMarketItem(newTokenId, price);
        return newTokenId;
    }

    /////////////////////
    // 主函数 Functions //
    /////////////////////
    /*
     * @notice NFT列表方法
     * @param nftAddress NFT合约地址
     * @param tokenId NFT的Token ID
     * @param price每一个列表项的价格
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        bool sold
    ) external notListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(tokenId, payable(msg.sender), owner, price, sold);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /*
     * @notice 被取消的列表方法
     * @param nftAddress NFT合约地址
     * @param tokenId NFT的Token ID
     */
    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    /*
     * @notice 被购买的列表方法
     * @notice NFT的所有者可以取消批准marketplace,
     * 这将导致此功能失败
     * 理想情况下，您还应该具有“`createOffer` 创建报价”功能
     * @param nftAddress NFT合约地址
     * @param tokenId NFT的Token ID
     */
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        // isNotOwner(nftAddress, tokenId, msg.sender)
        nonReentrant
    {
        // Challenge - How would you refactor this contract to take:
        // 1. 任意令牌作为付款? (HINT - Chainlink Price Feeds!)
        // 2. 能够以其他货币设置价格？
        // 3. Tweet me @PatrickAlphaC if you come up with a solution!
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] += msg.value;
        // Could just send the money...
        // https://fravoll.github.io/solidity-patterns/pull_over_push.html
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /*
     * @notice 更新展示列表的方法 Method for updating listing
     * @param  nftAddress Address of NFT contract
     * @param tokenId NFT的Token ID
     * @param newPrice每一项的价格Wei单位
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId, msg.sender)
    {
        //We should check the value of `newPrice` and revert if it's below zero (like we also check in `listItem()`)
        if (newPrice <= 0) {
            revert PriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /*
     * @notice 提取售出收益的方法 Method for withdrawing proceeds from sales
     */
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    /////////////////////
    // Getter Functions //
    /////////////////////

    // 获取指定的NFT商品
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    // 获取出售者的收益
    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
    /*
    /* 在marketplace上加入该商品 */
    // function createMarketItem(uint256 tokenId, uint256 price) private {
    //     require(price > 0, "Price must be at least 1 wei");
    //     require(msg.value == listingPrice, "Price must be equal to listing price");
    //     idToMarketItem[tokenId] = MarketItem(
    //         tokenId,
    //         payable(msg.sender),
    //         payable(address(this)),
    //         price,
    //         false
    //     );

    //     _transfer(msg.sender, address(this), tokenId);
    //     emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    // }

    /* 允许某人转售他们购买的代币 */
    // function resellToken(uint256 tokenId, uint256 price) public payable {
    //     require(
    //         idToMarketItem[tokenId].owner == msg.sender,
    //         "Only item owner can perform this operation"
    //     );
    //     require(msg.value == listingPrice, "Price must be equal to listing price");
    //     idToMarketItem[tokenId].sold = false;
    //     idToMarketItem[tokenId].price = price;
    //     idToMarketItem[tokenId].seller = payable(msg.sender);
    //     idToMarketItem[tokenId].owner = payable(address(this));
    //     _itemsSold.decrement();

    //     _transfer(msg.sender, address(this), tokenId);
    // }

    /* 创建marketplace商品的销售 */
    /* 转移物品的所有权以及双方之间的资金 */
    // function createMarketSale(uint256 tokenId) public payable {
    //     uint256 price = idToMarketItem[tokenId].price;
    //     address payable creator = idToMarketItem[tokenId].seller;
    //     require(
    //         msg.value == price,
    //         "Please submit the asking price in order to complete the purchase"
    //     );
    //     idToMarketItem[tokenId].owner = payable(msg.sender);
    //     idToMarketItem[tokenId].sold = true;
    //     idToMarketItem[tokenId].seller = payable(address(0));
    //     _itemsSold.increment();
    //     _transfer(address(this), msg.sender, tokenId);
    //     payable(owner).transfer(listingPrice);
    //     payable(creator).transfer(msg.value);
    // }

    // /* 返回所有未销售的商品 */
    // function fetchMarketItems() public view returns (MarketItem[] memory) {
    //     uint256 itemCount = _tokenIds.current();
    //     uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
    //     uint256 currentIndex = 0;

    //     MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    //     for (uint256 i = 0; i < itemCount; i++) {
    //         if (idToMarketItem[i + 1].owner == address(this)) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = idToMarketItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }

    /* 返回用户已经购买过的商品 */
    // function fetchMyNFTs() public view returns (MarketItem[] memory) {
    //     uint256 totalItemCount = _tokenIds.current();
    //     uint256 itemCount = 0;
    //     uint256 currentIndex = 0;

    //     for (uint256 i = 0; i < totalItemCount; i++) {
    //         if (idToMarketItem[i + 1].owner == msg.sender) {
    //             itemCount += 1;
    //         }
    //     }

    //     MarketItem[] memory items = new MarketItem[](itemCount);
    //     for (uint256 i = 0; i < totalItemCount; i++) {
    //         if (idToMarketItem[i + 1].owner == msg.sender) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = idToMarketItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }

    /* 仅返回用户已列出的商品 */
    // function fetchItemsListed() public view returns (MarketItem[] memory) {
    //     uint256 totalItemCount = _tokenIds.current();
    //     uint256 itemCount = 0;
    //     uint256 currentIndex = 0;

    //     for (uint256 i = 0; i < totalItemCount; i++) {
    //         if (idToMarketItem[i + 1].seller == msg.sender) {
    //             itemCount += 1;
    //         }
    //     }

    //     MarketItem[] memory items = new MarketItem[](itemCount);
    //     for (uint256 i = 0; i < totalItemCount; i++) {
    //         if (idToMarketItem[i + 1].seller == msg.sender) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = idToMarketItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }
}
