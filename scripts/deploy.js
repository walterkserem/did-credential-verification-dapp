const { ethers } = require("hardhat");

async function main() {
  const [_, secondAccount] = await ethers.getSigners();

  const DIDRegistry = await ethers.getContractFactory("DIDRegistry", secondAccount);
  const did = await DIDRegistry.deploy();

  await did.waitForDeployment();

  console.log("Deployer:", await secondAccount.getAddress());
  console.log("DIDRegistry deployed to:", await did.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});