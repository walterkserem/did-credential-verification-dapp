export const CONTRACT_ADDRESS = "0x8464135c8F25Da09e49BC8782676a84730C318bC";

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_credentialType", "type": "string" },
      { "internalType": "bytes32", "name": "_documentHash", "type": "bytes32" }
    ],
    "name": "addCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getCredentials",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "credentialType", "type": "string" },
          { "internalType": "bytes32", "name": "documentHash", "type": "bytes32" },
          { "internalType": "address", "name": "issuer", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isValid", "type": "bool" }
        ],
        "internalType": "struct DIDRegistry.Credential[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];