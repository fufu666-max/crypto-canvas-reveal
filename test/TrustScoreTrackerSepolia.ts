import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { TrustScoreTracker } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("TrustScoreTrackerSepolia", function () {
  let signers: Signers;
  let trustScoreTracker: TrustScoreTracker;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const TrustScoreTrackerDeployment = await deployments.get("TrustScoreTracker");
      contractAddress = TrustScoreTrackerDeployment.address;
      trustScoreTracker = await ethers.getContractAt("TrustScoreTracker", TrustScoreTrackerDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should record trust events and calculate totals on Sepolia", async function () {
    steps = 15;
    this.timeout(4 * 60000);

    const scores = [8, 9, 7];
    let expectedTotal = 0;

    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      expectedTotal += score;

      progress(`Encrypting trust score ${score}...`);
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(score)
        .encrypt();

      progress(`Recording trust event ${i + 1}/${scores.length}...`);
      const tx = await trustScoreTracker
        .connect(signers.alice)
        .recordTrustEvent(encryptedScore.handles[0], encryptedScore.inputProof);
      await tx.wait();
    }

    progress(`Getting total trust score...`);
    const encryptedTotal = await trustScoreTracker.getTotalTrustScore(signers.alice.address);
    expect(encryptedTotal).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting total trust score...`);
    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      contractAddress,
      signers.alice,
    );
    progress(`Clear total trust score: ${clearTotal}`);
    expect(clearTotal).to.eq(expectedTotal);

    progress(`Getting event count...`);
    const count = await trustScoreTracker.getTrustEventCount(signers.alice.address);
    progress(`Event count: ${count}`);
    expect(count).to.eq(scores.length);

    progress(`Getting average trust score...`);
    const encryptedAverage = await trustScoreTracker.getAverageTrustScore(signers.alice.address);
    
    progress(`Decrypting average trust score...`);
    const clearAverage = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAverage,
      contractAddress,
      signers.alice,
    );
    progress(`Clear average trust score: ${clearAverage}`);
    // Average should be approximately expectedTotal / scores.length
    // Note: FHE division is approximate, so we check it's close
    const expectedAverage = Math.floor(expectedTotal / scores.length);
    expect(clearAverage).to.be.closeTo(expectedAverage, 1);
  });
});

