import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy FHECounter contract
  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  console.log(`FHECounter contract deployed at: `, deployedFHECounter.address);

  // Verify deployment
  if (!deployedFHECounter.newlyDeployed) {
    console.log("FHECounter contract was already deployed");
  }

  // Deploy TrustScoreTracker contract
  const deployedTrustScoreTracker = await deploy("TrustScoreTracker", {
    from: deployer,
    log: true,
  });

  console.log(`TrustScoreTracker contract deployed at: `, deployedTrustScoreTracker.address);

  // Verify deployment
  if (!deployedTrustScoreTracker.newlyDeployed) {
    console.log("TrustScoreTracker contract was already deployed");
  }

  console.log("\nDeployment summary:");
  console.log("- FHECounter:", deployedFHECounter.address);
  console.log("- TrustScoreTracker:", deployedTrustScoreTracker.address);
};
export default func;
func.id = "deploy_contracts"; // id required to prevent reexecution
func.tags = ["FHECounter", "TrustScoreTracker"];
