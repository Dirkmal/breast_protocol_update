export interface Report {
    id?: string;
    patientId: string;
    reportType: 'lab' | 'radiology' | 'consultation' | 'procedure';
    reportTitle: string;
    reportDate: Date;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    medication?: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    labResults?: {
      testName: string;
      result: string;
      normalRange: string;
      unit: string;
    }[];
    radiologyFindings?: string;
    conclusion: string;
    recommendations?: string;
    doctorId: string;
    createdAt?: Date;
    updatedAt?: Date;
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