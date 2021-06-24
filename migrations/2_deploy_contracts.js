const DaiToken = artifacts.require("DaiToken");
const XToken = artifacts.require("XToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts ) {
  // Deploy Mock Dai Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  //Deploy XToken
  await deployer.deploy(XToken)
  const xToken = await XToken.deployed()
 
  //Deploy TokenFarm
  await deployer.deploy(TokenFarm, xToken.address, daiToken.address, '10000000000000000000');
  const tokenFarm = await TokenFarm.deployed()
  
  // Transfer all tokens to TokenFarm (1million)
  await xToken.transfer(tokenFarm.address, '500000000000000000000000')

  // Transfer 100 Mock DAI tokens to TokenFarm
  await daiToken.transfer(tokenFarm.address, '10000000000000000000000')
  await daiToken.transfer(accounts[1], '10000000000000000000000')
  await daiToken.transfer(accounts[2], '100000000000000000000')
  await daiToken.transfer(accounts[3], '100000000000000000000')
  
};
