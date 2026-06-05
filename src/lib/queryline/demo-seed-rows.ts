/** Default E2E seed — edit before signing the CDR write tx. */
export const DEMO_SEED_ROWS_JSON = `{
  "rows": [
    { "region": "EU", "value": 42, "segment": "enterprise" },
    { "region": "EU", "value": 38, "segment": "smb" },
    { "region": "US", "value": 55, "segment": "enterprise" },
    { "region": "US", "value": 61, "segment": "smb" },
    { "region": "APAC", "value": 33, "segment": "enterprise" }
  ]
}`;

export function buildDatasetSeedPayload(datasetId: string, schemaJson: string, rowsJson: string) {
  const rows = JSON.parse(rowsJson) as { rows?: unknown[] };
  if (!Array.isArray(rows.rows) || rows.rows.length === 0) {
    throw new Error('Seed JSON must be an object with a non-empty "rows" array.');
  }
  return {
    datasetId,
    schema: JSON.parse(schemaJson) as unknown,
    rows: rows.rows,
    seededAt: new Date().toISOString(),
  };
}
