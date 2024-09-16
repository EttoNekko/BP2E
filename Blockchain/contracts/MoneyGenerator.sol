// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMoney {
    function mintMoney(address to, uint256 amount) external;
}

contract MoneyGenerator is ERC721A("FreeMoneyEveryday", "FME"), Ownable {
    address public pieceGenerator;
    IMoney public money;

    uint256 public moneyPerNFT = 21;

    event MoneyAddressChanged(address _money);

    event MoneyPerNFTChanged(uint256 amount);

    event BatchMoneyGenerated(address[] users, uint256[] amounts);

    error NotPieceGenerator(address caller);

    modifier onlyPieceGenerator() {
        if (msg.sender != pieceGenerator) revert NotPieceGenerator(msg.sender);
        _;
    }

    constructor(address moneyAddress) Ownable(msg.sender) {
        money = IMoney(moneyAddress);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "placeholder";
    }

    function changeMoneyAddress(address newMoneyAddress) public onlyOwner {
        money = IMoney(newMoneyAddress);
        emit MoneyAddressChanged(newMoneyAddress);
    }

    function setMoneyPerNFT(uint256 amount) public onlyOwner {
        moneyPerNFT = amount;
        emit MoneyPerNFTChanged(amount);
    }

    function setPieceGenerator(address _pieceGenerator) public onlyOwner {
        pieceGenerator = _pieceGenerator;
    }

    function safeMint(address to, uint256 quantity) public onlyPieceGenerator {
        _safeMint(to, quantity);
    }

    function generateBatchMoney(address[] memory users) external onlyOwner {
        // base on the 721 token owned by each user, generate money everyday
        //will be called by the server side
        uint256 usersize = users.length;
        uint256[] memory amounts = new uint256[](usersize);
        for (uint i = 0; i < usersize; ++i) {
            address person = users[i];
            uint256 NFTowned = balanceOf(person);
            uint256 amount = NFTowned * moneyPerNFT;
            money.mintMoney(person, amount);
            amounts[i] = amount;
        }
        emit BatchMoneyGenerated(users, amounts);
    }
}
