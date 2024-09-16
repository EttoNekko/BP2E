// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyMoney is ERC20, Ownable {
    address private moneyGenerator;

    event MoneyGeneratorChanged(address newMoneyGenerator);

    error UnauthorizedMoneyGenerator();

    modifier onlyMoneyGenerator() {
        if (msg.sender != moneyGenerator) revert UnauthorizedMoneyGenerator();
        _;
    }

    constructor() ERC20("MyMoney", "P2EC") Ownable(msg.sender) {}

    function setMoneyGenerator(address _moneyGenerator) public onlyOwner {
        moneyGenerator = _moneyGenerator;
        emit MoneyGeneratorChanged(moneyGenerator);
    }

    function mintMoney(address to, uint256 amount) public onlyMoneyGenerator {
        _mint(to, amount);
    }
}
