const ethers = require('ethers');
require('dotenv').config();
const pieceGeneratorAbi = require('../contracts/PieceGeneratorAbi');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.Owner_PRIVATE_KEY, provider);

const pieceGenerator = new ethers.Contract(
  process.env.pieceGenerator_Address,
  pieceGeneratorAbi,
  signer,
);
const main = async () => {
  // const { GOLD, SILVER, BRONZE, price } = await pieceGenerator.boxTypes(0);
  // console.log(GOLD, SILVER, BRONZE, price);
  console.log(new Date().toISOString().split('T')[0]);
};
main();
