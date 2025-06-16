export const reportMarginSchema = {
  title: 'Report Margin Schema',
  version: 0,
  description: 'Microscopy - Margin',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    excision_margins: { type: 'string' },
    skin_involvement: { type: 'string' },
    nipple_involvement: { type: 'boolean' },
    skeletal_muscle_involvement: { type: 'string' },
    surgical_margins: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'report_id', 'excision_margins'],
};
