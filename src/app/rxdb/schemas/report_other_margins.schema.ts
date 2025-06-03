export const reportOtherMarginsSchema = {
  title: 'Report Other Margins Schema',
  version: 0,
  description: 'Microscopy - Other Margins',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    superior: { type: 'boolean', default: false },
    inferior: { type: 'boolean', default: false },
    anterior: { type: 'boolean', default: false },
    posterior: { type: 'boolean', default: false },
    lateral: { type: 'boolean', default: false },
    medial: { type: 'boolean', default: false },
  },
  required: ['id', 'report_id'],
};
