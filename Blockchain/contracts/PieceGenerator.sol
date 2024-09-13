// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRandOracle {
    function requestRandomNumber(uint8 boxId) external returns (uint256);
}

interface IMoneyGenerator {
    function safeMint(address to, uint256 quantity) external;
}

/// @custom:security-contact placeholder
contract PieceGenerator is ERC1155, ERC1155Burnable, Ownable {
    struct BoxInfo {
        uint8 GOLD;
        uint8 SILVER;
        uint8 BRONZE;
        uint256 price;
    }
    uint8 public boxTypeCount;
    mapping(uint8 => BoxInfo) public boxTypes;
    mapping(address => mapping(uint8 => uint256)) public boxesOwned;

    uint8 public constant GOLD = 0;
    uint8 public constant SILVER = 1;
    uint8 public constant BRONZE = 2;
    
    uint8 public constant pieceTypes = 3;
    /// The pieces required to combine for 1 NFT of each type of piece
    /// pieceTypeRequired[0] is number of GOLD piece required
    /// pieceTypeRequired[1] is number of SILVER piece required
    /// pieceTypeRequired[2] is number of BRONZE piece required
    uint8[pieceTypes] pieceTypeRequired = [2, 3, 4];

    uint256 stepsRequired = 100;
    mapping(address => uint256) totalStepsRun;

    IMoneyGenerator private primeToken;

    IRandOracle private randOracle;
    mapping(uint256=>bool) requests;

    event OracleAddressChanged(address oracleAddress);

    event BoxTypeAdded(uint8 boxId);

    event BoxBought(address user, uint8 boxId);

    event BoxOpened(address user, uint8 boxId);

    event PieceGot(address user, uint8 pieceType, uint8 pieceAmount);

    event PieceCombined(address user, uint8 pieceType, uint256 NFTGot, uint256 piecesLeft);

    error RanNumReqInvalidOrFulfilled();

    error InvalidBoxId(uint8 boxId);

    error NotEnoughForBox(uint256 price, uint256 paid);

    error InvalidPieceType(uint8 pieceType);

    error NotEnoughPiecesForNFT(uint8 pieceType, uint256 NFTamount, uint256 piecesRequired);

    error NotEnoughStepsForNFT(uint256 totalStepsRun, uint256 amountRequired);

    modifier onlyRandOracle() {
        require(msg.sender == address(randOracle), "Unauthorized.");
        _;
    }

    constructor(address ERC721Address)
        ERC1155("placeholder")
        Ownable(msg.sender)
    {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function setPrimeToken(address ERC721Address) public onlyOwner {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    function addBoxType(BoxInfo memory boxInfo) public onlyOwner {
        boxInfo.GOLD = 9;
        boxTypes[boxTypeCount] = boxInfo;
        emit BoxTypeAdded(boxTypeCount++);
    }

    function buyBox(uint8 boxId) external payable {
        if(boxId >= boxTypeCount) revert InvalidBoxId(boxId);
        BoxInfo memory box = boxTypes[boxId];
        if(msg.value < box.price) revert NotEnoughForBox(box.price, msg.value);
        ++boxesOwned[msg.sender][boxId];
        emit BoxBought(msg.sender, boxId);
    }

    function setRandOracleAddress(address newAddress) external onlyOwner {
        randOracle = IRandOracle(newAddress);

        emit OracleAddressChanged(newAddress);
    }

    function openBox(uint8 boxId) external payable {
        require(randOracle != IRandOracle(address(0)), "Oracle not initialized.");

        uint256 id = randOracle.requestRandomNumber(boxId);
        requests[id] = true;

        emit BoxOpened(msg.sender, boxId);
    }

    function givePieces(address callerAddress, uint8 boxId, uint256 randomNumber, uint256 id) external onlyRandOracle {
        if(!requests[id]) revert RanNumReqInvalidOrFulfilled();
        delete requests[id];

        BoxInfo memory box = boxTypes[boxId];
        uint8 chances = uint8(randomNumber % 10);
        //each box type has different chance for 3 token types
        uint8 pieceGot;
        if(chances <= box.BRONZE) {
            pieceGot = BRONZE;
        } else if(chances <= box.SILVER) {
            pieceGot = SILVER;
        } else {
            pieceGot = GOLD;
        }
        _mint(callerAddress, pieceGot, 1, '');
        emit PieceGot(callerAddress, pieceGot, 1);
    }


    function combinePieces(uint8 pieceType, uint256 amount) external {
        //check if enough tokens
        if(pieceType >= pieceTypes) revert InvalidPieceType(pieceType);

        uint256 pieceOwned = balanceOf(msg.sender, pieceType);
        //each token types has different amount to turn into ERC721
        uint256 piecesRequired = pieceTypeRequired[pieceType] * amount;
        if(pieceOwned < piecesRequired) revert NotEnoughPiecesForNFT(pieceType, amount, piecesRequired);

        //check if enough steps
        uint256 userStepRun = totalStepsRun[msg.sender];
        if(userStepRun < stepsRequired) revert NotEnoughStepsForNFT(userStepRun, stepsRequired);

        //if enough burn piece and reduce step
        _burn(msg.sender, pieceType, piecesRequired);
        totalStepsRun[msg.sender] -= stepsRequired;
        primeToken.safeMint(msg.sender, amount);

        emit PieceCombined(msg.sender, pieceType, amount, pieceOwned - piecesRequired);
    }

    function checkOwnSteps() external view returns (uint256){
        return totalStepsRun[msg.sender];
    }

    function checkUserSteps(address user) external view onlyOwner returns (uint256){
        return totalStepsRun[user];
    }
}
