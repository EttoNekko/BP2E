const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account: ' + deployer.address);
  //Deploy Money
  const Money = await ethers.getContractFactory('MyMoney');
  const money = await Money.deploy();

  // Deploy First
  const MoneyGenerator = await ethers.getContractFactory('MoneyGenerator');
  const moneyGenerator = await MoneyGenerator.deploy(await money.getAddress());
  let tx1 = await money.setMoneyGenerator(await moneyGenerator.getAddress());
  await tx1.wait();

  // Deploy Second
  const PieceGenerator = await ethers.getContractFactory('PieceGenerator');
  const pieceGenerator = await PieceGenerator.deploy(
    await moneyGenerator.getAddress(),
  );

  let tx2 = await moneyGenerator.setPieceGenerator(
    await pieceGenerator.getAddress(),
  );
  await tx2.wait();

  //Deploy randOracle
  const RandOracle = await ethers.getContractFactory('RandOracle');
  const randOracle = await RandOracle.deploy();
  let tx3 = await randOracle.addProvider(deployer.address);
  await tx3.wait();
  let tx4 = await pieceGenerator.setRandOracleAddress(
    await randOracle.getAddress(),
  );
  await tx4.wait();

  console.log('money: ' + (await money.getAddress()));
  console.log('moneyGenerator: ' + (await moneyGenerator.getAddress()));
  console.log('pieceGenerator: ' + (await pieceGenerator.getAddress()));
  console.log('randOracle: ' + (await randOracle.getAddress()));

  const boxInfo = {
    GOLD: 10,
    SILVER: 0,
    BRONZE: 0,
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
  console.log('box type count: ' + (await pieceGenerator.boxTypeCount()));
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
