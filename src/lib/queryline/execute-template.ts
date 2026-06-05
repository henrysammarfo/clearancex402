/**
 * Runs an allow-listed template against decrypted dataset JSON (publisher side, off-chain).
 * This is real computation on real data — not a CDR enclave API (not exposed in SDK 0.2.1 yet).
 */

export type DatasetPayload = {
  rows?: Array<Record<string, unknown>>;
  schema?: unknown;
};

export function executeTemplateOnDataset(
  templateName: string,
  params: Record<string, unknown>,
  dataset: DatasetPayload,
): Record<string, unknown> {
  const rows = dataset.rows ?? [];
  const region = String(params.region ?? "");

  switch (templateName) {
    case "avg_value_by_region":
    case "average_age_by_region": {
      const filtered = region
        ? rows.filter((r) => String(r.region ?? "") === region)
        : rows;
      const values = filtered
        .map((r) => Number(r.value ?? r.age))
        .filter((n) => Number.isFinite(n));
      const avg =
        values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
      return {
        template: templateName,
        params: { region: region || "*" },
        rowCount: filtered.length,
        result: { avg_value: avg },
      };
    }
    default: {
      return {
        template: templateName,
        params,
        result: {
          rowCount: rows.length,
          message: `Template "${templateName}" — pass-through summary (add handler in execute-template.ts).`,
        },
      };
    }
  }
}
