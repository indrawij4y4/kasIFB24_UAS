<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithTokenQuery
{
    /**
     * Handle an incoming request.
     * This middleware authenticates users via a token query parameter.
     * Used for file download endpoints where Authorization header can't be set.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->query('token');

        if (!$token) {
            return response()->json(['message' => 'Token tidak ditemukan'], 401);
        }

        // Find the token in database
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Token tidak valid'], 401);
        }

        // Set the authenticated user
        $user = $accessToken->tokenable;
        auth()->setUser($user);

        return $next($request);
    }
}
