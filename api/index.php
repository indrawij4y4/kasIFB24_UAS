<?php

// Set the document root for Vercel
$_SERVER['DOCUMENT_ROOT'] = __DIR__ . '/../public';

// Change to Laravel's public directory
chdir(__DIR__ . '/../public');

// Handle the request through Laravel's entry point
require __DIR__ . '/../public/index.php';
