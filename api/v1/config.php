<?php
$lines = file(__DIR__ . '/./.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($lines as $line) {
  if (strpos(trim($line), '#') === 0) continue;

  list($key, $value) = explode('=', $line, 2);
  putenv(sprintf('%s=%s', $key, $value));
  $_ENV[$key] = $value;
}

// Database configuration
// Database configuration using environment variables
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1'); // Default to localhost if not set
define('DB_USER', getenv('DB_USER') ?: 'root'); // Default to root if not set
define('DB_PASS', getenv('DB_PASS') ?: ''); // Default to an empty password if not set
define('DB_NAME', getenv('DB_NAME') ?: 'breast_protocol'); // Default database name if not set
// define('EMAIL_TO', getenv('EMAIL_TO') ?: 'info@cancerregistry.com'); // Email address to send mail

// Ensure this file is not accessible directly
if (!defined('DB_HOST')) {
  die('Access denied');
}

function generateUUID()
{
  // Generate UUID v4
  $data = random_bytes(16);
  $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
  $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function get_json_input()
{
  $input = file_get_contents('php://input');
  return json_decode($input, true);
}

function success_handler($data, $statusCode = 200)
{
  header("Content-Type: application/json");
  http_response_code($statusCode);
  if ($statusCode == 204) echo null;
  else {
    echo json_encode([
      'success' => true,
      'data' => $data
    ], JSON_PRETTY_PRINT);
  }
  exit;
}

function error_handler($message, $statusCode = 400)
{
  header("Content-Type: application/json");
  http_response_code($statusCode);
  echo json_encode([
    'success' => false,
    'error' => $message
  ], JSON_PRETTY_PRINT);
  exit;
}
