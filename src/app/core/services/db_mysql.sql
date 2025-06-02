-- Main Reports table
CREATE TABLE reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rev VARCHAR(255),
    patient_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id)
);

-- Initial Details
CREATE TABLE report_initial_details (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    hospital_number VARCHAR(100),
    histology_number VARCHAR(100) NOT NULL,
    referring_hospital VARCHAR(255),
    referring_clinician VARCHAR(255),
    reporting_date DATE,
    side VARCHAR(10),
    date_typed DATE,
    typed_by VARCHAR(255),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Macroscopy - Specimen Type
CREATE TABLE report_specimen_type (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    core_needle_biopsy BOOLEAN DEFAULT FALSE,
    wide_local_excision BOOLEAN DEFAULT FALSE,
    mastectomy BOOLEAN DEFAULT FALSE,
    open_biopsy BOOLEAN DEFAULT FALSE,
    segmental_excision BOOLEAN DEFAULT FALSE,
    wide_bore_needle_biopsy BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Macroscopy - Specimen Dimensions
CREATE TABLE report_specimen_dimensions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    weight DECIMAL(10,3) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Macroscopy - Axillary Procedure
CREATE TABLE report_axillary_procedure (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    no_lymph_node_procedure BOOLEAN DEFAULT FALSE,
    axillary_node_sample BOOLEAN DEFAULT FALSE,
    sentinel_node_biopsy BOOLEAN DEFAULT FALSE,
    axillary_node_clearance BOOLEAN DEFAULT FALSE,
    intrammary_node BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - In Situ Carcinoma
CREATE TABLE report_in_situ_carcinoma (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    ductal_carcinoma_in_situ DECIMAL(5,2) NOT NULL,
    lobular_carcinoma_in_situ BOOLEAN DEFAULT FALSE,
    paget_disease BOOLEAN DEFAULT FALSE,
    microinvasion BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - Invasive Carcinoma
CREATE TABLE report_invasive_carcinoma (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    ic_present BOOLEAN,
    invasive_tumor_size DECIMAL(5,2),
    whole_size_tumor DECIMAL(5,2),
    ic_type VARCHAR(100),
    invasive_grade VARCHAR(10),
    sbr_score INT,
    tumour_extent VARCHAR(20),
    lympho_vascular_invasion VARCHAR(20),
    site_of_other_nodes TEXT,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - Axillary Node
CREATE TABLE report_axillary_node (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    an_present BOOLEAN,
    total_number INT,
    number_positive INT,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - Margin
CREATE TABLE report_margin (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    excision_margins TEXT NOT NULL,
    skin_involvement VARCHAR(10),
    nipple_involvement BOOLEAN,
    skeletal_muscle_involvement VARCHAR(10),
    surgical_margins VARCHAR(10),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - Other Margins
CREATE TABLE report_other_margins (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    superior BOOLEAN DEFAULT FALSE,
    inferior BOOLEAN DEFAULT FALSE,
    anterior BOOLEAN DEFAULT FALSE,
    posterior BOOLEAN DEFAULT FALSE,
    lateral BOOLEAN DEFAULT FALSE,
    medial BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Microscopy - Pathological Staging
CREATE TABLE report_pathological_staging (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    not_applicable BOOLEAN NOT NULL DEFAULT FALSE,
    pt INT NOT NULL,
    n INT NOT NULL,
    m INT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- IHC (Immunohistochemistry)
CREATE TABLE report_ihc (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    oestrogen_receptor_status VARCHAR(10) NOT NULL,
    pr VARCHAR(10) NOT NULL,
    her2 VARCHAR(10) NOT NULL,
    quick_allred_score INT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Pathologist Report
CREATE TABLE report_pathologist_report (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id CHAR(36) NOT NULL,
    final_diagnosis TEXT NOT NULL,
    comment TEXT NOT NULL,
    consultant_pathologist VARCHAR(255) NOT NULL,
    date_of_request DATE NOT NULL,
    date_received DATE NOT NULL,
    date_reviewed DATE NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_report_initial_details_report_id ON report_initial_details(report_id);
CREATE INDEX idx_report_specimen_type_report_id ON report_specimen_type(report_id);
CREATE INDEX idx_report_specimen_dimensions_report_id ON report_specimen_dimensions(report_id);
CREATE INDEX idx_report_axillary_procedure_report_id ON report_axillary_procedure(report_id);
CREATE INDEX idx_report_in_situ_carcinoma_report_id ON report_in_situ_carcinoma(report_id);
CREATE INDEX idx_report_invasive_carcinoma_report_id ON report_invasive_carcinoma(report_id);
CREATE INDEX idx_report_axillary_node_report_id ON report_axillary_node(report_id);
CREATE INDEX idx_report_margin_report_id ON report_margin(report_id);
CREATE INDEX idx_report_other_margins_report_id ON report_other_margins(report_id);
CREATE INDEX idx_report_pathological_staging_report_id ON report_pathological_staging(report_id);
CREATE INDEX idx_report_ihc_report_id ON report_ihc(report_id);
CREATE INDEX idx_report_pathologist_report_report_id ON report_pathologist_report(report_id);