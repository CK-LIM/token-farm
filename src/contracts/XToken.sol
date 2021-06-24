pragma solidity ^0.5.0;

contract XToken {
    string  public name = "X Token";
    string  public symbol = "X";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens
    uint8   public decimals = 18;
    uint256 private minimumSupply = 20000 * (10 ** 18);
    address public owner;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        uint256 partialBurnValue = _partialBurn(_value, msg.sender);
        balanceOf[msg.sender] -= partialBurnValue;
        balanceOf[_to] += partialBurnValue;

        emit Transfer(msg.sender, _to, partialBurnValue);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        uint256 partialBurnValue = _partialBurn(_value, _from);
        balanceOf[_from] -= partialBurnValue;
        balanceOf[_to] += partialBurnValue;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function burn(address _account, uint256 _amount) private {
 //       require(msg.sender == owner, "not owner");
        require(_account != address(0), "ERC20: burn from the zero address");

        balanceOf[_account] -= _amount;
        totalSupply -= _amount;
        emit Transfer(_account, address(0), _amount);
    }

    function _partialBurn(uint256 _amount, address _from) internal returns (uint256) {
        uint256 transferAmount = 0;
        uint256 burnAmount = _calculateBurnAmount(_amount);

        if (burnAmount > 0) {
            burn(_from, burnAmount);
        }
        transferAmount = _amount - burnAmount;

        return transferAmount;
    }

    function _calculateBurnAmount(uint256 _amount) internal view returns (uint256) {
        uint256 burnAmount = 0;

        // burn amount calculations
        if (totalSupply > minimumSupply) {
            burnAmount = _amount/2;
            uint256 availableBurn = totalSupply - minimumSupply;
            if (burnAmount > availableBurn) {
                burnAmount = availableBurn;
            }
        }
        return burnAmount;
    }
}