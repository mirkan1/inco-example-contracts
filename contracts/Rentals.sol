// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";
import "./BlindAuction.sol";

contract Rentals is Ownable {
  using Math for uint256;
  struct Bike {
    uint256 id;
    uint256 price;
    address owner;
    int256 status;
    uint256 returnTime;
    string title;
    uint256 howManyRents;
    address renter;
    uint256 howManyHours;
  }

    struct Bet {
        uint256 bikeId;
        address better;
        euint64 amount;
        bool settled;
    }

  uint256 public totalSupply = 2**256 - 1;
  uint256 public totalBikes = 0;
  uint256 public totalBikesRented = 0;
  uint256 public availableBikesCounter = 0;
  uint256 public bikeCounter;
  uint256 public hourlyPriceOfBikes = 1 ether;
  address blindAuctionAddress;
  event BikeInfo(uint256 _id, string _result, uint256 _transferred);
  event BikeSigned(uint256 _id, address _owner, uint256 _price);

  Bike[] public bikes;

  // mapping (uint => Bet) public bets;
  // mapping (address => GamblerInfo) public _GamblerInfo;

  constructor(address _address) Ownable(msg.sender) {
    blindAuctionAddress = _address;
  }

  function signBike (
    uint256 _price,
    string memory _title
    /// ConfidentialERC20 _tokenContract
) public payable {
    uint256 _id = bikeCounter++;
    console.log(_id);
    bikes.push(Bike({
      id: _id,
      price: _price,
      owner: msg.sender,
      status: 1,
      returnTime: 0,
      title: _title,
      howManyRents: 0,
      renter: address(0x0000000000000000000000000000000000000000),
      howManyHours: 0
    }));

    availableBikesCounter++;
    emit BikeSigned(_id, msg.sender, _price);

    // map address to rented bikes

  }

  function getBikePrice(uint256 _id) public view returns(uint256) {
    return bikes[_id].price;
  }

  function rentBike(uint256 _id, uint256 howManyHours) public payable {
    // require bike available
    int256 isBikeAvailable = bikes[_id].status;
    require(isBikeAvailable > 0, "bike must be available for renting");
    address bikeOwner = bikes[_id].owner;
    require(bikeOwner != msg.sender, "msg sender cannot be the owner of the bike");
    uint256 amount = msg.value;
    uint256 bikePrice = getBikePrice(_id);
    require(howManyHours > 0, "cannot rent a bike less than 1 hour");
    uint256 totalHours = howManyHours * hourlyPriceOfBikes;
    require(amount >= bikePrice + totalHours, "amount payed cannot be lower than bikePrice plus totalHours");
    bikes[_id].howManyHours = howManyHours;
    bikes[_id].status = 0;
    bikes[_id].returnTime = block.timestamp + (howManyHours * 1 hours);
    bikes[_id].renter = msg.sender;
    payable(address(this)).call{value: msg.value};
  }

  function bidForBike(einput encryptedValue, bytes calldata inputProof) external {
    BlindAuction(blindAuctionAddress).bid(encryptedValue, inputProof);
  }

  function giveBikeIn(uint256 _id) public payable {
    uint256 bikePrice = getBikePrice(_id);
    uint256 fee;
    uint256 extraTime;
    address renter = bikes[_id].renter;
    uint256 howManyHours = bikes[_id].howManyHours;
    require(renter == msg.sender, "msg sender must be the renter of the bike");
    // did he return the bike on time?
    // require(bikes[_id].returnTime > block.timestamp, "did he return in time?")
    if (bikes[_id].returnTime < block.timestamp) {
        // he is late, extra fee
        extraTime = (block.timestamp - bikes[_id].returnTime) / 1 hours;
        console.log("block.timestamp", block.timestamp);
        console.log("bikes[_id].returnTime", bikes[_id].returnTime);
        console.log("1 hours", 1 hours);
        fee = extraTime * hourlyPriceOfBikes;
    } else {
        extraTime = (bikes[_id].returnTime - block.timestamp) / 1 hours;
        console.log("block.timestamp", block.timestamp);
        console.log("bikes[_id].returnTime", bikes[_id].returnTime);
        console.log("1 hours", 1 hours);
        fee = extraTime * hourlyPriceOfBikes;
    }
    console.log("val", msg.value);
    console.log("fee", fee);
    if (fee > bikePrice) {
        payable(bikes[_id].owner).transfer(fee);
    } else {
        payable(msg.sender).transfer(bikePrice - fee);
        payable(bikes[_id].owner).transfer(hourlyPriceOfBikes*howManyHours);
    }
    bikes[_id].howManyRents = bikes[_id].howManyRents + 1;
    bikes[_id].renter = 0x0000000000000000000000000000000000000000;
    bikes[_id].status = 1;
    bikes[_id].returnTime = 0;
  }

    function changeBikePrice(uint256 _id, uint256 newPrice) public payable {
      address bikeOwner = bikes[_id].owner;
      require(msg.sender == bikeOwner, "message sender must be the owner of the given id bike");
      uint256 prevPrice = bikes[_id].price;
      require(prevPrice != newPrice, "newPrice must be diffirent than prevPrice");
      bikes[_id].price = newPrice;
    }

    function changeBikeOwnership(uint256 _id, address newOwner) public payable {
      address bikeOwner = bikes[_id].owner;
      require(msg.sender == bikeOwner, "message sender must be the owner of the given id bike");
      bikes[_id].owner = newOwner;
    }

    function changeBikeTitle(uint256 _id, string memory newTitle) public payable {
      address bikeOwner = bikes[_id].owner;
      require(msg.sender == bikeOwner, "message sender must be the owner of the given id bike");
      string memory prevTitle = bikes[_id].title;
      require(keccak256(bytes(prevTitle)) != keccak256(bytes(newTitle)), "newTitle must be diffirent than prevTitle");
      bikes[_id].title = newTitle;
    }

    function takeBikeDown(uint256 _id) public payable {
      address bikeOwner = bikes[_id].owner;
      require(msg.sender == bikeOwner, "message sender must be the owner of the given id bike");
      bikes[_id].status = -1;
    }

    function makeBikeAvailableAgain(uint256 _id) public payable {
      address bikeOwner = bikes[_id].owner;
      require(msg.sender == bikeOwner, "message sender must be the owner of the given id bike");
      int256 status = bikes[_id].status;
      require(status == -1, "bike is already available or rented");
      bikes[_id].status = 1;
    }
}
