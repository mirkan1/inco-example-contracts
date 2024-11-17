import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // const deployed = await deploy("BlindAuction", {
  //   from: deployer,
  //   log: true,
  //   args: ["0x35cA1a4D9C91B79849ba674dD3e52CC9385F1479", "0x3022b8943dC2Cbe79e2799d1cc1A142527863117", 100000,false],
  // });
  const deployed = await deploy("Rentals", {
    from: deployer,
    log: true,
    args: ["0xC809880abC06c13Cdc6027E72D350c28032DDa55"],
  });

  console.log(`ConfidentialToken contract deployed at: ${deployed.address}`);
};

export default func;
func.id = "deploy_confidentialERC20";
func.tags = ["ConfidentialToken"];
