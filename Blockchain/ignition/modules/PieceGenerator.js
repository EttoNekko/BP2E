require('dotenv').config;
const {
  buildModule,
} = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('PieceGenerator', (m) => {
  const pieceGenerator = m.contract('PieceGenerator', [
    process.env.MoneyGenerator_Address,
  ]);
  return { pieceGenerator };
});
