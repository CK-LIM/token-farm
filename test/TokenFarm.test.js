const { assert } = require('chai');
const { default: Web3 } = require('web3');

const DaiToken = artifacts.require("DaiToken");
const XToken = artifacts.require("XToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor, investor2]) => {
    let daiToken, xToken, tokenFarm

    before(async () => {
        daiToken = await DaiToken.new()
        xToken = await XToken.new()
        tokenFarm = await TokenFarm.new(xToken.address, daiToken.address, tokens('10'))

        await xToken.transfer(tokenFarm.address, tokens('1000000'))
        await daiToken.transfer(investor, tokens('100'), { from: owner })
        await daiToken.transfer(investor2, tokens('100'), { from: owner })
    })

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('X Token deployment', async () => {
        it('has a name', async () => {
            const name = await xToken.name()
            assert.equal(name, 'X Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'X Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await xToken.balanceOf(tokenFarm.address)
            assert.equal(balance, tokens('1000000'))
        })

        it('contract has tokens', async () => {
            let balance = await xToken.balanceOf(tokenFarm.address)
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Farming Token', async () => {
        it('rewards investors for staking mDAI tokens', async () => {
            let result
            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor has correct MDAI token before staking')
            result = await daiToken.balanceOf(investor2)
            assert.equal(result, tokens('100'), 'investor2 has correct MDAI token before staking')

            // Stake Mock DAI TOkens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            // Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result, tokens('0'), 'investor has 0 MDAI token after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result, tokens('100'), 'token Farm has 100 MDAI token after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result, tokens('100'), 'investor has 100 MDAI token staking balance after staking')

            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor X Token wallet balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor has staking status after staking')

             // Stake Mock DAI TOkens investor2         
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor2 })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor2 })
             // Check staking result investor2           
            result = await tokenFarm.stakingBalance(investor2)
            assert.equal(result, tokens('100'), 'investor2 has 100 MDAI token staking balance after staking')

            // Issue Tokens
            await tokenFarm.issueTokens(tokens('50'))
            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('125'), 'investor X Token wallet balance correct after issue tokens')

            result = await xToken.balanceOf(investor2)
            assert.equal(result, tokens('125'), 'investor2 X Token wallet balance correct after issue tokens')

            // Ensure that only owner can issue tokens
            await tokenFarm.issueTokens(tokens('100'), { from: investor }).should.be.rejected;

            //Unstake tokens
            await xToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.unstakeTokens({ from: investor })

            //Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor has correct MDAI token after withdraw')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result, tokens('100'), 'token Farm has 0 MDAI token after withdraw')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result, tokens('0'), 'investor has 0 MDAI token staking balance after withdraw')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor has false staking status after withdraw')

            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('25'), 'investor X Token wallet balance correct after unstake')

        })
    })
})