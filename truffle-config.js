const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "4f60244fe0ed4c24976d4bedbaf22222";
//
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4,
      gas: 3000000,
      gasPrice: 20000000000,
      confirmations: 0,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    kovan: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://kovan.infura.io/v3/${infuraKey}`),
      network_id: 42,
      gas: 3000000,
      gasPrice: 20000000000,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
