// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/// @notice On-chain index of Queryline datasets (CDR vault UUID + metadata).
contract LineStackDatasetRegistry {
    struct Dataset {
        uint32 cdrUuid;
        address owner;
        string name;
        string schemaJson;
        uint64 registeredAt;
    }

    mapping(uint32 => Dataset) public datasets;

    event DatasetRegistered(
        uint32 indexed cdrUuid,
        address indexed owner,
        string name,
        string schemaJson
    );

    error DatasetAlreadyRegistered(uint32 cdrUuid);
    error NotDatasetOwner(uint32 cdrUuid);

    function registerDataset(
        uint32 cdrUuid,
        string calldata name,
        string calldata schemaJson
    ) external {
        if (datasets[cdrUuid].owner != address(0)) {
            revert DatasetAlreadyRegistered(cdrUuid);
        }
        require(bytes(name).length >= 2, "name");
        datasets[cdrUuid] = Dataset({
            cdrUuid: cdrUuid,
            owner: msg.sender,
            name: name,
            schemaJson: schemaJson,
            registeredAt: uint64(block.timestamp)
        });
        emit DatasetRegistered(cdrUuid, msg.sender, name, schemaJson);
    }

    function getDataset(uint32 cdrUuid)
        external
        view
        returns (
            address owner,
            string memory name,
            string memory schemaJson,
            uint64 registeredAt
        )
    {
        Dataset storage d = datasets[cdrUuid];
        return (d.owner, d.name, d.schemaJson, d.registeredAt);
    }
}
