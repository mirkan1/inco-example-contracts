import { ethers } from "hardhat";
import { getSigners } from "../signers";
import type { Rentals } from "../../types";

export async function deployRentalFixture(): Promise<Rentals> {
  const signers = await getSigners();

  const ConfidentialERC20ContractFactory = await ethers.getContractFactory("ConfidentialERC20");
  const ConfidentialERC20Contract = await ConfidentialERC20ContractFactory.connect(signers.alice).deploy();
  await ConfidentialERC20Contract.waitForDeployment();

  const BlindAuctionContractFactory = await ethers.getContractFactory("BlindAuction");
  const BlindAuctionContract = await BlindAuctionContractFactory.connect(signers.alice).deploy(
    signers.alice.address,
    ConfidentialERC20Contract,
    3600,
    true,
  );
  await BlindAuctionContract.waitForDeployment();

  const RentalsContractFactory = await ethers.getContractFactory("Rentals");
  console.log("RentalsContractFactory", RentalsContractFactory)
  const RentalsContract = await RentalsContractFactory.connect(signers.alice).deploy(
    signers.alice.address,
    // BlindAuctionContract.getAddress().toString,
  );
  await RentalsContract.waitForDeployment();
  return RentalsContract;
}
