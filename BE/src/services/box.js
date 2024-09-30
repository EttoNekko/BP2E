const ethers = require('ethers');
// require('dotenv').config();
const Box = require('../models/box');
const pieceGeneratorAbi = require('../contracts/PieceGeneratorAbi');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.Owner_PRIVATE_KEY, provider);

const pieceGenerator = new ethers.Contract(
  process.env.pieceGenerator_Address,
  pieceGeneratorAbi,
  signer,
);
console.log('set box data service');
pieceGenerator.on('BoxTypeAdded', async (boxId) => {
  console.log(`new box id=${boxId}`);
  const { GOLD, SILVER, BRONZE, price } = await pieceGenerator.boxTypes(boxId);
  const box = {
    boxId: boxId,
    goldChance: GOLD,
    silverChance: SILVER,
    bronzeChance: BRONZE,
    price: ethers.utils.formatEther(price),
  };
  const result = await Box.findOneAndUpdate({ boxId: box.boxId }, box, {
    new: true,
    upsert: true,
  });
  console.log(result);
});
