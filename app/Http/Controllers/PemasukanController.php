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
                'created_at' => $p->created_at,
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


        $matrix = $users->map(function ($user) {
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
            // Check if existing payment is partial (less than new nominal)
            if ((float) $existing->nominal < (float) $request->nominal) {
                $existing->update([
                    'nominal' => $request->nominal
                ]);

                // Invalidate caches
                Cache::forget('dashboard_stats');
                $bulanInt = (int) $request->bulan;
                $tahunInt = (int) $request->tahun;
                Cache::forget("arrears_list_{$bulanInt}_{$tahunInt}");

                return response()->json([
                    'message' => 'Pembayaran berhasil diperbarui (pelunasan).',
                    'data' => $existing,
                ], 200);
            }

            // Idempotency check: If record exists and is fully paid, treat as success
            return response()->json([
                'message' => 'Pembayaran sudah tercatat sebelumnya.',
                'data' => $existing,
            ], 200);
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
        $bulanInt = (int) $request->bulan;
        $tahunInt = (int) $request->tahun;
        $arrearsCacheKey = "arrears_list_{$bulanInt}_{$tahunInt}";
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
        $bulanInt = (int) $pemasukan->bulan;
        $tahunInt = (int) $pemasukan->tahun;
        $arrearsCacheKey = "arrears_list_{$bulanInt}_{$tahunInt}";
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
        $bulanInt = (int) $bulan;
        $tahunInt = (int) $tahun;
        $arrearsCacheKey = "arrears_list_{$bulanInt}_{$tahunInt}";
        Cache::forget($arrearsCacheKey);

        return response()->json([
            'message' => 'Pembayaran berhasil dihapus',
        ]);
    }

    /**
     * Bulk Store payments (Pay All remaining weeks for a month)
     */
    public function bulkStore(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $userId = $request->user_id;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        // Get configuration
        $weeklyFee = Setting::getPeriodFee($bulan, $tahun);
        $weeksPerMonth = Setting::getPeriodWeeks($bulan, $tahun);

        if ($weeklyFee <= 0) {
            return response()->json(['message' => 'Biaya mingguan belum dikonfigurasi untuk periode ini.'], 400);
        }

        // Get existing payments keyed by week
        $existingPayments = Pemasukan::where('user_id', $userId)
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->get()
            ->keyBy('minggu_ke');

        $createdCount = 0;
        $updatedCount = 0;
        $totalNominal = 0;

        // Loop through all expected weeks
        for ($week = 1; $week <= $weeksPerMonth; $week++) {
            $existing = $existingPayments->get($week);

            if ($existing) {
                // If exists but partial/underpaid, update it
                if ((float) $existing->nominal < (float) $weeklyFee) {
                    $existing->update(['nominal' => $weeklyFee]);
                    $updatedCount++;
                    $totalNominal += ($weeklyFee - $existing->nominal);
                }
                continue;
            }

            Pemasukan::create([
                'user_id' => $userId,
                'bulan' => $bulan,
                'tahun' => $tahun,
                'minggu_ke' => $week,
                'nominal' => $weeklyFee,
            ]);

            $createdCount++;
            $totalNominal += $weeklyFee;
        }

        if ($createdCount === 0 && $updatedCount === 0) {
            return response()->json(['message' => 'Semua minggu sudah lunas.'], 200);
        }

        // Invalidate caches
        Cache::forget('dashboard_stats');
        $bulanInt = (int) $bulan;
        $tahunInt = (int) $tahun;
        $arrearsCacheKey = "arrears_list_{$bulanInt}_{$tahunInt}";
        Cache::forget($arrearsCacheKey);

        return response()->json([
            'message' => "Berhasil melunasi {$createdCount} minggu.",
            'weeks_paid' => $createdCount,
            'total_amount' => $totalNominal
        ], 201);
    }
}
