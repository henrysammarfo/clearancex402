import { parseAbi } from "viem";

export const lineStackDatasetRegistryAbi = parseAbi([
  "function registerDataset(uint32 cdrUuid, string name, string schemaJson)",
  "function getDataset(uint32 cdrUuid) view returns (address owner, string name, string schemaJson, uint64 registeredAt)",
  "event DatasetRegistered(uint32 indexed cdrUuid, address indexed owner, string name, string schemaJson)",
]);

export const lineStackTemplateRegistryAbi = parseAbi([
  "function registerTemplate(uint32 datasetCdrUuid, string name, string paramsSchemaJson) returns (bytes32)",
  "function deactivateTemplate(bytes32 id)",
  "function getTemplate(bytes32 id) view returns (uint32 datasetCdrUuid, address publisher, string name, string paramsSchemaJson, bool active, uint64 registeredAt)",
  "function templateId(uint32 datasetCdrUuid, string name, address publisher) view returns (bytes32)",
  "event TemplateRegistered(bytes32 indexed templateId, uint32 indexed datasetCdrUuid, address indexed publisher, string name, string paramsSchemaJson)",
  "event TemplateDeactivated(bytes32 indexed templateId, address indexed publisher)",
]);
