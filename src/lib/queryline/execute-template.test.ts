import { describe, expect, it } from "vitest";
import { executeTemplateOnDataset } from "./execute-template";

describe("executeTemplateOnDataset", () => {
  const dataset = {
    rows: [
      { region: "EU", value: 40 },
      { region: "EU", value: 44 },
      { region: "US", value: 37 },
    ],
  };

  it("computes avg_value_by_region for EU", () => {
    const out = executeTemplateOnDataset("avg_value_by_region", { region: "EU" }, dataset);
    expect(out.result).toEqual({ avg_value: 42 });
    expect(out.rowCount).toBe(2);
  });
});
