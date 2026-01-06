<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'nim', 'nama', 'role', 'status_password', 'created_at')
            ->orderBy('nim')
            ->get();

        return response()->json($users);
    }

    /**
     * Get specific user details (Admin only)
     */
    public function show(Request $request, int $id)
    {
        $user = User::with([
            'pemasukan' => function ($query) {
                $query->orderBy('tahun', 'desc')
                    ->orderBy('bulan', 'desc')
                    ->orderBy('minggu_ke', 'asc');
            }
        ])->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'nim' => $user->nim,
            'nama' => $user->nama,
            'role' => $user->role,
            'status_password' => $user->status_password,
            'pemasukan' => $user->pemasukan,
        ]);
    }
}
