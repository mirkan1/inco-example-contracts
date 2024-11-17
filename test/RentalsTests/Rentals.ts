import { expect } from "chai";
import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployBlindAuctionFixture } from "../BlindAuctionTests/BlindAuction.fixture";
import { deployRentalFixture } from "./Rentals.fixture";

describe("Rantals Tests", function () {
  before(async function () {
    // Initialize signers before running tests
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    // Deploy the Random Number Generator contract before each test
    const [ConfidentialERC20Contract, BlindAuctionContract] = await deployBlindAuctionFixture();
    const RentalContract = await deployRentalFixture();
    this.contractAddress = await BlindAuctionContract.getAddress();
    this.auction = BlindAuctionContract;
    this.tokenContract = ConfidentialERC20Contract;
    this.rentalContract = RentalContract;
    this.instances = await createInstances(this.signers);
  });

  it("should allow a user to set a rental in", async function () {
    const req = await this.rentalContract.signItem(1000, "my item");
    await req.wait();
    const item = this.rentalContract.getItemPrice(0);
    expect(item.owner).to.equal(this.signers.alice.address);
  })
});
