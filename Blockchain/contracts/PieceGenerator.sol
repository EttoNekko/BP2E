// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRandOracle {
    function requestRandomNumber() external returns (uint256);
}

interface IMoneyGenerator {
    function safeMint(address to, uint256 quantity) external;
}

/// @custom:security-contact placeholder
contract PieceGenerator is ERC1155, ERC1155Burnable, Ownable {
    struct RandNumRequest {
        address user;
        uint8 boxId;
        bool real;
    }

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
    uint8[pieceTypes] public pieceTypeRequired = [2, 3, 4];

    uint256 stepsRequired = 100;
    mapping(address => uint256) public totalStepsRun;

    IMoneyGenerator private primeToken;

    IRandOracle private randOracle;
    mapping(uint256 => RandNumRequest) randNumRequests;

    event OracleAddressChanged(address oracleAddress);

    event stepRequiredChanged(uint256 amount);

    event stepsAdded(address[] user, uint256[] steps);

    event BoxTypeAdded(uint8 boxId);

    event BoxTypeChanged(uint8 boxId);

    event BoxBought(address user, uint8 boxId);

    event BoxOpened(address user, uint8 boxId);

    event PieceGot(address user, uint8 pieceType, uint8 pieceAmount);

    event PieceCombined(address user, uint8 pieceType, uint256 NFTGot, uint256 piecesLeft);

    error OracleNotInitialized();

    error UnauthorizedOracle();

    error InvalidBoxInfo();

    error RanNumReqInvalidOrFulfilled();

    error InvalidBoxId(uint8 boxId);

    error NotEnoughForBox(uint256 price, uint256 paid);

    error BoxNotEnough(uint8 boxId);

    error InvalidPieceType(uint8 pieceType);

    error InvalidAmount(uint256 amount);

    error NotEnoughPiecesForNFTs(uint8 pieceType, uint256 NFTamount, uint256 piecesRequired);

    error NotEnoughStepsForNFTs(uint256 totalStepsRun, uint256 amountRequired);

    modifier onlyRandOracle() {
        if (msg.sender != address(randOracle)) revert OracleNotInitialized();
        _;
    }

    modifier validPieceType(uint8 pieceType) {
        if (pieceType >= pieceTypes) revert InvalidPieceType(pieceType);
        _;
    }

    modifier validBoxInfo(BoxInfo memory boxInfo) {
        if (boxInfo.GOLD > 10 || boxInfo.SILVER > 10 || boxInfo.BRONZE > 10)
            revert InvalidBoxInfo();
        if (boxInfo.GOLD == 0 && boxInfo.SILVER == 0 && boxInfo.BRONZE == 0)
            revert InvalidBoxInfo();
        if (boxInfo.GOLD <= boxInfo.SILVER && boxInfo.GOLD != 0) revert InvalidBoxInfo();
        if (boxInfo.SILVER <= boxInfo.BRONZE && boxInfo.SILVER != 0) revert InvalidBoxInfo();
        _;
    }

    modifier validBoxId(uint8 boxId) {
        if (boxId >= boxTypeCount) revert InvalidBoxId(boxId);
        _;
    }

    constructor(address ERC721Address) ERC1155("placeholder") Ownable(msg.sender) {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    function setRandOracleAddress(address newAddress) external onlyOwner {
        randOracle = IRandOracle(newAddress);
        emit OracleAddressChanged(newAddress);
    }

    function setPrimeToken(address ERC721Address) public onlyOwner {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    function setPieceRequired(
        uint8 pieceType,
        uint8 amount
    ) public onlyOwner validPieceType(pieceType) {
        pieceTypeRequired[pieceType] = amount;
    }

    function setStepRequired(uint256 amount) public onlyOwner {
        stepsRequired = amount;
        emit stepRequiredChanged(amount);
    }

    function addBatchSteps(address[] memory users, uint256[] memory steps) public onlyOwner {
        for (uint i = 0; i < users.length; ++i) {
            address person = users[i];
            uint256 step = steps[i];
            totalStepsRun[person] += step;
        }
        emit stepsAdded(users, steps);
    }

    function addBoxType(BoxInfo memory boxInfo) public onlyOwner validBoxInfo(boxInfo) {
        boxInfo.GOLD = 10;
        boxTypes[boxTypeCount] = boxInfo;
        emit BoxTypeAdded(boxTypeCount++);
    }

    function setBoxType(
        uint8 boxId,
        BoxInfo memory boxInfo
    ) public onlyOwner validBoxId(boxId) validBoxInfo(boxInfo) {
        boxTypes[boxId] = boxInfo;
        emit BoxTypeChanged(boxId);
    }

    function buyBox(uint8 boxId) external payable validBoxId(boxId) {
        BoxInfo memory box = boxTypes[boxId];
        if (msg.value < box.price) revert NotEnoughForBox(box.price, msg.value);
        ++boxesOwned[msg.sender][boxId];
        emit BoxBought(msg.sender, boxId);
    }

    function openBox(uint8 boxId) external validBoxId(boxId) {
        if (randOracle == IRandOracle(address(0))) revert OracleNotInitialized();
        if (boxesOwned[msg.sender][boxId] == 0) revert BoxNotEnough(boxId);

        uint256 id = randOracle.requestRandomNumber();
        randNumRequests[id].user = msg.sender;
        randNumRequests[id].boxId = boxId;
        randNumRequests[id].real = true;
        --boxesOwned[msg.sender][boxId];

        emit BoxOpened(msg.sender, boxId);
    }

    function givePieces(uint256 randomNumber, uint256 id) external onlyRandOracle {
        if (!randNumRequests[id].real) revert RanNumReqInvalidOrFulfilled();
        address user = randNumRequests[id].user;
        uint8 boxId = randNumRequests[id].boxId;

        BoxInfo memory box = boxTypes[boxId];
        uint8 chances = uint8(randomNumber % 10) + 1;
        //each box type has different chance for 3 token types
        uint8 pieceGot;
        if (chances <= box.BRONZE) {
            pieceGot = BRONZE;
        } else if (chances <= box.SILVER) {
            pieceGot = SILVER;
        } else if (chances <= box.GOLD) {
            pieceGot = GOLD;
        }
        _mint(user, pieceGot, 1, "");
        emit PieceGot(user, pieceGot, 1);
        delete randNumRequests[id];
    }

    function combinePieces(uint8 pieceType, uint256 amount) external validPieceType(pieceType) {
        if (amount <= 0) revert InvalidAmount(amount);
        //check if enough tokens
        uint256 pieceOwned = balanceOf(msg.sender, pieceType);
        //each token types has different amount to turn into ERC721
        uint256 piecesRequired = pieceTypeRequired[pieceType] * amount;
        if (pieceOwned < piecesRequired)
            revert NotEnoughPiecesForNFTs(pieceType, amount, piecesRequired);

        //check if enough steps
        uint256 userStepRun = totalStepsRun[msg.sender];
        uint256 stepsNeeded = stepsRequired * amount;
        if (userStepRun < stepsNeeded) revert NotEnoughStepsForNFTs(userStepRun, stepsNeeded);

        //if enough burn piece and reduce step
        _burn(msg.sender, pieceType, piecesRequired);
        totalStepsRun[msg.sender] -= stepsNeeded;
        primeToken.safeMint(msg.sender, amount);

        emit PieceCombined(msg.sender, pieceType, amount, pieceOwned - piecesRequired);
    }

    function checkOwnSteps() external view returns (uint256) {
        return totalStepsRun[msg.sender];
    }

    function checkUserSteps(address user) external view onlyOwner returns (uint256) {
        return totalStepsRun[user];
    }

    //dev function used for testing only
    function ownerGivePieces(address user, uint256 id, uint256 amount) public onlyOwner {
        _mint(user, id, amount, "");
    }

    function ownerGiveSteps(address user, uint256 steps) public onlyOwner {
        totalStepsRun[user] += steps;
    }

    function ownerSetSteps(address user, uint256 steps) public onlyOwner {
        totalStepsRun[user] = steps;
    }
}
