<?php
// Allow all origins (change "*" to a specific domain if needed)
header("Access-Control-Allow-Origin: *");

// Allow common HTTP methods
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

// Allow common headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . "/../config.php";

$request_uri = $_SERVER['REQUEST_URI'] ?? '';

switch (true) {
  case preg_match("#^/api/v1/reports(?:/[^/?]+)?(?:\?.*)?$#", $request_uri):
    require_once __DIR__ . '/../controllers/reports.php';
    break;

  case preg_match("#^/api/v1/institutions(?:/[^/?]+)?(?:\?.*)?$#", $request_uri):
    require_once __DIR__ . '/../controllers/institutions.php';
    break;

  case preg_match("#^/api/v1/patients(?:/[^/?]+)?(?:\?.*)?$#", $request_uri):
    require_once __DIR__ . '/../controllers/users.php';
    break;

  default:
    http_response_code(404);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Route not found", "request_uri" => $request_uri]);
    break;
}