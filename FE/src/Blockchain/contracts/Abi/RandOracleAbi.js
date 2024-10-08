export default [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32"
      }
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address"
      }
    ],
    name: "AddressNotProvider",
    type: "error"
  },
  {
    inputs: [],
    name: "NoProviderAdded",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address"
      }
    ],
    name: "OnlyProviderNoRemove",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address"
      }
    ],
    name: "ProviderAlreadyAdded",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256"
      }
    ],
    name: "RequestNotFound",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_thresholdInput",
        type: "uint8"
      }
    ],
    name: "ZeroThresholdInvalid",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "providerAddress",
        type: "address"
      }
    ],
    name: "ProviderAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "providerAddress",
        type: "address"
      }
    ],
    name: "ProviderRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "threshold",
        type: "uint256"
      }
    ],
    name: "ProvidersThresholdChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "callerAddress",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "RandomNumberRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "randomNumber",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "callerAddress",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "RandomNumberReturned",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "PROVIDER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address"
      }
    ],
    name: "addProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address"
      }
    ],
    name: "removeProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "callerConfirmation",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "requestRandomNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "callerAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "randomNumber",
        type: "uint256"
      }
    ],
    name: "returnRandomNumber",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "threshold",
        type: "uint8"
      }
    ],
    name: "setProvidersThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
]