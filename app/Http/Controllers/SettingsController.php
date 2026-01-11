<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index(Request $request)
    {
        $month = $request->query('month');
        $year = $request->query('year');

        return response()->json([
            'weekly_fee' => Setting::getPeriodFee($month, $year),
            'weeks_per_month' => Setting::getPeriodWeeks($month, $year),
            'is_configured' => $month && $year ? Setting::hasPeriodValue('weekly_fee', $month, $year) : false,
        ]);
    }

    /**
     * Update settings (Admin only)
     */
    public function update(Request $request)
    {
        $request->validate([
            'weekly_fee' => 'sometimes|integer|min:0',
            'weeks_per_month' => 'sometimes|integer|min:1|max:5',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020|max:2099',
        ]);

        $month = $request->input('month');
        $year = $request->input('year');

        if ($month && $year) {
            // Update period-specific settings
            if ($request->has('weekly_fee')) {
                Setting::setPeriodValue('weekly_fee', $request->weekly_fee, $month, $year);
            }
            if ($request->has('weeks_per_month')) {
                Setting::setPeriodValue('weeks_per_month', $request->weeks_per_month, $month, $year);
            }
        } else {
            // Update global settings
            if ($request->has('weekly_fee')) {
                Setting::setValue('weekly_fee', $request->weekly_fee);
            }
            if ($request->has('weeks_per_month')) {
                Setting::setValue('weeks_per_month', $request->weeks_per_month);
            }
        }

        // Invalidate Arrears Cache
        if ($month && $year) {
            Cache::forget("arrears_list_{$month}_{$year}");
        } else {
            $currentYear = now()->year;
            $nextYear = $currentYear + 1;
            for ($m = 1; $m <= 12; $m++) {
                Cache::forget("arrears_list_{$m}_{$currentYear}");
                Cache::forget("arrears_list_{$m}_{$nextYear}");
            }
            Cache::forget('dashboard_stats');
        }

        return response()->json([
            'message' => 'Pengaturan berhasil diupdate',
            'data' => [
                'weekly_fee' => Setting::getPeriodFee($month, $year),
                'weeks_per_month' => Setting::getPeriodWeeks($month, $year),
            ],
        ]);
    }
}
