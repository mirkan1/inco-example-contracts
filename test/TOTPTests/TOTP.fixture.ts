import { ethers } from "hardhat";

import type { TOTP } from "../../types";
import { getSigners } from "../signers";

export async function deployTOTPFixture (): Promise<TOTP> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("TOTP");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  console.log("TOTP Contract Address is:", await contract.getAddress());

  return contract;
}
