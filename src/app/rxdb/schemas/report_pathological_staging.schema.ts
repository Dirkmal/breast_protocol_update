export const reportPathologicalStagingSchema = {
  title: "Report Pathological Staging Schema",
  version: 0,
  description: "Microscopy - Pathological Staging",
  type: "object",
  primaryKey: "id",
  properties: {
    id: { type: "string", maxLength: 36 },
    report_id: { type: "string", maxLength: 36 },
    not_applicable: { type: "boolean", default: false },
    pt: { type: "integer" },
    n: { type: "integer" },
    m: { type: "integer" },
  },
  required: ["id", "report_id", "pt", "n", "m"],
};
