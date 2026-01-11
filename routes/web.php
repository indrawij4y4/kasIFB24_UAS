<?php

use Illuminate\Support\Facades\Route;

// API Routes are handled in routes/api.php

// Serve React App for any other route *except* API routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api\/).*$');
