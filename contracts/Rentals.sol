// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";

contract Rentals is Ownable {
  /// TFHE
  using Math for uint256;
  struct saleItem {
    uint256 id;
    uint256 price;
    address owner;
    int256 status;
    uint256 returnTime;
    string title;
    string pictureUrl;
    uint256 howManyRents;
    address renter;
    uint256 howManyHours;
  }

    struct Bet {
        uint256 itemId;
        address better;
        euint64 amount;
        bool settled;
    }


  uint256 public totalSupply = 2**256 - 1;
  uint256 public totalItems = 0;
  uint256 public totalItemsRented = 0;
  uint256 public availableItemsCount = 0;
  uint256 public itemCounter;
  uint256 public hourlyPriceOfItems = 1 ether;

  event itemInfo(uint256 _id, string _result, uint256 _transferred);
  event itemSigned(uint256 _id, address _owner, uint256 _price);

  saleItem[] public saleItems;

  mapping (uint256 => Bet) public bets;
  mapping (address => GamblerInfo) public _GamblerInfo;

  constructor(address _address) Ownable(msg.sender) {
  blindAuctionAddress = _address;
  }

  function signItem (uint256 _price, string memory _title) public payable {
    uint256 _id = itemCounter++;
    console.log(_id);
    saleItems.push(saleItem({
      id: _id,
      price: _price,
      owner: msg.sender,
      status: 1,
      returnTime: 0,
      title: _title,
      howManyRents: 0,
      renter: 0x0000000000000000000000000000000000000000,
      howManyHours: 0,
      pictureUrl: "https://via.placeholder.com/600x400?text=Item+0"
    }));

    availableItemsCount++;
    emit itemSigned(_id, msg.sender, _price);

    // map address to rented saleItems

  }

  function getItemPrice(uint256 _id) public view returns(uint256) {
    return saleItems[_id].price;
  }

  function rentItem(uint256 _id, uint256 howManyHours) public payable {
    // require item available
    int256 isItemAvailable = saleItems[_id].status;
    require(isItemAvailable > 0, "item must be available for renting");
    address itemOwner = saleItems[_id].owner;
    require(itemOwner != msg.sender, "msg sender cannot be the owner of the item");
    uint256 amount = msg.value;
    uint256 itemPrice = getItemPrice(_id);
    require(howManyHours > 0, "cannot rent a item less than 1 hour");
    uint256 totalHours = howManyHours * hourlyPriceOfItems;
    require(amount >= itemPrice + totalHours, "amount payed cannot be lower than itemPrice plus totalHours");
    saleItems[_id].howManyHours = howManyHours;
    saleItems[_id].status = 0;
    saleItems[_id].returnTime = block.timestamp + (howManyHours * 1 hours);
    saleItems[_id].renter = msg.sender;
    payable(address(this)).call{value: msg.value};
  }

  function giveItemIn(uint256 _id) public payable {
    uint256 itemPrice = getItemPrice(_id);
    uint256 fee;
    uint256 extraTime;
    address renter = saleItems[_id].renter;
    uint256 howManyHours = saleItems[_id].howManyHours;
    require(renter == msg.sender, "msg sender must be the renter of the item");
    if (saleItems[_id].returnTime < block.timestamp) {
        // he is late, extra fee
        extraTime = (block.timestamp - saleItems[_id].returnTime) / 1 hours;
        fee = extraTime * hourlyPriceOfItems;
    } else {
        extraTime = (saleItems[_id].returnTime - block.timestamp) / 1 hours;
        fee = extraTime * hourlyPriceOfItems;
    }
    if (fee > itemPrice) {
        payable(saleItems[_id].owner).transfer(fee);
    } else {
        payable(msg.sender).transfer(itemPrice - fee);
        payable(saleItems[_id].owner).transfer(hourlyPriceOfItems*howManyHours);
    }
    saleItems[_id].howManyRents = saleItems[_id].howManyRents + 1;
    saleItems[_id].returnTime = 0;
    saleItems[_id].status = 1;
    saleItems[_id].renter = 0x0000000000000000000000000000000000000000;
  }

    function changeItemPrice(uint256 _id, uint256 newPrice) public payable {
      address itemOwner = saleItems[_id].owner;
      require(msg.sender == itemOwner, "message sender must be the owner of the given id item");
      uint256 prevPrice = saleItems[_id].price;
      require(prevPrice != newPrice, "newPrice must be diffirent than prevPrice");
      saleItems[_id].price = newPrice;
    }

    function changeItemOwnership(uint256 _id, address newOwner) public payable {
      address itemOwner = saleItems[_id].owner;
      require(msg.sender == itemOwner, "message sender must be the owner of the given id item");
      saleItems[_id].owner = newOwner;
    }

    function changeItemTitle(uint256 _id, string memory newTitle) public payable {
      address itemOwner = saleItems[_id].owner;
      require(msg.sender == itemOwner, "message sender must be the owner of the given id item");
      string memory prevTitle = saleItems[_id].title;
      require(keccak256(bytes(prevTitle)) != keccak256(bytes(newTitle)), "newTitle must be diffirent than prevTitle");
      saleItems[_id].title = newTitle;
    }

    function takeItemDown(uint256 _id) public payable {
      address itemOwner = saleItems[_id].owner;
      require(msg.sender == itemOwner, "message sender must be the owner of the given id item");
      saleItems[_id].status = -1;
    }

    function makeItemAvailable(uint256 _id) public payable {
      address itemOwner = saleItems[_id].owner;
      require(msg.sender == itemOwner, "message sender must be the owner of the given id item");
      int256 status = saleItems[_id].status;
      require(status == -1, "item is already available or rented");
      saleItems[_id].status = 1;
    }
}
