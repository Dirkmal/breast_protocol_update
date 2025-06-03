export const reportAxillaryProcedureSchema = {
  title: 'Report Axillary Procedure Schema',
  version: 0,
  description: 'Macroscopy - Axillary Procedure',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    no_lymph_node_procedure: { type: 'boolean', default: false },
    axillary_node_sample: { type: 'boolean', default: false },
    sentinel_node_biopsy: { type: 'boolean', default: false },
    axillary_node_clearance: { type: 'boolean', default: false },
    intrammary_node: { type: 'boolean', default: false },
  },
  required: ['id', 'report_id'],
};
