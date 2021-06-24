pragma solidity ^0.5.0;

import "./XToken.sol";
import "./DaiToken.sol";

contract TokenFarm_ori {
    string public name = "X Token Farm";
    XToken public xToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(XToken _xToken, DaiToken _daiToken) public {
        xToken = _xToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stakes Tokens
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");

        daiToken.transferFrom(msg.sender, address(this), _amount); // Stake dai token
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; //Update staking balance

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstacking Tokens
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        require(balance >0,"staking balance cannot be 0");
        daiToken.transfer(msg.sender, balance); // Stake dai token

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueTokens() public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be owner");
        
        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            if(balance > 0){
                xToken.transfer(recipient, balance);    
            }
        }
    }
}
