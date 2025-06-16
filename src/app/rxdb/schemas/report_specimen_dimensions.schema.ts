export const reportSpecimenDimensionsSchema = {
  title: 'Report Specimen Dimensions Schema',
  version: 0,
  description: 'Macroscopy - Specimen Dimensions',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    weight: { type: 'number' },
    length: { type: 'number' },
    width: { type: 'number' },
    height: { type: 'number' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'report_id', 'weight', 'length', 'width', 'height'],
};
