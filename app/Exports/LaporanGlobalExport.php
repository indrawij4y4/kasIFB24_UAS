<?php

namespace App\Exports;

use App\Models\Pemasukan;
use App\Models\Setting;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanGlobalExport implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected int $bulan;
    protected int $tahun;

    public function __construct(int $bulan, int $tahun)
    {
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $users = User::query()
            ->orderBy('nama')
            ->get();

        $weeksPerMonth = Setting::getWeeksPerMonth();
        $weeklyFee = Setting::getWeeklyFee();

        return $users->map(function ($user) use ($weeksPerMonth, $weeklyFee) {
            $payments = Pemasukan::where('user_id', $user->id)
                ->forPeriod($this->bulan, $this->tahun)
                ->get()
                ->keyBy('minggu_ke');

            $m1 = (float) ($payments->get(1)?->nominal ?? 0);
            $m2 = (float) ($payments->get(2)?->nominal ?? 0);
            $m3 = (float) ($payments->get(3)?->nominal ?? 0);
            $m4 = (float) ($payments->get(4)?->nominal ?? 0);
            $m5 = $weeksPerMonth >= 5 ? (float) ($payments->get(5)?->nominal ?? 0) : 0;

            $total = $m1 + $m2 + $m3 + $m4 + $m5;

            $row = [
                'nim' => $user->nim,
                'nama' => $user->nama,
                'm1' => $m1,
                'm2' => $m2,
                'm3' => $m3,
                'm4' => $m4,
            ];

            if ($weeksPerMonth >= 5) {
                $row['m5'] = $m5;
            }

            $row['total'] = $total;

            return $row;
        });
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        $weeksPerMonth = Setting::getWeeksPerMonth();

        $headings = [
            'NIM',
            'Nama',
            'Minggu 1',
            'Minggu 2',
            'Minggu 3',
            'Minggu 4',
        ];

        if ($weeksPerMonth >= 5) {
            $headings[] = 'Minggu 5';
        }

        $headings[] = 'Total';

        return $headings;
    }

    /**
     * @return string
     */
    public function title(): string
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

        return "Laporan {$months[$this->bulan]} {$this->tahun}";
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
