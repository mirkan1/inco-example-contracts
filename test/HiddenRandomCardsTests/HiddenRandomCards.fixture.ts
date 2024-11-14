
import { ethers } from "hardhat";

import type { HiddenRandomCards } from "../../types";
import { getSigners } from "../signers";

export async function deployRandomNumberGeneratorFixture(): Promise<HiddenRandomCards> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("HiddenRandomCards");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();
  console.log("HiddenRandomCards Contract Address is:", await contract.getAddress());

  return contract;
}
