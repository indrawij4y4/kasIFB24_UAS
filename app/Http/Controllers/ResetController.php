<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ResetController extends Controller
{
    /**
     * Reset all financial data (Pemasukan & Pengeluaran).
     * Also clears settings to start fresh.
     * Admin only.
     */
    public function resetAllData(Request $request)
    {
        // Truncate financial tables
        Pemasukan::truncate();
        Pengeluaran::truncate();

        // Also clear settings table (so admin needs to reconfigure)
        Setting::truncate();

        // Clear all related caches
        Cache::forget('dashboard_stats');

        // Clear arrears cache for common periods (current year and months)
        $currentYear = now()->year;
        for ($month = 1; $month <= 12; $month++) {
            Cache::forget("arrears_list_{$month}_{$currentYear}");
            Cache::forget("arrears_list_{$month}_" . ($currentYear - 1));
            Cache::forget("arrears_list_{$month}_" . ($currentYear + 1));
        }

        return response()->json([
            'message' => 'Semua data pemasukan, pengeluaran, dan pengaturan berhasil dihapus.',
            'success' => true,
        ]);
    }
}
