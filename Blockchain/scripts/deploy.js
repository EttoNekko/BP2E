const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    'Deploying contracts with the account: ' + deployer.address
  );

  // Deploy First
  const MoneyGenerator = await ethers.getContractFactory(
    'MoneyGenerator'
  );
  const moneyGenerator = await MoneyGenerator.deploy();

  // Deploy Second
  const PieceGenerator = await ethers.getContractFactory(
    'PieceGenerator'
  );
  const pieceGenerator = await PieceGenerator.deploy(
    await moneyGenerator.getAddress()
  );

  await moneyGenerator.setPieceGenerator(
    await pieceGenerator.getAddress()
  );

  console.log(
    'moneyGenerator: ' + (await moneyGenerator.getAddress())
  );
  console.log(
    'pieceGenerator: ' + (await pieceGenerator.getAddress())
  );

  const boxInfo = {
    GOLD: 9,
    SILVER: 8,
    BRONZE: 5,
    price: ethers.parseEther('5'),
  };

  await pieceGenerator.addBoxType(boxInfo);
  await pieceGenerator.addBoxType({
    ...boxInfo,
    SILVER: 7,
    BRONZE: 4,
    price: ethers.parseEther('3'),
  });
  await pieceGenerator.addBoxType({
    ...boxInfo,
    SILVER: 7,
    BRONZE: 3,
    price: ethers.parseEther('1'),
  });
  console.log(
    'box type count: ' + (await pieceGenerator.boxTypeCount())
  );
  console.log('box type 1: ' + (await pieceGenerator.boxTypes(0)));
  console.log('box type 2: ' + (await pieceGenerator.boxTypes(1)));
  console.log('box type 3: ' + (await pieceGenerator.boxTypes(2)));
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//npx hardhat run scripts/deploy.js --network localhost
