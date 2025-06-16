<?php
require_once __DIR__ . "/../models/report.php";

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse the path to extract route and parameters
$parsedUrl = parse_url($path);
$route = $parsedUrl['path'];

// Remove any base path if your API is in a subdirectory
// Adjust this based on your actual path structure
$route = str_replace('/api/v1', '', $route);

// Extract ID from route if present
$segments = explode('/', trim($route, '/'));
$reportId = null;

if (count($segments) >= 2 && $segments[0] === 'reports' && !empty($segments[1])) {
  $reportId = $segments[1];
}

// Initialize Report model
$report = new Report();

switch ($method) {
  case 'GET':
    if ($reportId) {
      // GET /reports/:id - Get single report
      return $report->getReportById($reportId);
    }
    return $report->getReports();

  case 'POST':
    // POST /reports - Create new report
    $input = get_json_input();

    if (!$input) {
      error_handler("Invalid JSON data", 400);
      break;
    }

    return $report->createReport($input);

  case 'PUT':
    // PUT /reports/:id - Update existing report
    if (!$reportId) {
      error_handler("Report ID is required", 400);
      break;
    }

    $input = get_json_input();

    if (!$input) {
      error_handler("Invalid JSON data", 400);
      break;
    }

    return $report->updateReportById($reportId, $input);

  case 'DELETE':
    if (!$reportId) {
      error_handler("Report ID is required", 400);
      break;
    }

    return $report->deleteReport($reportId);

  default:
    error_handler("Method not allowed", 405);
    break;
}
