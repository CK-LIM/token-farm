const TokenFarm = artifacts.require('TokenFarm')

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

module.exports = async function (callback) {
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens(tokens('10'))
    // Code goes here...
    console.log("Tokens issued!")
    callback()
}