// import { expect } from "chai";

// import { awaitAllDecryptionResults } from "../asyncDecrypt";
// import { createInstances } from "../instance";
// import { getSigners, initSigners } from "../signers";
// import { deployDecryptiponExampleFixture } from "./DecryptionExample.fixture";

// describe("Decryption Example Tests", function () {
//   before(async function () {
//     // Initialize signers before running tests
//     await initSigners();
//     this.signers = await getSigners();
//   });

//   beforeEach(async function () {
//     // Deploy the Random Number Generator contract before each test
//     const dceContract = await deployDecryptiponExampleFixture();
//     this.contractAddress = await dceContract.getAddress();
//     this.dceContract = dceContract;
//     this.instances = await createInstances(this.signers);
//   });

//   it("Should generate random numbers, re-encrypt, and retrieve them", async function () {
//     // Generate random numbers
//     const transaction = await this.dceContract.generateRandomNumber({ gasLimit: 5000000 });
//     await transaction.wait();

//     await awaitAllDecryptionResults();

//     // Wait for 5 seconds
//     await delay(10000);

//     // Output the re-encrypted random numbers
//     console.log("First Random Number:", Number(await this.dceContract.randomNumber()) % 53);
//     console.log("Second Random Number:", Number(await this.dceContract.randomNumber1()) % 53);
//   });

//   function delay(ms: any) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }
// });
