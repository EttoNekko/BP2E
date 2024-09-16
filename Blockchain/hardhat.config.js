require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.24',
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
      accounts:
        // {
        //   mnemonic:
        //     'test test test test test test test test test test test junk',
        //   initialIndex: 0,
        //   path: "m/44'/60'/0'/0",
        //   count: 10,
        //   accountsBalance: '10000000000000000000000',
        //   passphrase: '',
        // },
        [
          {
            privateKey: process.env.ACC1_PRIVATE_KEY,
            balance: '10000000000000000000000',
          },
          {
            privateKey: process.env.ACC2_PRIVATE_KEY,
            balance: '10000000000000000000000',
          },
        ],
    },
  },
};
