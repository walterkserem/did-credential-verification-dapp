// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DIDRegistry {
    struct Credential {
        string title;
        string credentialType;
        bytes32 documentHash;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    mapping(address => Credential[]) private credentials;

    event CredentialAdded(
        address indexed user,
        string title,
        string credentialType,
        bytes32 documentHash,
        uint256 timestamp
    );

    event CredentialRevoked(
        address indexed user,
        uint256 index,
        uint256 timestamp
    );

    function addCredential(
        string memory _title,
        string memory _credentialType,
        bytes32 _documentHash
    ) public {
        credentials[msg.sender].push(
            Credential({
                title: _title,
                credentialType: _credentialType,
                documentHash: _documentHash,
                issuer: msg.sender,
                timestamp: block.timestamp,
                isValid: true
            })
        );

        emit CredentialAdded(
            msg.sender,
            _title,
            _credentialType,
            _documentHash,
            block.timestamp
        );
    }

    function revokeCredential(uint256 index) public {
        require(index < credentials[msg.sender].length, "Invalid credential index");
        require(credentials[msg.sender][index].isValid, "Credential already revoked");

        credentials[msg.sender][index].isValid = false;

        emit CredentialRevoked(msg.sender, index, block.timestamp);
    }

    function getCredentials(address user) public view returns (Credential[] memory) {
        return credentials[user];
    }
}