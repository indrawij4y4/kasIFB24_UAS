<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PemasukanController extends Controller
{
    /**
     * Get all pemasukan with optional period filter
     */
    public function index(Request $request)
    {
        $query = Pemasukan::with('user:id,nim,nama')
            ->orderBy('created_at', 'desc');

        // Apply period filter if provided
        if ($request->has('bulan') && $request->has('tahun')) {
            $query->where('bulan', $request->bulan)
                ->where('tahun', $request->tahun);
        }

        $pemasukan = $query->get();

        // Format response with detailed info
        $formatted = $pemasukan->map(function ($p) {
            return [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'nama' => $p->user->nama ?? 'Unknown',
                'nim' => $p->user->nim ?? '-',
                'bulan' => $p->bulan,
                'tahun' => $p->tahun,
                'minggu_ke' => $p->minggu_ke,
                'nominal' => (float) $p->nominal,
                'tanggal' => $p->created_at ? $p->created_at->format('Y-m-d') : null,
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    /**
     * Get payment matrix for a specific month/year
     */
    public function matrix(Request $request)
    {
        $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        // Get all users (including admin) with their payments for this period
        $users = User::query()
            ->with([
                'pemasukan' => function ($query) use ($bulan, $tahun) {
                    $query->where('bulan', $bulan)->where('tahun', $tahun);
                }
            ])
            ->orderBy('nama')
            ->get();

        $weeksPerMonth = Setting::getWeeksPerMonth();

        $matrix = $users->map(function ($user) use ($weeksPerMonth) {
            $payments = $user->pemasukan->keyBy('minggu_ke');

            $data = [
                'id' => $user->id,
                'nim' => $user->nim,
                'nama' => $user->nama,
                'm1' => (float) ($payments->get(1)?->nominal ?? 0),
                'm2' => (float) ($payments->get(2)?->nominal ?? 0),
                'm3' => (float) ($payments->get(3)?->nominal ?? 0),
                'm4' => (float) ($payments->get(4)?->nominal ?? 0),
                'm5' => (float) ($payments->get(5)?->nominal ?? 0),
            ];

            return $data;
        });

        return response()->json($matrix);
    }

    /**
     * Get personal payment history for logged-in user
     */
    public function myPayments(Request $request)
    {
        $user = $request->user();

        $payments = Pemasukan::where('user_id', $user->id)
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->orderBy('minggu_ke', 'asc')
            ->get();

        return response()->json($payments);
    }

    /**
     * Store a new payment (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
            'minggu_ke' => 'required|integer|min:1|max:5',
            'nominal' => 'required|numeric|min:0',
        ]);

        // Check for existing payment
        $existing = Pemasukan::where('user_id', $request->user_id)
            ->where('bulan', $request->bulan)
            ->where('tahun', $request->tahun)
            ->where('minggu_ke', $request->minggu_ke)
            ->first();

        if ($existing) {
            $user = User::find($request->user_id);
            $monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            $monthName = $monthNames[$request->bulan - 1] ?? $request->bulan;

            return response()->json([
                'message' => "Pembayaran untuk {$user->nama} pada {$monthName} {$request->tahun} Minggu {$request->minggu_ke} sudah tercatat sebelumnya. Tidak dapat menambahkan data duplikat.",
            ], 422);
        }

        $pemasukan = Pemasukan::create([
            'user_id' => $request->user_id,
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'minggu_ke' => $request->minggu_ke,
            'nominal' => $request->nominal,
        ]);

        $pemasukan->load('user:id,nim,nama');

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        // Invalidate arrears cache for this period
        $arrearsCacheKey = "arrears_list_{$request->bulan}_{$request->tahun}";
        Cache::forget($arrearsCacheKey);

        return response()->json([
            'message' => 'Pembayaran berhasil disimpan',
            'data' => $pemasukan,
        ], 201);
    }

    /**
     * Update a payment (Admin only)
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'nominal' => 'required|numeric|min:0',
        ]);

        $pemasukan = Pemasukan::findOrFail($id);

        $pemasukan->update([
            'nominal' => $request->nominal,
        ]);

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        // Invalidate arrears cache for this period
        $arrearsCacheKey = "arrears_list_{$pemasukan->bulan}_{$pemasukan->tahun}";
        Cache::forget($arrearsCacheKey);

        return response()->json([
            'message' => 'Pembayaran berhasil diupdate',
            'data' => $pemasukan,
        ]);
    }

    /**
     * Delete a payment (Admin only)
     */
    public function destroy(int $id)
    {
        $pemasukan = Pemasukan::findOrFail($id);
        // Get period info before delete
        $bulan = $pemasukan->bulan;
        $tahun = $pemasukan->tahun;

        $pemasukan->delete();

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        // Invalidate arrears cache for this period
        $arrearsCacheKey = "arrears_list_{$bulan}_{$tahun}";
        Cache::forget($arrearsCacheKey);

        return response()->json([
            'message' => 'Pembayaran berhasil dihapus',
        ]);
    }
}
