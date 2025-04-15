import { Patient } from "./patient.model";

/** Grouping structure of report and how it is stored. */
export class Report {
	_id?: string;
	_rev?: string;
	// patient!: Patient;
	initial_details!: {
		hospital_Number?: string;
		histology_Number: string;
		referring_Hospital?: string;
		referring_Clinician?: string;
		reporting_Date?: string;
		side?: Laterality;				
		date_typed?: string;
		typed_by?: string;
	}

	macroscopy!: {
		specimen_type: {
			core_needle_biopsy?: boolean;
			wide_local_excision?: boolean;
			mastectomy?: boolean;
			open_biopsy?: boolean;
			segmental_excision?: boolean;
			wide_bore_needle_biopsy?: boolean;
		}
		specimen_dimensions: {
			weight: number;
			length: number;
			width: number;
			height: number;						
		}
		axillary_procedure: {
			no_lymph_node_procedure?: boolean;
			axillary_node_sample?: boolean;
			sentinel_node_biopsy?: boolean;
			axillary_node_clearance?: boolean;
			intrammary_node?: boolean;
		}
	}

	microscopy!: {
		in_situ_carcinoma: {			
			ductal_carcinoma_in_situ: number;			
			lobular_carcinoma_in_situ: boolean;
			paget_disease: boolean;
			microinvasion: boolean;
		}
		invasive_carcinoma: {
			ic_present?: boolean;		
			invasive_tumor_size?: number;
			whole_size_tumor?: number;			
			ic_type?: InvasiveCarcinomaTypes | string;
			invasive_grade?: InvasiveGrades;
			sbr_score?: number;
			tumour_extent?: TumourExtent;
			lympho_vascular_invasion?: Lympho;
			site_of_other_nodes?: string;
		}
		axillary_node: {
			an_present?: boolean;
			total_number?: number;
			number_positive?: number;
		}
		margin: {
			excision_margins: string;
			skin_involvement?: SkinInvolvement;
			nipple_involvement?: boolean;
			skeletal_muscle_involvement?: SkeletalMuscle; 
			surgical_margins: SurgicalMargins;
		}
		other_margins: {			
			superior?: boolean;
			inferior?: boolean;
			anterior?: boolean;
			posterior?: boolean;
			lateral?: boolean;
			medial?: boolean;
		};
		pathological_staging: {
			not_applicable: boolean;
			pt: number;
			n: number;
			m: number;
		};
	}

	ihc!: {
		oestrogen_receptor_status: IHC;
		pr: IHC;
		her2: IHC;
		quick_allred_score: number;
	}
	
	pathologist_report!: {
		final_diagnosis: string;
		comment: string;
		consultant_pathologist: string;
		date_of_request: string;
		date_received: string;
		date_reviewed: string;
	}
}

export enum SpecimenTypes {
  OB = 'Open biopsy',
  WB = 'Wide Bore Needle Biopsy',
  WLE = 'Wide Local Excision',
  M = 'Mastectomy',
  SE = 'Segmental Excision',
  CNB = 'Core Needle Biopsy'
}

export enum AxillaryProcedures {
  NIL = 'no lymph node procedure',
  AX = 'axillary node sample',
  SNB = 'sentinel node biopsy',
  ANC = 'axillary node clearance',
  IN = 'intrammary node'
}

export enum InSituCarcinoma {
  LC = 'lobular carcinoma in situ',
  PD = 'paget disease'
}

export enum Laterality {
	LEFT = "Left",
	RIGHT = "Right",
	BOTH = "Both"
}

export enum InvasiveCarcinomaTypes {
	NA = "No Special Type",
	TUBULAR = "Tubular",
	LOBULAR = "Lobular",
	MUCINOUS = "Mucinous",
	MEDULLARY_LIKE = "Medullary Like",
	OTHER = "Other",
	MIXED = "Mixed"
}

export enum InvasiveGrades {
	ONE = "1",
	TWO = "2",
	THREE = "3",
	UNKNOWN = "Not assessable"
}

export enum TumourExtent {
	LOCALISED = "Localised",
	MULTIPLE = "Multiple Invasive foci"
}

export enum Lympho {
	NA = "Not Seen",
	PRESENT = "Present"
}

export enum SurgicalMargins {
	NEGATIVE = "Negative",
	POSITIVE = "Positive",	
	UNKNOWN = "Unable to assess",
}

export enum SkinInvolvement {
	NA = "No skin present",
	ULCERATION = "Present with ulceration",
	NOULCERATION = "Present without ulceration",
	DERMAL = "Dermal lymphatic involvement"
}

export enum SkeletalMuscle {
	NA = "No muscle involvement",
	INVASION = "Muscle present with tumour invasion",
	NOINVASION = "Muscle present without tumour invasion"
}

export enum IHC {
	POSITIVE = "Positive",
	NEGATIVE = "Negative",
	NA = "Not performed"
}