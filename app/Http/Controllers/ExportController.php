<?php

namespace App\Http\Controllers;

use App\Exports\KartuKendaliExport;
use App\Exports\LaporanGlobalExport;
use App\Exports\LaporanPengeluaranExport;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    /**
     * Helper to get Indonesian month name
     */
    private function getMonthName(int $month): string
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        return $months[$month] ?? '';
    }

    /**
     * Export global income report (accessible to all users)
     */
    public function global(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $bulan = (int) $request->input('bulan');
        $tahun = (int) $request->input('tahun');
        $format = $request->input('format');

        $monthName = $this->getMonthName($bulan);
        $filename = "Laporan_Pemasukan_{$monthName}_{$tahun}";

        if ($format === 'excel') {
            return Excel::download(
                new LaporanGlobalExport($bulan, $tahun),
                "{$filename}.xlsx"
            );
        }

        // PDF export
        $export = new LaporanGlobalExport($bulan, $tahun);
        $data = [
            'bulan' => $monthName,
            'tahun' => $tahun,
            'data' => $export->collection(),
            'settings' => [
                'weekly_fee' => Setting::getWeeklyFee(),
                'weeks_per_month' => Setting::getWeeksPerMonth(),
            ],
        ];

        $pdf = Pdf::loadView('exports.laporan-global', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->download("{$filename}.pdf");
    }

    /**
     * Export pengeluaran (expense) report (accessible to all users)
     */
    public function pengeluaran(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $bulan = (int) $request->input('bulan');
        $tahun = (int) $request->input('tahun');
        $format = $request->input('format');

        $monthName = $this->getMonthName($bulan);
        $filename = "Laporan_Pengeluaran_{$monthName}_{$tahun}";

        if ($format === 'excel') {
            return Excel::download(
                new LaporanPengeluaranExport($bulan, $tahun),
                "{$filename}.xlsx"
            );
        }

        // PDF export
        $export = new LaporanPengeluaranExport($bulan, $tahun);
        $data = [
            'bulan' => $monthName,
            'tahun' => $tahun,
            'data' => $export->collection(),
        ];

        $pdf = Pdf::loadView('exports.laporan-pengeluaran', $data);
        return $pdf->download("{$filename}.pdf");
    }

    /**
     * Export personal payment history
     */
    public function personal(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'bulan' => 'sometimes|integer|min:1|max:12',
            'tahun' => 'sometimes|integer|min:2020|max:2099',
        ]);

        $user = $request->user();
        $format = $request->input('format');
        $bulan = $request->input('bulan') ? (int) $request->input('bulan') : null;
        $tahun = $request->input('tahun') ? (int) $request->input('tahun') : null;

        // Sanitize name for filename
        $safeName = preg_replace('/[^a-zA-Z0-9\s]/', '', $user->nama);
        $safeName = str_replace(' ', '_', $safeName);

        $filename = "Kartu_Kendali_{$safeName}";

        if ($bulan && $tahun) {
            $monthName = $this->getMonthName($bulan);
            $filename .= "_{$monthName}_{$tahun}";
        }

        if ($format === 'excel') {
            return Excel::download(
                new KartuKendaliExport($user->id, $bulan, $tahun),
                "{$filename}.xlsx"
            );
        }

        // PDF export
        $export = new KartuKendaliExport($user->id, $bulan, $tahun);
        $data = [
            'user' => $user,
            'data' => $export->collection(),
        ];

        $pdf = Pdf::loadView('exports.kartu-kendali', $data);
        return $pdf->download("{$filename}.pdf");
    }
}
