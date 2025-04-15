export const reportSchema = {
    // title: 'Patient Report Schema',
    version: 0,
    // description: 'Schema for saving detailed patient pathology reports',
    primaryKey: '_id',
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        maxLength: 100
      },
  
      initial_details: {
        type: 'object',
        properties: {
          hospital_Number: { type: 'string' },
          histology_Number: { type: 'string' },
          referring_Hospital: { type: 'string' },
          referring_Clinician: { type: 'string' },
          reporting_Date: { type: 'string' },
          side: { type: 'string' },
          date_typed: { type: 'string' },
          typed_by: { type: 'string' }
        },
        required: ['histology_Number']
      },
  
      macroscopy: {
        type: 'object',
        properties: {
          specimen_type: {
            type: 'object',
            properties: {
              core_needle_biopsy: { type: 'boolean' },
              wide_local_excision: { type: 'boolean' },
              mastectomy: { type: 'boolean' },
              open_biopsy: { type: 'boolean' },
              segmental_excision: { type: 'boolean' },
              wide_bore_needle_biopsy: { type: 'boolean' }
            }
          },
          specimen_dimensions: {
            type: 'object',
            properties: {
              weight: { type: 'number' },
              length: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            },
            required: ['weight', 'length', 'width', 'height']
          },
          axillary_procedure: {
            type: 'object',
            properties: {
              no_lymph_node_procedure: { type: 'boolean' },
              axillary_node_sample: { type: 'boolean' },
              sentinel_node_biopsy: { type: 'boolean' },
              axillary_node_clearance: { type: 'boolean' },
              intrammary_node: { type: 'boolean' }
            }
          }
        },
        required: ['specimen_type', 'specimen_dimensions', 'axillary_procedure']
      },
  
      microscopy: {
        type: 'object',
        properties: {
          in_situ_carcinoma: {
            type: 'object',
            properties: {
              ductal_carcinoma_in_situ: { type: 'number' },
              lobular_carcinoma_in_situ: { type: 'boolean' },
              paget_disease: { type: 'boolean' },
              microinvasion: { type: 'boolean' }
            },
            required: ['ductal_carcinoma_in_situ', 'lobular_carcinoma_in_situ', 'paget_disease', 'microinvasion']
          },
          invasive_carcinoma: {
            type: 'object',
            properties: {
              ic_present: { type: 'boolean' },
              invasive_tumor_size: { type: 'number' },
              whole_size_tumor: { type: 'number' },
              ic_type: { type: 'string' },
              invasive_grade: { type: 'string' },
              sbr_score: { type: 'number' },
              tumour_extent: { type: 'string' },
              lympho_vascular_invasion: { type: 'string' },
              site_of_other_nodes: { type: 'string' }
            }
          },
          axillary_node: {
            type: 'object',
            properties: {
              an_present: { type: 'boolean' },
              total_number: { type: 'number' },
              number_positive: { type: 'number' }
            }
          },
          margin: {
            type: 'object',
            properties: {
              excision_margins: { type: 'string' },
              skin_involvement: { type: 'string' },
              nipple_involvement: { type: 'boolean' },
              skeletal_muscle_involvement: { type: 'string' },
              surgical_margins: { type: 'string' }
            },
            required: ['excision_margins', 'surgical_margins']
          },
          other_margins: {
            type: 'object',
            properties: {
              superior: { type: 'boolean' },
              inferior: { type: 'boolean' },
              anterior: { type: 'boolean' },
              posterior: { type: 'boolean' },
              lateral: { type: 'boolean' },
              medial: { type: 'boolean' }
            }
          },
          pathological_staging: {
            type: 'object',
            properties: {
              not_applicable: { type: 'boolean' },
              pt: { type: 'number' },
              n: { type: 'number' },
              m: { type: 'number' }
            },
            required: ['not_applicable', 'pt', 'n', 'm']
          }
        },
        required: ['in_situ_carcinoma', 'margin', 'pathological_staging']
      },
  
      ihc: {
        type: 'object',
        properties: {
          oestrogen_receptor_status: { type: 'string' },
          pr: { type: 'string' },
          her2: { type: 'string' },
          quick_allred_score: { type: 'number' }
        },
        required: ['oestrogen_receptor_status', 'pr', 'her2', 'quick_allred_score']
      },
  
      pathologist_report: {
        type: 'object',
        properties: {
          final_diagnosis: { type: 'string' },
          comment: { type: 'string' },
          consultant_pathologist: { type: 'string' },
          date_of_request: { type: 'string' },
          date_received: { type: 'string' },
          date_reviewed: { type: 'string' }
        },
        required: [
          'final_diagnosis',
          'comment',
          'consultant_pathologist',
          'date_of_request',
          'date_received',
          'date_reviewed'
        ]
      }
    },
    // required: ['_id', 'initial_details', 'macroscopy', 'microscopy', 'ihc', 'pathologist_report']
  };
  