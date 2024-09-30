const ethers = require('ethers');
// require('dotenv').config();
// const pieceGeneratorAbi = require('../contracts/PieceGeneratorAbi');
const randOracleAbi = require('../contracts/RandOracleAbi');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.Owner_PRIVATE_KEY, provider);

// const pieceGenerator = new ethers.Contract(
//   process.env.pieceGenerator_Address,
//   pieceGeneratorAbi,
//   signer,
// );

const randOracle = new ethers.Contract(
  process.env.randOracle_Address,
  randOracleAbi,
  signer,
);
console.log('set randnum service');
randOracle.on('RandomNumberRequested', async (from, id) => {
  console.log({ from, id });
  const ranNum = Math.floor(Math.random() * 1000);
  console.log(ranNum);
  // let estimateGas = await randOracle.estimateGas.returnRandomNumber(
  //   id,
  //   boxType,
  //   ranNum,
  //   from,
  //   user,
  // );
  let returnRanTx = await randOracle.returnRandomNumber(
    from,
    id,
    ranNum,

    {
      // gasPrice: estimateGas,
      nonce: await signer.getTransactionCount(),
    },
  );
  await returnRanTx.wait();
  console.log('done');
});
