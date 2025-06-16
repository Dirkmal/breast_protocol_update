export const reportInSituCarcinomaSchema = {
  title: 'Report In Situ Carcinoma Schema',
  version: 0,
  description: 'Microscopy - In Situ Carcinoma',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    ductal_carcinoma_in_situ: { type: 'number' },
    lobular_carcinoma_in_situ: { type: 'boolean', default: false },
    paget_disease: { type: 'boolean', default: false },
    microinvasion: { type: 'boolean', default: false },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'report_id', 'ductal_carcinoma_in_situ'],
};
