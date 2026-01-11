<?php

// Enable maximum error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

// Wrap everything in try-catch to capture any errors
try {
    // Set base path for Vercel
    $basePath = dirname(__DIR__);

    // Debug: Output base path
    if (isset($_GET['debug'])) {
        echo "Base Path: " . $basePath . "\n";
        echo "Autoload exists: " . (file_exists($basePath . '/vendor/autoload.php') ? 'YES' : 'NO') . "\n";
        echo "Bootstrap exists: " . (file_exists($basePath . '/bootstrap/app.php') ? 'YES' : 'NO') . "\n";
        echo "PHP Version: " . PHP_VERSION . "\n";
        exit;
    }

    // Check if autoload exists
    $autoloadPath = $basePath . '/vendor/autoload.php';
    if (!file_exists($autoloadPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Autoload not found', 'path' => $autoloadPath]);
        exit;
    }

    define('LARAVEL_START', microtime(true));

    // Register the Composer autoloader
    require $autoloadPath;

    // Check if bootstrap exists
    $bootstrapPath = $basePath . '/bootstrap/app.php';
    if (!file_exists($bootstrapPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Bootstrap not found', 'path' => $bootstrapPath]);
        exit;
    }

    // Bootstrap Laravel
    $app = require_once $bootstrapPath;

    // Handle request
    $app->handleRequest(\Illuminate\Http\Request::capture());

} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
