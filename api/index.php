<?php

// Enable maximum error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Set base path for Vercel
$basePath = dirname(__DIR__);

// Vercel serverless: Create writable directories in /tmp BEFORE loading Laravel
if (getenv('VERCEL') || isset($_ENV['VERCEL'])) {
    $tmpBase = '/tmp';

    // Create all required directories
    $dirs = [
        $tmpBase . '/storage',
        $tmpBase . '/storage/app',
        $tmpBase . '/storage/app/public',
        $tmpBase . '/storage/framework',
        $tmpBase . '/storage/framework/cache',
        $tmpBase . '/storage/framework/sessions',
        $tmpBase . '/storage/framework/views',
        $tmpBase . '/storage/logs',
        $tmpBase . '/bootstrap/cache',
    ];

    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    // Set environment variables to override Laravel paths
    putenv('APP_STORAGE_PATH=' . $tmpBase . '/storage');
    $_ENV['APP_STORAGE_PATH'] = $tmpBase . '/storage';

    // Also need to handle bootstrap/cache - symlink or copy
    $bootstrapCacheSource = $basePath . '/bootstrap/cache';
    $bootstrapCacheTmp = $tmpBase . '/bootstrap/cache';

    // Copy any existing cache files
    if (is_dir($bootstrapCacheSource)) {
        $files = glob($bootstrapCacheSource . '/*.php');
        foreach ($files as $file) {
            $dest = $bootstrapCacheTmp . '/' . basename($file);
            if (!file_exists($dest)) {
                @copy($file, $dest);
            }
        }
    }
}

// Wrap everything in try-catch to capture any errors
try {
    // Debug endpoint
    if (isset($_GET['debug'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'base_path' => $basePath,
            'autoload_exists' => file_exists($basePath . '/vendor/autoload.php'),
            'bootstrap_exists' => file_exists($basePath . '/bootstrap/app.php'),
            'php_version' => PHP_VERSION,
            'vercel' => getenv('VERCEL') ?: 'not set',
            'tmp_storage_exists' => is_dir('/tmp/storage'),
            'tmp_storage_writable' => is_writable('/tmp/storage'),
            'tmp_bootstrap_cache_exists' => is_dir('/tmp/bootstrap/cache'),
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // Check autoload
    $autoloadPath = $basePath . '/vendor/autoload.php';
    if (!file_exists($autoloadPath)) {
        throw new Exception('Autoload not found: ' . $autoloadPath);
    }

    define('LARAVEL_START', microtime(true));

    // Register the Composer autoloader
    require $autoloadPath;

    // Bootstrap Laravel
    $app = require_once $basePath . '/bootstrap/app.php';

    // Override storage path for Vercel
    if (getenv('VERCEL') || isset($_ENV['VERCEL'])) {
        $app->useStoragePath('/tmp/storage');
    }

    // Handle request
    $app->handleRequest(\Illuminate\Http\Request::capture());

} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => explode("\n", $e->getTraceAsString())
    ], JSON_PRETTY_PRINT);
}
