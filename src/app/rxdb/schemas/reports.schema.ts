export const reportSchema = {
  title: 'report schema',
  version: 0,
  description: 'report table',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    rev: { type: 'string' },
    patient_id: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['id', 'patient_id'],
};
