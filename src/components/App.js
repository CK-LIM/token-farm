import Web3 from 'web3'
import React, { Component } from 'react'
import Navbar from './Navbar'
import DaiToken from '../abis/DaiToken.json'
import XToken from '../abis/XToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    console.log(window.web3)
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)

    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    console.log(networkId)

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    console.log(daiTokenData)
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      console.log({ balance: daiTokenBalance })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load XToken
    const xTokenData = XToken.networks[networkId]
    console.log(xTokenData)
    if (xTokenData) {
      const xToken = new web3.eth.Contract(XToken.abi, xTokenData.address)
      this.setState({ xToken })
      let xTokenBalance = await xToken.methods.balanceOf(this.state.account).call()
      const tokenFarmData = TokenFarm.networks[networkId]
      let xTokenBalance_farm = await xToken.methods.balanceOf(tokenFarmData.address).call()
      this.setState({ xTokenBalance: xTokenBalance.toString() })
      this.setState({ xTokenBalance_farm: xTokenBalance_farm.toString() })
      console.log({ balance: xTokenBalance })
      console.log({ balance_farm: xTokenBalance_farm })
    } else {
      window.alert('XToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    console.log(tokenFarmData)
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
      console.log({ balance: stakingBalance })

      let poolShareRatio = await tokenFarm.methods.poolShareRatio(this.state.account).call()
      this.setState({ poolShareRatio: poolShareRatio.toString() })
      console.log({ poolShareRatio: poolShareRatio })

      let farmInfo = await tokenFarm.methods.farmInfo().call()
      this.setState({ farmInfo: farmInfo})
      console.log({ farmInfo: farmInfo })

      let stakingIndex = await tokenFarm.methods.stakingIndex().call()
      this.setState({ stakingIndex: stakingIndex.toString() })
      console.log({ stakingIndex: stakingIndex })

      // let farmableSupply = await tokenFarm.methods.farmInfo().call()
      // this.setState({ farmableSupply: farmableSupply.toString() })
      // console.log({ farmableSupply: farmableSupply })

      //Load stake
      // for (var i = 1; i <= stakingIndex; i++) {
      //   let stake = await tokenFarm.methods.stake(i).call()
      //   this.setState({stake: stake.toString()})
      //   console.log({stake: stake})
      // }


    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // Request account access if needed
      await window.ethereum.enable();
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    // Non-dapp browsers...
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.xToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  emergencyUnstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.xToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.emergencyUnstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      xToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      xTokenBalance: '0',
      xTokenBalance_farm: '0',
      stakingBalance: '0',
      poolShareRatio:'0',
      farmInfo: '0',
      loading: true
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        xTokenBalance={this.state.xTokenBalance}
        xTokenBalance_farm={this.state.xTokenBalance_farm}
        stakingBalance={this.state.stakingBalance}
        poolShareRatio={this.state.poolShareRatio}
        farmInfo={this.state.farmInfo}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        emergencyUnstakeTokens={this.emergencyUnstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px' }}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
