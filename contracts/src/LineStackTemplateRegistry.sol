// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {LineStackDatasetRegistry} from "./LineStackDatasetRegistry.sol";

/// @notice Allow-listed query templates per dataset CDR UUID (Queryline).
contract LineStackTemplateRegistry {
    LineStackDatasetRegistry public immutable datasetRegistry;

    struct Template {
        bytes32 id;
        uint32 datasetCdrUuid;
        address publisher;
        string name;
        string paramsSchemaJson;
        bool active;
        uint64 registeredAt;
    }

    mapping(bytes32 => Template) public templates;

    event TemplateRegistered(
        bytes32 indexed templateId,
        uint32 indexed datasetCdrUuid,
        address indexed publisher,
        string name,
        string paramsSchemaJson
    );
    event TemplateDeactivated(bytes32 indexed templateId, address indexed publisher);

    error TemplateExists(bytes32 templateId);
    error TemplateNotFound(bytes32 templateId);
    error NotTemplatePublisher(bytes32 templateId);
    error DatasetNotRegistered(uint32 cdrUuid);
    error NotDatasetOwner(uint32 cdrUuid);

    constructor(address datasetRegistry_) {
        datasetRegistry = LineStackDatasetRegistry(datasetRegistry_);
    }

    function templateId(uint32 datasetCdrUuid, string calldata name, address publisher)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(datasetCdrUuid, name, publisher));
    }

    function registerTemplate(
        uint32 datasetCdrUuid,
        string calldata name,
        string calldata paramsSchemaJson
    ) external returns (bytes32 id) {
        (address owner,,,) = datasetRegistry.getDataset(datasetCdrUuid);
        if (owner == address(0)) revert DatasetNotRegistered(datasetCdrUuid);
        if (owner != msg.sender) revert NotDatasetOwner(datasetCdrUuid);
        require(bytes(name).length >= 2, "name");
        require(bytes(paramsSchemaJson).length > 0, "schema");

        id = templateId(datasetCdrUuid, name, msg.sender);
        if (templates[id].publisher != address(0)) revert TemplateExists(id);

        templates[id] = Template({
            id: id,
            datasetCdrUuid: datasetCdrUuid,
            publisher: msg.sender,
            name: name,
            paramsSchemaJson: paramsSchemaJson,
            active: true,
            registeredAt: uint64(block.timestamp)
        });

        emit TemplateRegistered(id, datasetCdrUuid, msg.sender, name, paramsSchemaJson);
    }

    function deactivateTemplate(bytes32 id) external {
        Template storage t = templates[id];
        if (t.publisher == address(0)) revert TemplateNotFound(id);
        if (t.publisher != msg.sender) revert NotTemplatePublisher(id);
        t.active = false;
        emit TemplateDeactivated(id, msg.sender);
    }

    function getTemplate(bytes32 id)
        external
        view
        returns (
            uint32 datasetCdrUuid,
            address publisher,
            string memory name,
            string memory paramsSchemaJson,
            bool active,
            uint64 registeredAt
        )
    {
        Template storage t = templates[id];
        if (t.publisher == address(0)) revert TemplateNotFound(id);
        return (t.datasetCdrUuid, t.publisher, t.name, t.paramsSchemaJson, t.active, t.registeredAt);
    }
}
