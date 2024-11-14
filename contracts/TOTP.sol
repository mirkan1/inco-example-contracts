// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity >=0.8.13 <0.9.0;
import "fhevm/lib/TFHE.sol";

contract TOTP {
    // 4 digits
    euint16 public secretKey;
    address public owner;
    mapping(address => ebool) public isTotpValid;

    constructor() {
        owner = msg.sender;
    }

    modifier OnlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function setSecretKey(einput secretKeyInput, bytes calldata inputProof) public OnlyOwner {
        secretKey = TFHE.asEuint16(secretKeyInput, inputProof);
        TFHE.allow(secretKey, address(this));
        TFHE.allow(secretKey, owner);
    }

    function validateTOTP(einput _encryptedTOTP, bytes memory inputProof, uint32 timestamp) external {
        require(block.timestamp <= timestamp + 200, "Timestamp not within range");
        uint32 shorterTimestamp = timestamp % 100000;
        euint32 encryptedTOTP = TFHE.asEuint32(_encryptedTOTP, inputProof);
        ebool isValid = TFHE.eq(encryptedTOTP, TFHE.mul(TFHE.asEuint32(shorterTimestamp), secretKey));
        isTotpValid[msg.sender] = isValid;
        TFHE.allow(isValid, address(this));
        TFHE.allow(isValid, msg.sender);
    }

    function viewSecretKey() external view returns (euint16) {
        return secretKey;
    }
    function getIsTotpValid(address _userAddress) external view returns(ebool){
        return isTotpValid[_userAddress];
    }
}
