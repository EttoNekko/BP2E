const { ethers } = require('hardhat');

async function main() {
  console.log('begin test');

  const [deployer] = await ethers.getSigners();
  const pieceGenerator = await ethers.getContractAt(
    'PieceGenerator',
    '0x0003c599EC82cbf02625EE122a6185b4fa607B4d',
  );
  const randOracle = await ethers.getContractAt(
    'RandOracle',
    '0xC861fE0Cb59cC06A899a555881DdfEc6C8CFaB61',
  );

  const ownerGivePiecesTx = await pieceGenerator.ownerGivePieces(
    deployer.address,
    0,
    888,
    {
      nonce: await deployer.getNonce(),
    },
  );
  await ownerGivePiecesTx.wait();
  const ownerGiveStepsTx = await pieceGenerator.ownerGiveSteps(
    deployer.address,
    1000,
    {
      nonce: await deployer.getNonce(),
    },
  );
  await ownerGiveStepsTx.wait();
  console.log('done test');
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
