<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login with NIM and password
     */
    public function login(Request $request)
    {
        $request->validate([
            'nim' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('nim', $request->nim)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'nim' => ['NIM atau password salah.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'nim' => $user->nim,
                'nama' => $user->nama,
                'role' => $user->role,
                'needs_password_change' => $user->needsPasswordChange(),
            ],
        ]);
    }

    /**
     * Logout and revoke token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'nim' => $user->nim,
            'nama' => $user->nama,
            'role' => $user->role,
            'needs_password_change' => $user->needsPasswordChange(),
        ]);
    }

    /**
     * Change password (required for first login)
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama salah.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'status_password' => true,
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah',
        ]);
    }

    /**
     * Reset user password to default (NIM) - Admin only
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        $user->update([
            'password' => Hash::make($user->nim),
            'status_password' => false,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset ke NIM',
            'user' => [
                'nim' => $user->nim,
                'nama' => $user->nama,
            ],
        ]);
    }
}
