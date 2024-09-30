// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title connect to a random number oracle contract to request random number
interface IRandOracle {
    /// request random number from the oracle
    /// @return _ generated request id
    function requestRandomNumber() external returns (uint256);
}

/// @title connect to a money generator (ERC721) contract to transform pieces into NFT
interface IMoneyGenerator {
    /// generate NFT for user
    /// @param to the adress of the user
    /// @param quantity how many NFT to mint at once
    function safeMint(address to, uint256 quantity) external;
}

/// @title Contract for managing and generating ERC1155 pieces
/// @dev this contract should be connected to a random number Oracle and a money generator (ERC721) contract
contract PieceGenerator is ERC1155, ERC1155Burnable, Ownable {
    /// represent a random number request from this contract
    /// @dev contain which user make the request and for what box type, as well as a boolean to check
    /// @dev if this request is valid
    struct RandNumRequest {
        address user;
        uint8 boxId;
        bool real;
    }

    /// contain the info of a box type such as:
    /// the chances of getting each piece in the box as well the price of the box
    /// the price is in Wei
    /// @dev for simplicity, the valid number representing the chances of each piece are from 1 to 10, with 0 means that this piece type cant be obtained in this box
    /// @dev the chance for bronze piece have to be smaller than silver, whose chance should be smaller than gold
    struct BoxInfo {
        uint8 GOLD;
        uint8 SILVER;
        uint8 BRONZE;
        uint256 price;
    }

    /// the number of different types of boxes in the contract
    /// @dev new box type can be added by owner
    uint8 public boxTypeCount;

    /// store the info of each box based on its box id
    /// @dev new box will get id starting from 0 and so on, based on the order of getting created
    mapping(uint8 => BoxInfo) public boxTypes;

    /// map the amount of each type of boxes an address owned
    mapping(address => mapping(uint8 => uint256)) public boxesOwned;

    /// the number of piece types this contract will use
    /// @dev unchangable, for simplicity only allow the usage of 3 id of ERC1155
    uint8 public constant pieceTypes = 3;

    /// the constant ids of 3 ERC1155 pieces that will be used in this contract
    uint8 public constant GOLD = 0;
    uint8 public constant SILVER = 1;
    uint8 public constant BRONZE = 2;

    /// The amount of pieces required to combine into 1 NFT for each type of piece
    /// pieceTypeRequired[0] is number of GOLD piece required
    /// pieceTypeRequired[1] is number of SILVER piece required
    /// pieceTypeRequired[2] is number of BRONZE piece required
    /// @dev the amount required can be changed by owner
    uint8[pieceTypes] public pieceTypeRequired = [2, 3, 4];

    /// Number of steps run required to turn into 1 NFT
    /// @dev can be changed by owner
    uint256 public stepsRequired = 100;

    /// the total steps an address have.
    /// is reduced when an address use its total steps to make NFTs
    /// @dev the steps run each day by users should be manually added by owner
    mapping(address => uint256) public totalStepsRun;

    /// @dev to use the money generator contract method
    IMoneyGenerator private primeToken;

    /// @dev to request random number from the oracle
    IRandOracle private randOracle;

    /// @dev when request random number, the oracle will return a pseudo-random request id
    /// @dev each id can be used to map to the request info made in this contract
    /// @dev delete the id in this mapping after the request resolve, to avoid (low chances) duplicate request id
    mapping(uint256 => RandNumRequest) private randNumRequests;

    /// emit when random number oracle address changed
    /// @param oracleAddress the new oracle address
    event OracleAddressChanged(address oracleAddress);

    /// emit when steps requifred for 1 NFT changed
    /// @param amount the new amount of step required
    event stepRequiredChanged(uint256 amount);

    /// emit when steps added for users
    /// @param user an array of users
    /// @param steps an array of steps corresponding to each user in the array
    event stepsAdded(address[] user, uint256[] steps);

    /// emit when a new box type is added
    /// @param boxId the id of the new box type added
    event BoxTypeAdded(uint8 boxId);

    /// emit when an info of a box type is changed
    /// @param boxId the id of the box type changed
    event BoxTypeChanged(uint8 boxId);

    /// emit when a box is bought
    /// @param user address of the user who buy the box
    /// @param boxId the id of the box Type being bought
    event BoxBought(address user, uint8 boxId);

    /// emit when a box is open
    /// @param user address of the user who open the box
    /// @param boxId the id of the box Type being opened
    /// @dev this event mark the start of requesting random number from the oracle
    event BoxOpened(address user, uint8 boxId);

    /// emit when an user got a piece
    /// @param user address of the user who got piece
    /// @param pieceType the type of piece user get
    /// @param pieceAmount how many pieces of that specific type user get
    /// @dev for simplicity, any box type will only give 1 of any piece type
    /// @dev this event mark the return of a random number by the oracle contract
    event PieceGot(address user, uint8 pieceType, uint8 pieceAmount);

    /// emit when user turn pieces into NFT
    /// user can only turn one type of piece into NFTs at a time
    /// @param user address of the user who do the combining piece to NFT
    /// @param pieceType the type of piece the user use
    /// @param NFTGot how many NFT the user get
    /// @param piecesLeft how many pieces of a specific type the user has left
    event PieceCombined(address user, uint8 pieceType, uint256 NFTGot, uint256 piecesLeft);

    /// revert of the random number oracle is not set
    error OracleNotInitialized();

    /// revert if unauthorized entity accessing the methods only authorized oracle could use
    error UnauthorizedOracle();

    /// revert if the box info for new box is invalid
    /// @dev only use to notify the owner if the input is incorrect
    error InvalidBoxInfo();

    /// revert if the random number request's id is invalid or already fufilled and therefore deleted
    error RanNumReqInvalidOrFulfilled();

    /// revert if the box id is invalid
    /// @param boxId the invalid box id
    error InvalidBoxId(uint8 boxId);

    /// revert if the user doesnt pay enough for a specific box
    /// @param price the price of the box
    /// @param paid the amount user is using
    error NotEnoughForBox(uint256 price, uint256 paid);

    /// revert if user dont have box to open
    /// @param boxId the id of box user is opening
    error BoxNotEnough(uint8 boxId);

    /// revert if piece type is invalid
    /// @param pieceType the id of the piece type
    /// @dev for simplicity, only piece id of 0, 1, 2 is valid
    error InvalidPieceType(uint8 pieceType);

    /// revert if the amount of NFTs is invalid
    /// @param amount the amount of NFTs the user is trying to make
    /// @dev this error only happen if user input amount is <= 0
    error InvalidAmount(uint256 amount);

    /// revert if not enough pieces for NFTs
    /// @param pieceType the id of the piece type used for combining
    /// @param NFTamount the amount of NFT user want to make
    /// @param piecesRequired the amount of pieces needed for NFTs amount
    error NotEnoughPiecesForNFTs(uint8 pieceType, uint256 NFTamount, uint256 piecesRequired);

    /// revert if not enough steps for NFTs
    /// @param totalStepsRun the total steps user have
    /// @param NFTamount the amount of NFT user want to make
    /// @param amountRequired the amount of steps needed for NFTs amount
    error NotEnoughStepsForNFTs(uint256 totalStepsRun, uint256 NFTamount, uint256 amountRequired);

    /// to check if user input valid piece type/id
    /// @param pieceType the id of the piece type
    modifier validPieceType(uint8 pieceType) {
        if (pieceType >= pieceTypes) revert InvalidPieceType(pieceType);
        _;
    }

    /// to check if box info input is valid
    /// @param boxInfo the info of the box
    /// @dev for simplicity, the valid number representing the chances of each piece are from 1 to 10, with 0 means that this piece type cant be obtained in this box
    /// @dev the chance for bronze piece have to be smaller than silver, whose chance should be smaller than gold
    modifier validBoxInfo(BoxInfo memory boxInfo) {
        if (boxInfo.GOLD > 10 || boxInfo.SILVER > 10 || boxInfo.BRONZE > 10)
            revert InvalidBoxInfo();
        if (boxInfo.GOLD == 0 && boxInfo.SILVER == 0 && boxInfo.BRONZE == 0)
            revert InvalidBoxInfo();
        if (boxInfo.GOLD <= boxInfo.SILVER && boxInfo.GOLD != 0) revert InvalidBoxInfo();
        if (boxInfo.SILVER <= boxInfo.BRONZE && boxInfo.SILVER != 0) revert InvalidBoxInfo();
        _;
    }

    /// to check if user input valid box id
    /// @param boxId the id of the box
    modifier validBoxId(uint8 boxId) {
        if (boxId >= boxTypeCount) revert InvalidBoxId(boxId);
        _;
    }

    constructor(
        address ERC721Address
    )
        ERC1155("http://localhost:8000/ipfs/QmSBm4e2zbCjFk1MHxrTiADJ7foRdeUTpzSzVPmaK4aGpc/")
        Ownable(msg.sender)
    {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory baseUri = super.uri(tokenId);
        return
            bytes(baseUri).length > 0
                ? string.concat(baseUri, Strings.toString(tokenId), ".json")
                : "";
    }

    /// set random number oracle for the contract
    /// @param newAddress new address of the oracle
    function setRandOracleAddress(address newAddress) external onlyOwner {
        randOracle = IRandOracle(newAddress);
        emit OracleAddressChanged(newAddress);
    }

    /// set the money generator of the contract
    /// @param ERC721Address the address of the money generator
    function setPrimeToken(address ERC721Address) public onlyOwner {
        primeToken = IMoneyGenerator(ERC721Address);
    }

    /// change the amount required for a piece type
    /// @param pieceType the id of the piece type
    /// @param amount the new amount required for piece
    function setPieceRequired(
        uint8 pieceType,
        uint8 amount
    ) public onlyOwner validPieceType(pieceType) {
        pieceTypeRequired[pieceType] = amount;
    }

    /// let user check their total step
    /// @return uint256 the total steps of user
    function checkOwnSteps() external view returns (uint256) {
        return totalStepsRun[msg.sender];
    }

    /// change the step required for a NFT
    /// @param amount the new amount of step required
    function setStepRequired(uint256 amount) public onlyOwner {
        stepsRequired = amount;
        emit stepRequiredChanged(amount);
    }

    /// add steps for a batch of users
    /// @param users an array of users
    /// @param steps an array of steps corresponding to each user in the array
    /// @dev this function should be called at an interval by the
    /// @dev server responsible for getting users'steps run every day
    function addBatchSteps(address[] memory users, uint256[] memory steps) public onlyOwner {
        unchecked {
            for (uint i = 0; i < users.length; ++i) {
                address person = users[i];
                uint256 step = steps[i];
                totalStepsRun[person] += step;
            }
            emit stepsAdded(users, steps);
        }
    }

    /// add a new box type to this game contract
    /// @param boxInfo the info of the new box type
    function addBoxType(BoxInfo memory boxInfo) public onlyOwner validBoxInfo(boxInfo) {
        boxTypes[boxTypeCount] = boxInfo;
        emit BoxTypeAdded(boxTypeCount++);
    }

    /// allow owner to change the info of previously added box type
    /// @param boxId the id of the previously added box type
    /// @param boxInfo the new info for the box type
    function setBoxType(
        uint8 boxId,
        BoxInfo memory boxInfo
    ) public onlyOwner validBoxId(boxId) validBoxInfo(boxInfo) {
        boxTypes[boxId] = boxInfo;
        emit BoxTypeChanged(boxId);
    }

    /// user buy 1 of the specific box type
    /// @param boxId the id of the box type user is buying
    function buyBox(uint8 boxId) external payable validBoxId(boxId) {
        BoxInfo memory box = boxTypes[boxId];
        if (msg.value < box.price) revert NotEnoughForBox(box.price, msg.value);
        ++boxesOwned[msg.sender][boxId];
        emit BoxBought(msg.sender, boxId);
    }

    /// user open a box, but dont get piece right away
    /// @param boxId the id of the box type user is opening
    /// @dev this function mark the start of requesting random number for random piece. As such user have to wait after this function is called to get their pieces
    function openBox(uint8 boxId) external validBoxId(boxId) {
        if (randOracle == IRandOracle(address(0))) revert OracleNotInitialized();
        if (boxesOwned[msg.sender][boxId] == 0) revert BoxNotEnough(boxId);

        uint256 id = randOracle.requestRandomNumber();
        randNumRequests[id].user = msg.sender;
        randNumRequests[id].boxId = boxId;
        randNumRequests[id].real = true;
        unchecked {
            --boxesOwned[msg.sender][boxId];
        }

        emit BoxOpened(msg.sender, boxId);
    }

    /// the user get their random piece
    /// @param randomNumber the random number used to calculate what piece user get
    /// @param id the id of the random number request
    /// @dev this function mark the finish of the random number request
    /// @dev this function will be called by the random number oracle to give a random number
    /// @dev and calculate from it what piece the user will get
    function givePieces(uint256 randomNumber, uint256 id) external {
        if (msg.sender != address(randOracle)) revert UnauthorizedOracle();
        if (!randNumRequests[id].real) revert RanNumReqInvalidOrFulfilled();
        address user = randNumRequests[id].user;
        uint8 boxId = randNumRequests[id].boxId;

        BoxInfo memory box = boxTypes[boxId];
        uint8 pieceGot;
        unchecked {
            uint8 chances = uint8(randomNumber % 10) + 1;
            //each box type has different chance for 3 token types
            if (chances <= box.BRONZE) {
                pieceGot = BRONZE;
            } else if (chances <= box.SILVER) {
                pieceGot = SILVER;
            } else if (chances <= box.GOLD) {
                pieceGot = GOLD;
            }
        }

        _mint(user, pieceGot, 1, "");
        emit PieceGot(user, pieceGot, 1);
        delete randNumRequests[id];
    }

    /// user combine pieces to make NFTs
    /// user can only turn one type of piece into NFTs at a time
    /// @param pieceType the type of piece the user use
    /// @param amount how many NFTs user want to make
    function combinePieces(uint8 pieceType, uint256 amount) external validPieceType(pieceType) {
        unchecked {
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
            if (userStepRun < stepsNeeded)
                revert NotEnoughStepsForNFTs(userStepRun, amount, stepsNeeded);

            //if enough burn piece and reduce step
            _burn(msg.sender, pieceType, piecesRequired);
            totalStepsRun[msg.sender] -= stepsNeeded;
            primeToken.safeMint(msg.sender, amount);

            emit PieceCombined(msg.sender, pieceType, amount, pieceOwned - piecesRequired);
        }
    }

    //dev function used for testing only
    function ownerGiveBoxes(address[] memory users, uint8 boxId, uint8 amount) public onlyOwner {
        unchecked {
            for (uint i = 0; i < users.length; ++i) {
                boxesOwned[users[i]][boxId] += amount;
            }
        }
    }

    function ownerGivePieces(address user, uint256 id, uint256 amount) public onlyOwner {
        _mint(user, id, amount, "");
    }

    function checkUserSteps(address user) external view onlyOwner returns (uint256) {
        return totalStepsRun[user];
    }

    function ownerGiveSteps(address user, uint256 steps) public onlyOwner {
        totalStepsRun[user] += steps;
    }

    function ownerSetSteps(address user, uint256 steps) public onlyOwner {
        totalStepsRun[user] = steps;
    }
}
