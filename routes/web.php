<?php

use Illuminate\Support\Facades\Route;

// API Routes are handled in routes/api.php

// Serve React App for frontend routes only
// Exclude: /api/*, /up, /?debug*, and other Laravel routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|up|sanctum|debug).*$');
