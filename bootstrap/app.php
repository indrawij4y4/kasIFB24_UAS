<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Note: We removed EnsureFrontendRequestsAreStateful to use 
        // pure token-based authentication (no CSRF required)
        // This allows the React frontend to authenticate via Bearer token
    
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'token-query' => \App\Http\Middleware\AuthenticateWithTokenQuery::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
