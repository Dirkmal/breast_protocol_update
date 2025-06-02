-- Create enum types first
CREATE TYPE laterality AS ENUM ('left', 'right', 'bilateral');
CREATE TYPE invasive_carcinoma_types AS ENUM ('ductal', 'lobular', 'mixed', 'mucinous', 'tubular', 'other');
CREATE TYPE invasive_grades AS ENUM ('grade1', 'grade2', 'grade3');
CREATE TYPE tumour_extent AS ENUM ('unifocal', 'multifocal', 'multicentric');
CREATE TYPE lympho AS ENUM ('present', 'absent', 'extensive');
CREATE TYPE skin_involvement AS ENUM ('none', 'paget_disease_only', 'invasive_carcinoma', 'dermal_lymphatic_invasion', 'full_thickness');
CREATE TYPE skeletal_muscle AS ENUM ('not_present', 'present', 'involved');
CREATE TYPE surgical_margins AS ENUM ('involved', 'close', 'clear');
CREATE TYPE ihc_status AS ENUM ('positive', 'negative', 'equivocal');

-- Main report table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rev VARCHAR(255),
    patient_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial details table with one-to-one relationship to reports
CREATE TABLE initial_details (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    hospital_number VARCHAR(255),
    histology_number VARCHAR(255) NOT NULL,
    referring_hospital VARCHAR(255),
    referring_clinician VARCHAR(255),
    reporting_date DATE,
    side laterality,
    date_typed DATE,
    typed_by VARCHAR(255)
);

-- Macroscopy - specimen type table
CREATE TABLE specimen_types (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    core_needle_biopsy BOOLEAN DEFAULT FALSE,
    wide_local_excision BOOLEAN DEFAULT FALSE,
    mastectomy BOOLEAN DEFAULT FALSE,
    open_biopsy BOOLEAN DEFAULT FALSE,
    segmental_excision BOOLEAN DEFAULT FALSE,
    wide_bore_needle_biopsy BOOLEAN DEFAULT FALSE
);

-- Macroscopy - specimen dimensions table
CREATE TABLE specimen_dimensions (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    weight DECIMAL,
    length DECIMAL,
    width DECIMAL,
    height DECIMAL
);

-- Macroscopy - axillary procedure table
CREATE TABLE axillary_procedures (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    no_lymph_node_procedure BOOLEAN DEFAULT FALSE,
    axillary_node_sample BOOLEAN DEFAULT FALSE,
    sentinel_node_biopsy BOOLEAN DEFAULT FALSE,
    axillary_node_clearance BOOLEAN DEFAULT FALSE,
    intrammary_node BOOLEAN DEFAULT FALSE
);

-- Microscopy - in situ carcinoma table
CREATE TABLE in_situ_carcinomas (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    ductal_carcinoma_in_situ INTEGER,
    lobular_carcinoma_in_situ BOOLEAN DEFAULT FALSE,
    paget_disease BOOLEAN DEFAULT FALSE,
    microinvasion BOOLEAN DEFAULT FALSE
);

-- Microscopy - invasive carcinoma table
CREATE TABLE invasive_carcinomas (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    ic_present BOOLEAN DEFAULT FALSE,
    invasive_tumor_size DECIMAL,
    whole_tumor_size DECIMAL,
    ic_type invasive_carcinoma_types,
    invasive_grade invasive_grades,
    sbr_score INTEGER,
    tumour_extent tumour_extent,
    lympho_vascular_invasion lympho,
    site_of_other_nodes VARCHAR(255)
);

-- Microscopy - axillary node table
CREATE TABLE axillary_nodes (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    an_present BOOLEAN DEFAULT FALSE,
    total_number INTEGER,
    number_positive INTEGER
);

-- Microscopy - margin table
CREATE TABLE margins (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    excision_margins VARCHAR(255) NOT NULL,
    skin_involvement skin_involvement,
    nipple_involvement BOOLEAN DEFAULT FALSE,
    skeletal_muscle_involvement skeletal_muscle,
    surgical_margins surgical_margins
);

-- Microscopy - other margins table
CREATE TABLE other_margins (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    superior BOOLEAN DEFAULT FALSE,
    inferior BOOLEAN DEFAULT FALSE,
    anterior BOOLEAN DEFAULT FALSE,
    posterior BOOLEAN DEFAULT FALSE,
    lateral BOOLEAN DEFAULT FALSE,
    medial BOOLEAN DEFAULT FALSE
);

-- Microscopy - pathological staging table
CREATE TABLE pathological_stagings (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    not_applicable BOOLEAN DEFAULT FALSE,
    pt INTEGER,
    n INTEGER,
    m INTEGER
);

-- IHC table
CREATE TABLE ihcs (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    oestrogen_receptor_status ihc_status NOT NULL,
    pr ihc_status NOT NULL,
    her2 ihc_status NOT NULL,
    quick_allred_score INTEGER NOT NULL
);

-- Pathologist report table
CREATE TABLE pathologist_reports (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    final_diagnosis TEXT NOT NULL,
    comment TEXT NOT NULL,
    consultant_pathologist VARCHAR(255) NOT NULL,
    date_of_request DATE NOT NULL,
    date_received DATE NOT NULL,
    date_reviewed DATE NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_reports_patient_id ON reports(patient_id);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to explain schema
COMMENT ON TABLE reports IS 'Main report table containing basic report information';