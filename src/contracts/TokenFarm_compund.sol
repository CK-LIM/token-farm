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
    uint256 internal tokenBurnRate = 2;
    uint256 public constant duration = 1 days;
    uint256 public constant penaltyRate = 20;
    FarmInfo public farmInfo;   
    
    mapping(address => uint256) public stakingBalance;
    // mapping(uint256 => StakeUser) public stake;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    mapping(address => uint256) public poolShareRatio;

    // struct StakeUser {
    //     uint256 id;
    //     uint256 balance;
    //     uint256 blocknumber;
    //     uint256 blocktimestamp;
    //     address staker;
    //     bool staked;
    // }
    
    struct FarmInfo {
        uint256 blockReward;
        uint256 lastRewardBlock;  // Last block number that reward distribution occurs.
        uint256 farmableSupply; // set in init, total amount of tokens farmable
    }


    constructor(XToken _xToken, DaiToken _daiToken, uint256 _blockReward) public {
        xToken = _xToken;
        daiToken = _daiToken;
        farmInfo.blockReward = _blockReward;
        owner = msg.sender;
    }

    // Stakes Tokens
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        updateRewardTokens(farmInfo.blockReward);
        stakingIndex++;
        daiToken.transferFrom(msg.sender, address(this), _amount); // Stake dai token
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; //Update staking balance
        stakingTimestamp[msg.sender] = block.timestamp;
        farmInfo.lastRewardBlock = block.number;
        // stake[stakingIndex] = StakeUser(
        //     stakingIndex,
        //     _amount,
        //     block.number,
        //     block.timestamp,
        //     msg.sender,
        //     true
        // );

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

        xToken.transfer(msg.sender, _amount * tokenBurnRate);
        getTotalBalance();
        getPoolShareRatio();
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
        getTotalBalance();
        getPoolShareRatio();
    }

    // Issuing Tokens
    function issueTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");

        // Only owner can call this function
        require(msg.sender == owner, "caller must be owner");
        getTotalBalance();

        // uint256 totalBalance = daiToken.balanceOf(address(this));

        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            uint256 ratio = (balance * 100) / farmInfo.farmableSupply;
            uint256 amount = (_amount * ratio) / 100;

            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - farmInfo.lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                stakingBalance[recipient] = stakingBalance[recipient] + totalamount; //Update staking balance
                xToken.transfer(recipient, _amount * tokenBurnRate);
            }
        }
        farmInfo.lastRewardBlock = block.number;
    }

    // Issuing Tokens for internal
    function updateRewardTokens(uint256 _amount) internal {
        require(_amount > 0, "amount cannot be 0");
        getTotalBalance();


        if( farmInfo.farmableSupply == 0){
            return;
        }
        //update reward tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            uint256 ratio = (balance * 100) / farmInfo.farmableSupply;
            uint256 amount = _amount * ratio / 100;
            
            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - farmInfo.lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                stakingBalance[recipient] = stakingBalance[recipient] + totalamount; //Update staking balance
                xToken.transfer(recipient, totalamount * tokenBurnRate);
            }
        }
        farmInfo.lastRewardBlock = block.number;
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
        getTotalBalance();
        getPoolShareRatio();
    }
    
    function getTotalBalance() public {
        uint256 totalBalance;
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            totalBalance = balance + totalBalance;
        }
        farmInfo.farmableSupply = totalBalance;
    }
    function getPoolShareRatio() public {
        if( farmInfo.farmableSupply == 0){
            for (uint256 i = 0; i < stakers.length; i++) {
                address recipient = stakers[i];
                poolShareRatio[recipient] = 0;
            }
        }
        else {
            for (uint256 i = 0; i < stakers.length; i++) {
                address recipient = stakers[i];
                uint256 balance = stakingBalance[recipient];
                uint256 ratio = (balance * 100) / farmInfo.farmableSupply;
                poolShareRatio[recipient] = ratio;
            }
        }
    }
}