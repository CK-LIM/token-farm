pragma solidity ^0.5.0;

import "./XToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "X Token Farm";
    XToken public xToken;
    DaiToken public daiToken;
    address public owner;
    uint256 public stakingIndex = 0;
    address[] public stakers;
    uint256 public blockReward;
    uint256 public lastRewardBlock;
    uint256 internal xTokenBurnRate = 2;
    uint256 public constant duration = 2 days;
    uint256 public constant penaltyRate = 20;
    
    
    mapping(address => uint256) public stakingBalance;
    mapping(uint256 => StakeUser) public stake;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    struct StakeUser {
        uint256 id;
        uint256 balance;
        uint256 blocknumber;
        uint256 blocktimestamp;
        address staker;
        bool staked;
    }


    constructor(XToken _xToken, DaiToken _daiToken, uint256 _blockReward) public {
        xToken = _xToken;
        daiToken = _daiToken;
        blockReward = _blockReward;
        owner = msg.sender;
    }

    // Stakes Tokens
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        updateRewardTokens(blockReward);
        stakingIndex++;
        daiToken.transferFrom(msg.sender, address(this), _amount); // Stake dai token
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; //Update staking balance
        stakingTimestamp[msg.sender] = block.timestamp;
        lastRewardBlock = block.number;
        stake[stakingIndex] = StakeUser(
            stakingIndex,
            _amount,
            block.number,
            block.timestamp,
            msg.sender,
            true
        );

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

        xToken.transfer(msg.sender, _amount * xTokenBurnRate);
    }

    // Unstacking Tokens
    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");
        uint256 end = stakingTimestamp[msg.sender] + duration;
        require(block.timestamp >= end, "too early to withdraw Tokens");
        daiToken.transfer(msg.sender, balance); // Stake dai token
        xToken.transferFrom(msg.sender, address(this), balance); //return x token

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");

        // Only owner can call this function
        require(msg.sender == owner, "caller must be owner");
        uint256 totalBalance;

        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            totalBalance = balance + totalBalance;
        }

        // uint256 totalBalance = daiToken.balanceOf(address(this));

        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            uint256 ratio = (balance * 100) / totalBalance;
            uint256 amount = (_amount * ratio) / 100;

            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                xToken.transfer(recipient, totalamount * xTokenBurnRate);
            }
            lastRewardBlock = block.number;
        }
    }

    // Issuing Tokens for internal
    function updateRewardTokens(uint256 _amount) internal {
        require(_amount > 0, "amount cannot be 0");
        uint256 totalBalance;

        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient]; 
            totalBalance = balance + totalBalance;
        }

        if( totalBalance == 0){
            return;
        }
        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            uint256 ratio = (balance * 100) / totalBalance;
            uint256 amount = _amount * ratio / 100;
            
            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                xToken.transfer(recipient, totalamount * xTokenBurnRate);
            }
        }
        lastRewardBlock = block.number;
    }
    
    // Emergency Unstacking Tokens to withdraw LP tokens with penalty
    function emergencyUnstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");
        uint256 penalty = balance * penaltyRate/100;
        uint256 remainingBalance = balance - penalty;
        daiToken.transfer(msg.sender, remainingBalance); // Unstake dai token
        daiToken.transfer(address(this), penalty); // Unstake penalty dai token
        xToken.transferFrom(msg.sender, address(this), balance); //return x token

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }
}
