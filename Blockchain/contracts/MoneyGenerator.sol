// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoneyGenerator is ERC721A("FreeMoneyEveryday", "FME"), Ownable {
    address private pieceGenerator;

    error NotPieceGenerator(address caller);

    modifier onlyPieceGenerator() {
        if(msg.sender != pieceGenerator) revert NotPieceGenerator(msg.sender);
        _;
    }

    constructor()
        Ownable(msg.sender)
    { }

    function _baseURI() internal pure override returns (string memory) {
        return "placeholder";
    }

    function setPieceGenerator(address _pieceGenerator) public onlyOwner {
        pieceGenerator = _pieceGenerator;
    }

    function safeMint(address to, uint256 quantity) public onlyPieceGenerator {
        _safeMint(to, quantity);
    }

    function generateMoney(address[] memory user) external onlyOwner {
        // base on the 721 token owned by each user, generate money everyday
        //will be called by the server side
    }
}
