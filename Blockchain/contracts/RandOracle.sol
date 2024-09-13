// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICaller {
    function givePieces(address callerAddress, uint8 boxType, uint256 randomNumber, uint256 id) external;
}

contract RandOracle is AccessControl {
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");

    uint8 private numProviders = 0;
    uint8 private providersThreshold = 1;

    uint256 private randNonce = 0;

    mapping(uint256=>bool) private pendingRequests;

    struct Response {
        address callerAddress;
        address providerAddress;
        uint256 randomNumber;
    }

    mapping(uint256=>Response[]) private idToResponses;

    // Events
    event RandomNumberRequested(address callerAddress, uint id, uint8 boxType);
    event RandomNumberReturned(uint256 randomNumber, address callerAddress, uint id);
    event ProviderAdded(address providerAddress);
    event ProviderRemoved(address providerAddress);
    event ProvidersThresholdChanged(uint threshold);

    // Errors
    error ProviderAlreadyAdded(address _address);
    error AddressNotProvider(address _address);
    error OnlyProviderNoRemove(address _address);
    error ZeroThresholdInvalid(uint8 _thresholdInput);
    error NoProviderAdded();
    error RequestNotFound(uint256 _id);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // make the deployer admin
    }

    // Admin functions
    function addProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if(hasRole(PROVIDER_ROLE, provider)) revert ProviderAlreadyAdded(provider);

        _grantRole(PROVIDER_ROLE, provider);
        numProviders++;

        emit ProviderAdded(provider);
    }

    function removeProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if(!hasRole(PROVIDER_ROLE, provider)) revert AddressNotProvider(provider);
        if(numProviders <= 1) revert OnlyProviderNoRemove(provider);

        _revokeRole(PROVIDER_ROLE, provider);
        numProviders--;

        emit ProviderRemoved(provider);
    }

    function setProvidersThreshold(uint8 threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if(threshold <= 0) revert ZeroThresholdInvalid(threshold);

        providersThreshold = threshold;
        emit ProvidersThresholdChanged(providersThreshold);
    }

    function requestRandomNumber(uint8 boxType) external returns (uint256) {
        if(numProviders <= 0) revert NoProviderAdded();

        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 10000;
        pendingRequests[id] = true;

        emit RandomNumberRequested(msg.sender, id, boxType);
        return id;
    }

    function returnRandomNumber(uint256 id, uint8 boxType, uint256 randomNumber, address callerAddress) external onlyRole(PROVIDER_ROLE) {
        if(!pendingRequests[id]) revert RequestNotFound(id);

        // Add newest response to list
        Response memory res = Response(callerAddress, msg.sender, randomNumber);
        idToResponses[id].push(res);
        uint numResponses = idToResponses[id].length;

        // Check if we've received enough responses
        if (numResponses == providersThreshold) {
            uint compositeRandomNumber = 0;

            // Loop through the array and combine responses
            for (uint i=0; i < idToResponses[id].length; i++) {
                compositeRandomNumber = compositeRandomNumber ^ idToResponses[id][i].randomNumber; // bitwise XOR
            }

            // Clean up
            delete pendingRequests[id];
            delete idToResponses[id];

            // Fulfill request
            ICaller(callerAddress).givePieces(callerAddress, boxType, compositeRandomNumber, id);

            emit RandomNumberReturned(compositeRandomNumber, callerAddress, id);
        }
    }
}