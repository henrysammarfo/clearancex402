import { keccak256, encodePacked } from "viem";

export function computeTemplateId(
  datasetCdrUuid: number,
  name: string,
  publisher: `0x${string}`,
): `0x${string}` {
  return keccak256(
    encodePacked(["uint32", "string", "address"], [datasetCdrUuid, name, publisher]),
  );
}
