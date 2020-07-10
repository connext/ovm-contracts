pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DolphinCoin is ERC20 {
    uint8 public constant DECIMALS = 18;

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(uint256 _supply) public {
        _mint(msg.sender, _supply);
    }

    function drip(uint256 _drop) public {
        _mint(msg.sender, _drop);
    }
}
