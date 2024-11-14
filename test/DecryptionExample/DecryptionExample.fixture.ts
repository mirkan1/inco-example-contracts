
import { ethers } from "hardhat";

import type { DecryptionExample } from "../../types";
import { getSigners } from "../signers";

export async function deployDecryptiponExampleFixture(): Promise<DecryptionExample> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("DecryptionExample");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();
  console.log("DecryptionExample Contract Address is:", await contract.getAddress());

  return contract;
}
