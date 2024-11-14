
import { ethers } from "hardhat";

import type { ConfidentialDID } from "../../types";
import { getSigners } from "../signers";

export async function deployConfidentialDIDFixture(): Promise<ConfidentialDID> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("ConfidentialDID");
  const contract = await contractFactory.connect(signers.alice).deploy(signers.alice.address);
  await contract.waitForDeployment();
  console.log("ConfidentialDID Contract Address is:", await contract.getAddress());

  return contract;
}
