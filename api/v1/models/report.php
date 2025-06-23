<?php



class Report
{
  private PDO $pdo;
  private $report_tables;

  private string $table = "reports";

  private string $report_initial_details = "report_initial_details";
  private string $report_specimen_type = "report_specimen_type";
  private string $report_specimen_dimensions = "report_specimen_dimensions";
  private string $report_axillary_procedure = "report_axillary_procedure";
  private string $report_in_situ_carcinoma = "report_in_situ_carcinoma";
  private string $report_invasive_carcinoma = "report_invasive_carcinoma";
  private string $report_axillary_node = "report_axillary_node";
  private string $report_margin = "report_margin";
  private string $report_surgical_margins_actual = "report_surgical_margins_actual";
  private string $report_pathological_staging = "report_pathological_staging";
  private string $report_ihc = "report_ihc";
  private string $report_pathologist_report = "report_pathologist_report";

  public function __construct()
  {
    // Populate Report tables
    $this->report_tables = [
      $this->report_initial_details,
      $this->report_specimen_type,
      $this->report_specimen_dimensions,
      $this->report_axillary_procedure,
      $this->report_in_situ_carcinoma,
      $this->report_invasive_carcinoma,
      $this->report_axillary_node,
      $this->report_margin,
      $this->report_surgical_margins_actual,
      $this->report_pathological_staging,
      $this->report_ihc,
      $this->report_pathologist_report
    ];
    // Database connection
    $host = DB_HOST;
    $dbname = DB_NAME;
    $username = DB_USER;
    $password = DB_PASS;

    try {
      $this->pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
      $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
      return error_handler(
        "Database connection error: " . $e->getMessage(),
        500
      );
    }
  }

  private function getInitialDetails($reportId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_initial_details WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  private function getMacroscopy($reportId)
  {
    $macroscopy = [];

    // Get specimen type
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_specimen_type WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $macroscopy['specimen_type'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get specimen dimensions
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_specimen_dimensions WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $macroscopy['specimen_dimensions'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get axillary procedure
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_axillary_procedure WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $macroscopy['axillary_procedure'] = $stmt->fetch(PDO::FETCH_ASSOC);

    return $macroscopy;
  }

  private function getIHC($reportId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM report_ihc WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  private function getPathologistReport($reportId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_pathologist_report WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  private function getMicroscopy($reportId)
  {
    $microscopy = [];

    // Get in situ carcinoma
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_in_situ_carcinoma WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['in_situ_carcinoma'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get invasive carcinoma
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_invasive_carcinoma WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['invasive_carcinoma'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get axillary node
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_axillary_node WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['axillary_node'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get margin
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_margin WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['margin'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get other margins
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_surgical_margins_actual WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['surgical_margins_actual'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get pathological staging
    $stmt = $this->pdo->prepare("SELECT * FROM $this->report_pathological_staging WHERE report_id = :report_id");
    $stmt->execute([':report_id' => $reportId]);
    $microscopy['pathological_staging'] = $stmt->fetch(PDO::FETCH_ASSOC);

    return $microscopy;
  }

  private function deleteRelatedData($reportId)
  {
    $tables = $this->report_tables;

    foreach ($tables as $table) {
      $stmt = $this->pdo->prepare("DELETE FROM $table WHERE report_id = :report_id");
      $stmt->execute([':report_id' => $reportId]);
    }
  }

  private function insertInitialDetails($reportId, $data)
  {
    if (empty($data) || empty($data["initial_details"])) return;

    $initial_details = $data["initial_details"];

    $stmt = $this->pdo->prepare("INSERT INTO $this->report_initial_details (report_id, hospital_number, histology_number, referring_hospital,  referring_clinician, reporting_date, side, date_typed, typed_by) VALUES (:report_id, :hospital_number, :histology_number, :referring_hospital, :referring_clinician, :reporting_date, :side, :date_typed, :typed_by)");

    $stmt->execute([
      ':report_id' => $reportId,
      ':hospital_number' => $initial_details['hospital_number'] ?? null,
      ':histology_number' => $initial_details['histology_number'] ?? '',
      ':referring_hospital' => $initial_details['referring_hospital'] ?? null,
      ':referring_clinician' => $initial_details['referring_clinician'] ?? null,
      ':reporting_date' => $initial_details['reporting_date'] ?? null,
      ':side' => $initial_details['side'] ?? null,
      ':date_typed' => $initial_details['date_typed'] ?? null,
      ':typed_by' => $initial_details['typed_by'] ?? null
    ]);
  }

  private function insertIHC($reportId, $data)
  {
    if (empty($data) || empty($data["ihc"])) return;

    $ihc = $data["ihc"];

    $stmt = $this->pdo->prepare("INSERT INTO $this->report_ihc (report_id, oestrogen_receptor_status, pr, her2, quick_allred_score) VALUES (:report_id, :oestrogen_receptor_status, :pr, :her2, :quick_allred_score)");

    $stmt->execute([
      ':report_id' => $reportId,
      ':oestrogen_receptor_status' => $ihc['oestrogen_receptor_status'],
      ':pr' => $ihc['pr'],
      ':her2' => $ihc['her2'],
      ':quick_allred_score' => $ihc['quick_allred_score']
    ]);
  }

  private function insertPathologistReport($reportId, $data)
  {
    if (empty($data) || empty($data["pathologist_report"])) return;

    $report = $data["pathologist_report"];

    $stmt = $this->pdo->prepare("INSERT INTO $this->report_pathologist_report (report_id, final_diagnosis, comment, consultant_pathologist, date_of_request, date_received, date_reviewed) VALUES (:report_id, :final_diagnosis, :comment, :consultant_pathologist, :date_of_request, :date_received, :date_reviewed)");

    $stmt->execute([
      ':report_id' => $reportId,
      ':final_diagnosis' => $report['final_diagnosis'],
      ':comment' => $report['comment'],
      ':consultant_pathologist' => $report['consultant_pathologist'],
      ':date_of_request' => $report['date_of_request'],
      ':date_received' => $report['date_received'],
      ':date_reviewed' => $report['date_reviewed']
    ]);
  }

  private function insertMacroscopy($reportId, $data)
  {
    if (empty($data) || empty($data["macroscopy"])) return;

    $macroscopy = $data["macroscopy"];

    // Specimen Type
    if (!empty($macroscopy['specimen_type'])) {
      $st = $macroscopy['specimen_type'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_specimen_type (report_id, core_needle_biopsy, wide_local_excision, mastectomy, open_biopsy, segmental_excision, wide_bore_needle_biopsy) VALUES (:report_id, :core_needle_biopsy, :wide_local_excision, :mastectomy, :open_biopsy, :segmental_excision, :wide_bore_needle_biopsy)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':core_needle_biopsy' => $st['core_needle_biopsy'] ?? 0,
        ':wide_local_excision' => $st['wide_local_excision'] ?? 0,
        ':mastectomy' => $st['mastectomy'] ?? 0,
        ':open_biopsy' => $st['open_biopsy'] ?? 0,
        ':segmental_excision' => $st['segmental_excision'] ?? 0,
        ':wide_bore_needle_biopsy' => $st['wide_bore_needle_biopsy'] ?? 0
      ]);
    }

    // Specimen Dimensions
    if (!empty($macroscopy['specimen_dimensions'])) {
      $sd = $macroscopy['specimen_dimensions'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_specimen_dimensions (report_id, weight, length, width, height) VALUES (:report_id, :weight, :length, :width, :height)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':weight' => $sd['weight'],
        ':length' => $sd['length'],
        ':width' => $sd['width'],
        ':height' => $sd['height']
      ]);
    }

    // Axillary Procedure
    if (!empty($macroscopy['axillary_procedure'])) {
      $ap = $macroscopy['axillary_procedure'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_axillary_procedure (report_id, no_lymph_node_procedure, axillary_node_sample, sentinel_node_biopsy, axillary_node_clearance, intrammary_node) VALUES (:report_id, :no_lymph_node_procedure, :axillary_node_sample, :sentinel_node_biopsy, :axillary_node_clearance, :intrammary_node)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':no_lymph_node_procedure' => $ap['no_lymph_node_procedure'] ?? 0,
        ':axillary_node_sample' => $ap['axillary_node_sample'] ?? 0,
        ':sentinel_node_biopsy' => $ap['sentinel_node_biopsy'] ?? 0,
        ':axillary_node_clearance' => $ap['axillary_node_clearance'] ?? 0,
        ':intrammary_node' => $ap['intrammary_node'] ?? 0
      ]);
    }
  }

  private function insertMicroscopy($reportId, $data)
  {
    if (empty($data) || empty($data["microscopy"])) return;

    $microscopy = $data["microscopy"];

    // In Situ Carcinoma
    if (!empty($microscopy['in_situ_carcinoma'])) {
      $isc = $microscopy['in_situ_carcinoma'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_in_situ_carcinoma (report_id, ductal_carcinoma_in_situ, lobular_carcinoma_in_situ, paget_disease, microinvasion) VALUES (:report_id, :ductal_carcinoma_in_situ, :lobular_carcinoma_in_situ, :paget_disease, :microinvasion)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':ductal_carcinoma_in_situ' => $isc['ductal_carcinoma_in_situ'],
        ':lobular_carcinoma_in_situ' => $isc['lobular_carcinoma_in_situ'] ?? 0,
        ':paget_disease' => $isc['paget_disease'] ?? 0,
        ':microinvasion' => $isc['microinvasion'] ?? 0
      ]);
    }

    // Invasive Carcinoma
    if (!empty($microscopy['invasive_carcinoma'])) {
      $ic = $microscopy['invasive_carcinoma'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_invasive_carcinoma (report_id, ic_present, invasive_tumor_size, whole_tumor_size, ic_type, invasive_grade, sbr_score, tumour_extent, lympho_vascular_invasion, site_of_other_nodes)  VALUES (:report_id, :ic_present, :invasive_tumor_size, :whole_tumor_size, :ic_type,  :invasive_grade, :sbr_score, :tumour_extent, :lympho_vascular_invasion, :site_of_other_nodes)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':ic_present' => $ic['ic_present'] ?? null,
        ':invasive_tumor_size' => $ic['invasive_tumor_size'] ?? null,
        ':whole_tumor_size' => $ic['whole_tumor_size'] ?? null,
        ':ic_type' => $ic['ic_type'] ?? null,
        ':invasive_grade' => $ic['invasive_grade'] ?? null,
        ':sbr_score' => $ic['sbr_score'] ?? null,
        ':tumour_extent' => $ic['tumour_extent'] ?? null,
        ':lympho_vascular_invasion' => $ic['lympho_vascular_invasion'] ?? null,
        ':site_of_other_nodes' => $ic['site_of_other_nodes'] ?? null
      ]);
    }

    // Axillary Node
    if (!empty($microscopy['axillary_node'])) {
      $an = $microscopy['axillary_node'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_axillary_node (report_id, an_present, total_number, number_positive) VALUES (:report_id, :an_present, :total_number, :number_positive)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':an_present' => $an['an_present'] ?? null,
        ':total_number' => $an['total_number'] ?? null,
        ':number_positive' => $an['number_positive'] ?? null
      ]);
    }

    // Margin
    if (!empty($microscopy['margin'])) {
      $m = $microscopy['margin'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_margin (report_id, excision_margins, skin_involvement, nipple_involvement,  skeletal_muscle_involvement, surgical_margins) VALUES (:report_id, :excision_margins, :skin_involvement, :nipple_involvement,  :skeletal_muscle_involvement, :surgical_margins)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':excision_margins' => $m['excision_margins'],
        ':skin_involvement' => $m['skin_involvement'] ?? null,
        ':nipple_involvement' => $m['nipple_involvement'] ?? null,
        ':skeletal_muscle_involvement' => $m['skeletal_muscle_involvement'] ?? null,
        ':surgical_margins' => $m['surgical_margins'] ?? null
      ]);
    }

    // Other Margins
    if (!empty($microscopy['surgical_margins_actual'])) {
      $om = $microscopy['surgical_margins_actual'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_surgical_margins_actual (report_id, superior, inferior, anterior, posterior, lateral, medial)VALUES (:report_id, :superior, :inferior, :anterior, :posterior, :lateral, :medial)");

      $stmt->execute([
        ':report_id' => $reportId,
        ':superior' => $om['superior'] ?? 0,
        ':inferior' => $om['inferior'] ?? 0,
        ':anterior' => $om['anterior'] ?? 0,
        ':posterior' => $om['posterior'] ?? 0,
        ':lateral' => $om['lateral'] ?? 0,
        ':medial' => $om['medial'] ?? 0
      ]);
    }

    // Pathological Staging
    if (!empty($microscopy['pathological_staging'])) {
      $ps = $microscopy['pathological_staging'];
      $stmt = $this->pdo->prepare("INSERT INTO $this->report_pathological_staging (report_id, not_applicable, pt, n, m)VALUES (:report_id, :not_applicable, :pt, :n, :m)");
      $stmt->execute([
        ':report_id' => $reportId,
        ':not_applicable' => $ps['not_applicable'],
        ':pt' => $ps['pt'],
        ':n' => $ps['n'],
        ':m' => $ps['m']
      ]);
    }
  }


  public function createReport($reportData)
  {
    try {
      $this->pdo->beginTransaction();
      $reportId = $reportData['id'] ?? generateUUID();

      // Insert main report
      $stmt = $this->pdo->prepare("INSERT INTO $this->table (id, rev, patient_id) VALUES (:id, :rev, :patient_id) ");

      $stmt->execute([
        ':id' => $reportId,
        ':rev' => $reportData['rev'] ?? null,
        ':patient_id' => $reportData['patient_id'] ??  $reportData["initial_details"]['patient_id']
      ]);



      $this->pdo->commit();

      $this->insertInitialDetails($reportId, $reportData);
      $this->insertPathologistReport($reportId, $reportData);
      $this->insertMacroscopy($reportId, $reportData);
      $this->insertMicroscopy($reportId, $reportData);
      $this->insertIHC($reportId, $reportData);


      $result = array(
        'message' => 'Report created successfully',
        'status' => 'success',
        'data' => array(
          'report_id' => $reportId
        )
      );

      return success_handler($result, 201);
    } catch (Exception $e) {
      $this->pdo->rollBack();
      return error_handler("Failed to create report " . $e->getMessage(), 400);
    }
  }

  public function getReportById($reportId)
  {
    try {
      // Get main report
      $stmt = $this->pdo->prepare("SELECT * FROM $this->table WHERE id = :id");
      $stmt->execute([':id' => $reportId]);
      $report = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$report) {
        return error_handler("Report not found", 404);
      }

      // Get all related data
      $report['initial_details'] = $this->getInitialDetails($reportId);
      $report['macroscopy'] = $this->getMacroscopy($reportId);
      $report['microscopy'] = $this->getMicroscopy($reportId);
      $report['ihc'] = $this->getIHC($reportId);
      $report['pathologist_report'] = $this->getPathologistReport($reportId);

      return success_handler(['data' => $report], 200);
    } catch (Exception $e) {
      return error_handler("Failed to get report: " . $e->getMessage(), 400);
    }
  }

  public function updateReportById($reportId, $reportData)
  {
    try {
      $this->pdo->beginTransaction();

      // Update main report
      $stmt = $this->pdo->prepare("UPDATE $this->table SET rev = :rev, patient_id = :patient_id, updated_at = CURRENT_TIMESTAMP WHERE id = :id");

      $stmt->execute([
        ':id' => $reportId,
        ':rev' => $reportData['rev'] ?? null,
        ':patient_id' => $reportData['patient_id']
      ]);

      // Update related data (delete and recreate for simplicity)
      $this->deleteRelatedData($reportId);
      $this->insertInitialDetails($reportId, $reportData['initial_details'] ?? []);
      $this->insertMacroscopy($reportId, $reportData['macroscopy'] ?? []);
      $this->insertMicroscopy($reportId, $reportData['microscopy'] ?? []);
      $this->insertIHC($reportId, $reportData['ihc'] ?? []);
      $this->insertPathologistReport($reportId, $reportData['pathologist_report'] ?? []);

      $this->pdo->commit();

      return success_handler("Report Updated", 200);
    } catch (Exception $e) {
      $this->pdo->rollBack();
      return error_handler("Failed to update report: " . $e->getMessage(), 400);
    }
  }

  public function deleteReport($reportId)
  {
    try {
      $stmt = $this->pdo->prepare("DELETE FROM $this->table WHERE id = :id");
      $stmt->execute([':id' => $reportId]);

      return success_handler([], 204);
    } catch (Exception $e) {
      return error_handler("Failed to delete report: " . $e->getMessage(), 400);
    }
  }

  public function getReports()
  {
    $limit = isset($_GET['page_size']) ? (int)$_GET['page_size'] : 10;
    $offset = isset($_GET['page']) ? (int)$_GET['page'] : 0;
    $patientId = $_GET['patient_id'] ?? null;

    // Calculate current page
    $currentPage = floor(($offset / $limit) + 1);

    try {
      // First, get the total count
      $countSql = "SELECT COUNT(*) as total FROM reports r";
      $countParams = [];

      if ($patientId !== null) {
        $countSql .= " WHERE r.patient_id = :patient_id";
        $countParams[':patient_id'] = $patientId;
      }

      $countStmt = $this->pdo->prepare($countSql);

      foreach ($countParams as $key => $value) {
        $countStmt->bindValue($key, $value, PDO::PARAM_STR);
      }

      $countStmt->execute();
      $total = (int)$countStmt->fetchColumn();

      // Build main query for fetching reports
      $sql = "SELECT r.*, rid.hospital_number, rid.histology_number, rid.reporting_date, rpr.consultant_pathologist, rpr.final_diagnosis, rpr.comment FROM reports r LEFT JOIN report_initial_details rid ON r.id = rid.report_id LEFT JOIN $this->report_pathologist_report rpr ON r.id = rpr.report_id";

      $params = [];

      // Add WHERE clause only if patient_id is provided
      if ($patientId !== null) {
        $sql .= " WHERE r.patient_id = :patient_id";
        $params[':patient_id'] = $patientId;
      }

      $sql .= " ORDER BY r.created_at DESC LIMIT :limit OFFSET :offset";

      $stmt = $this->pdo->prepare($sql);

      // Bind parameters
      foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
      }

      // Bind limit and offset as integers
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

      $stmt->execute();
      $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // Calculate pagination info
      $totalPages = ceil($total / $limit);
      $nextPage = ($currentPage) < $totalPages ? ($currentPage + 1) : null;
      $prevPage = ($currentPage) > 1 ? floor($currentPage - 1) : null;

      // Prepare response data
      $responseData = [
        'data' => $reports,
        'page' => (int)$currentPage,
        'total' => $total,
        'next_page' => $nextPage,
        'prev_page' => $prevPage
      ];

      // Return success response
      return success_handler($responseData, 200);
    } catch (Exception $e) {
      return error_handler("Failed to get reports: " . $e->getMessage(), 400);
    }
  }
}
