export const reportInvasiveCarcinomaSchema = {
  title: 'Report Invasive Carcinoma Schema',
  version: 0,
  description: 'Microscopy - Invasive Carcinoma',
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 36 },
    report_id: { type: 'string', maxLength: 36 },
    ic_present: { type: 'boolean' },
    invasive_tumor_size: { type: 'number' },
    whole_tumor_size: { type: 'number' },
    ic_type: { type: 'string' },
    invasive_grade: { type: 'string' },
    sbr_score: { type: 'integer' },
    tumour_extent: { type: 'string' },
    lympho_vascular_invasion: { type: 'string' },
    site_of_other_nodes: { type: 'string' },
    updated_at: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'report_id'],
};
