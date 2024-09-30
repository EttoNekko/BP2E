const { artifacts } = require('hardhat');
const { writeFile, writeFileSync } = require('fs');
const { resolve } = require('path');

async function extractAbi(path, contractName, moduleExport) {
  const pathTofile = resolve(__dirname, `../../${path}/${contractName}Abi.js`);
  console.log(`extract ${contractName}Abi to ${path}`);

  const contract = await artifacts.readArtifact(`${contractName}`);
  const { abi } = contract;
  writeFileSync(pathTofile, moduleExport);
  writeFileSync(
    pathTofile,
    JSON.stringify(abi, null, 2).replace(/"([^"]+)":/g, '$1:'),
    {
      flag: 'a',
    },
  );
  console.log('done');
}

async function main() {
  const BE = 'BE/src/contracts';
  await extractAbi(BE, 'MyMoney', 'module.exports = ');
  await extractAbi(BE, 'MoneyGenerator', 'module.exports = ');
  await extractAbi(BE, 'PieceGenerator', 'module.exports = ');
  await extractAbi(BE, 'RandOracle', 'module.exports = ');

  const FE = 'FE/src/Blockchain/contracts/Abi';
  await extractAbi(FE, 'MyMoney', 'export default ');
  await extractAbi(FE, 'MoneyGenerator', 'export default ');
  await extractAbi(FE, 'PieceGenerator', 'export default ');
  await extractAbi(FE, 'RandOracle', 'export default ');

  // const pathToBEoracleAbi = resolve(
  //   __dirname,
  //   '../../BE/src/contracts/RandOracle.js',
  // );
  // console.log(pathToBEAbi);

  // const randOracle = await artifacts.readArtifact('RandOracle');
  // const { abi: randOracleAbi } = randOracle;
  // writeFileSync(pathToBEoracleAbi, 'module.exports = ');
  // console.log('write first done');
  // writeFileSync(
  //   pathToBEoracleAbi,
  //   JSON.stringify(randOracleAbi, null, 2).replace(/"([^"]+)":/g, '$1:'),
  //   {
  //     flag: 'a',
  //   },
  // );
  // console.log('write second done');
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
