<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for handling Cross-Origin Resource Sharing (CORS) for API requests.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'https://indrawij4y4.github.io',
        'https://www.indrawij4y4.github.io',
        'https://kas-ifb-24-uas.vercel.app', // Allow backend own domain just in case
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        '*', // Try wildcard if tokens don't use credentials (cookies)
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
