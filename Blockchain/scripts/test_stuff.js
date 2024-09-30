const { ethers } = require('hardhat');

async function main() {
  console.log('begin test');

  const [deployer, user] = await ethers.getSigners();
  const pieceGenerator = await ethers.getContractAt(
    'PieceGenerator',
    '0x0003c599EC82cbf02625EE122a6185b4fa607B4d',
  );
  const randOracle = await ethers.getContractAt(
    'RandOracle',
    '0xC861fE0Cb59cC06A899a555881DdfEc6C8CFaB61',
  );

  const boxInfo = {
    GOLD: 10,
    SILVER: 0,
    BRONZE: 0,
    price: ethers.parseEther('10'),
  };
  await pieceGenerator.addBoxType(boxInfo);
  await pieceGenerator.addBoxType({
    GOLD: 10,
    SILVER: 5,
    BRONZE: 0,
    price: ethers.parseEther('8.5'),
  });
  await pieceGenerator.addBoxType({
    GOLD: 0,
    SILVER: 10,
    BRONZE: 0,
    price: ethers.parseEther('7'),
  });
  await pieceGenerator.addBoxType({
    GOLD: 10,
    SILVER: 7,
    BRONZE: 4,
    price: ethers.parseEther('5'),
  });
  await pieceGenerator.addBoxType({
    GOLD: 10,
    SILVER: 8,
    BRONZE: 5,
    price: ethers.parseEther('3'),
  });
  await pieceGenerator.addBoxType({
    GOLD: 0,
    SILVER: 0,
    BRONZE: 10,
    price: ethers.parseEther('1.5'),
  });

  console.log('box type count: ' + (await pieceGenerator.boxTypeCount()));
  console.log('box type 1: ' + (await pieceGenerator.boxTypes(0)));
  console.log('box type 2: ' + (await pieceGenerator.boxTypes(1)));
  console.log('box type 3: ' + (await pieceGenerator.boxTypes(2)));
  console.log('box type 4: ' + (await pieceGenerator.boxTypes(3)));
  console.log('box type 5: ' + (await pieceGenerator.boxTypes(4)));
  console.log('box type 6: ' + (await pieceGenerator.boxTypes(5)));

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
  const userGivePiecesTx = await pieceGenerator.ownerGivePieces(
    user.address,
    1,
    777,
    {
      nonce: await deployer.getNonce(),
    },
  );
  await userGivePiecesTx.wait();
  const userrGiveStepsTx = await pieceGenerator.ownerGiveSteps(
    user.address,
    2000,
    {
      nonce: await deployer.getNonce(),
    },
  );
  await userrGiveStepsTx.wait();
  console.log('done test');
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
