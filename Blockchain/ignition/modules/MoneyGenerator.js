require('dotenv').config;
const {
  buildModule,
} = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('MoneyGenerator', (m) => {
  const moneyGenerator = m.contract('MoneyGenerator');
  return { moneyGenerator };
});
