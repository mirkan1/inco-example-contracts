
import { ethers } from "hardhat";

import type { Voting } from "../../types";
import { getSigners } from "../signers";

export async function deployVotingFixture(): Promise<Voting> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("Voting");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();
  console.log("Voting Contract Address is:", await contract.getAddress());

  return contract;
}
