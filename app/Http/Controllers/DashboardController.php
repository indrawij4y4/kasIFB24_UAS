<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request)
    {
        // Cache the dashboard stats for 1 minute (60 seconds) for balance between performance and freshness
        // Note: Cache is automatically invalidated by Pemasukan/Pengeluaran/Settings updates
        return \Illuminate\Support\Facades\Cache::remember('dashboard_stats', 60, function () {
            $now = now();
            $currentMonth = $now->month;
            $currentYear = $now->year;

            // Total Income (All Time)
            $totalIncome = Pemasukan::sum('nominal');

            // Total Expense (All Time)
            $totalExpense = Pengeluaran::sum('nominal');

            // Current Balance
            $balance = $totalIncome - $totalExpense;

            // Income This Month
            $incomeThisMonth = Pemasukan::forPeriod($currentMonth, $currentYear)->sum('nominal');

            // Expense This Month
            $expenseThisMonth = Pengeluaran::forPeriod($currentMonth, $currentYear)->sum('nominal');

            // Arrears Count (users who haven't paid full for current month)
            $weeklyFee = Setting::getPeriodFee($currentMonth, $currentYear);
            $weeksPerMonth = Setting::getPeriodWeeks($currentMonth, $currentYear);

            // Get all users (including admin) with their payments for this month
            // Eager load only necessary data
            $users = User::query()
                ->with([
                    'pemasukan' => function ($query) use ($currentMonth, $currentYear) {
                        $query->where('bulan', $currentMonth)->where('tahun', $currentYear);
                    }
                ])
                ->get();

            $arrearsCount = 0;
            foreach ($users as $user) {
                $payments = $user->pemasukan;

                // Check each week
                for ($week = 1; $week <= $weeksPerMonth; $week++) {
                    // Check total paid for this week, handling multiple records
                    $weekPaid = $payments->where('minggu_ke', $week)->sum('nominal');
                    if ($weekPaid < $weeklyFee) {
                        $arrearsCount++;
                        break; // Count user once even if multiple weeks unpaid
                    }
                }
            }

            return response()->json([
                'balance' => (float) $balance,
                'total_income' => (float) $totalIncome,
                'income_this_month' => (float) $incomeThisMonth,
                'expense_this_month' => (float) $expenseThisMonth,
                'arrears_count' => $arrearsCount,
            ]);
        });
    }
}
