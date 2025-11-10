import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the TrustScoreTracker contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the TrustScoreTracker contract
 *
 *   npx hardhat --network localhost task:record-trust --score 8
 *   npx hardhat --network localhost task:get-total-score
 *   npx hardhat --network localhost task:get-average-score
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the TrustScoreTracker contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the TrustScoreTracker contract
 *
 *   npx hardhat --network sepolia task:record-trust --score 8
 *   npx hardhat --network sepolia task:get-total-score
 *   npx hardhat --network sepolia task:get-average-score
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the TrustScoreTracker address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const trustScoreTracker = await deployments.get("TrustScoreTracker");

  console.log("TrustScoreTracker address is " + trustScoreTracker.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:record-trust --score 8
 *   - npx hardhat --network sepolia task:record-trust --score 8
 */
task("task:record-trust", "Records a trust event with an encrypted score")
  .addOptionalParam("address", "Optionally specify the TrustScoreTracker contract address")
  .addParam("score", "The trust score (1-10)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const score = parseInt(taskArguments.score);
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      throw new Error(`Argument --score must be an integer between 1 and 10`);
    }

    await fhevm.initializeCLIApi();

    const TrustScoreTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("TrustScoreTracker");
    console.log(`TrustScoreTracker: ${TrustScoreTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("TrustScoreTracker", TrustScoreTrackerDeployment.address);

    // Encrypt the score
    const encryptedScore = await fhevm
      .createEncryptedInput(TrustScoreTrackerDeployment.address, signers[0].address)
      .add32(score)
      .encrypt();

    const tx = await contract
      .connect(signers[0])
      .recordTrustEvent(encryptedScore.handles[0], encryptedScore.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`TrustScoreTracker recordTrustEvent(${score}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-total-score
 *   - npx hardhat --network sepolia task:get-total-score
 */
task("task:get-total-score", "Gets the encrypted total trust score for the signer")
  .addOptionalParam("address", "Optionally specify the TrustScoreTracker contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const TrustScoreTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("TrustScoreTracker");
    console.log(`TrustScoreTracker: ${TrustScoreTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("TrustScoreTracker", TrustScoreTrackerDeployment.address);

    const encryptedTotal = await contract.getTotalTrustScore(signers[0].address);
    if (encryptedTotal === ethers.ZeroHash) {
      console.log(`Encrypted total: ${encryptedTotal}`);
      console.log("Clear total    : 0");
      return;
    }

    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      TrustScoreTrackerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted total: ${encryptedTotal}`);
    console.log(`Clear total    : ${clearTotal}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-average-score
 *   - npx hardhat --network sepolia task:get-average-score
 */
task("task:get-average-score", "Gets the encrypted average trust score for the signer")
  .addOptionalParam("address", "Optionally specify the TrustScoreTracker contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const TrustScoreTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("TrustScoreTracker");
    console.log(`TrustScoreTracker: ${TrustScoreTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("TrustScoreTracker", TrustScoreTrackerDeployment.address);

    const encryptedAverage = await contract.getAverageTrustScore(signers[0].address);
    if (encryptedAverage === ethers.ZeroHash) {
      console.log(`Encrypted average: ${encryptedAverage}`);
      console.log("Clear average    : 0");
      return;
    }

    const clearAverage = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAverage,
      TrustScoreTrackerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted average: ${encryptedAverage}`);
    console.log(`Clear average    : ${clearAverage}`);
  });

