export const reportAxillaryNodeSchema = {
  title: 'Report Axillary Node Schema',
  version: 0,
  description: 'Microscopy - Axillary Node',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    an_present: { type: 'boolean' },
    total_number: { type: 'integer' },
    number_positive: { type: 'integer' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'report_id'],
};
