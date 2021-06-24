import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {

    render() {
        return (
            <div id="content" className="mt-3">
                <h2 className="table table-borderless text-muted text-center">Stake Token!</h2>
                <table className="table table-borderless text-muted text-center">
                    <thead>
                        <tr>
                            <th scope="col">Staking Balance</th>
                            <th scope="col">Reward Balance</th>
                            <th scope="col">Your Pool Share</th>  
                            <th scope="col">Block Reward</th> 
                            <th scope="col">Pool Total Staking Balance</th>                          
                            <th scope="col">Contract X Token Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} mDAI</td>
                            <td>{window.web3.utils.fromWei(this.props.xTokenBalance, 'Ether')} X</td>
                            <td>{this.props.poolShareRatio} %</td>
                            <td>{window.web3.utils.fromWei(this.props.farmInfo.blockReward, 'Ether')} mDAI</td>
                            <td>{window.web3.utils.fromWei(this.props.farmInfo.farmableSupply, 'Ether')} mDAI</td>
                            <td>{window.web3.utils.fromWei(this.props.xTokenBalance_farm, 'Ether')} TF.X</td>
                        </tr>
                    </tbody>
                </table>
                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let amount
                        amount = this.input.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        this.props.stakeTokens(amount)
                    }}>
                        <div>
                            <label className="float-left"><b>Stake Tokens</b></label>
                            <span className="float-right text-muted">
                                Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, 'Ether')}
                            </span>
                        </div>
                        <div className="input-group mb-4">
                            <input
                                type="text"
                                ref={(input) => { this.input = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={dai} height='32' alt="" />
                    &nbsp;&nbsp;&nbsp; mDAI
                  </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
                    </form>
                    <button
                        type="submit"
                        className="btn btn-link btn-block btn-sm"
                        onClick={(event) => {
                            event.preventDefault()
                            let amount
                            amount = window.web3.utils.fromWei(this.props.xTokenBalance, 'Ether')
                            amount = window.web3.utils.toWei(amount, 'Ether')
                            this.props.unstakeTokens(amount)
                        }}>
                        UN-STAKE...
              </button>
              <button
                        type="submit"
                        className="btn btn-link btn-block btn-sm"
                        onClick={(event) => {
                            event.preventDefault()
                            let amount
                            amount = window.web3.utils.fromWei(this.props.xTokenBalance, 'Ether')
                            amount = window.web3.utils.toWei(amount, 'Ether')
                            this.props.emergencyUnstakeTokens(amount)
                        }}>
                        EMERGENCY UN-STAKE...
              </button>
                </div>
            </div>
        );
    }
}

export default Main;
