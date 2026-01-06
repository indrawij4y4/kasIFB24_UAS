<?php

namespace App\Exports;

use App\Models\Pemasukan;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KartuKendaliExport implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected int $userId;
    protected ?int $bulan;
    protected ?int $tahun;

    public function __construct(int $userId, ?int $bulan = null, ?int $tahun = null)
    {
        $this->userId = $userId;
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Pemasukan::where('user_id', $this->userId)
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->orderBy('minggu_ke', 'asc');

        if ($this->bulan && $this->tahun) {
            $query->forPeriod($this->bulan, $this->tahun);
        }

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

        return $query->get()->map(function ($payment) use ($months) {
            return [
                'bulan' => $months[$payment->bulan],
                'tahun' => $payment->tahun,
                'minggu_ke' => "Minggu {$payment->minggu_ke}",
                'nominal' => (float) $payment->nominal,
                'tanggal' => $payment->created_at->format('d/m/Y'),
            ];
        });
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Bulan',
            'Tahun',
            'Minggu',
            'Nominal (Rp)',
            'Tanggal Bayar',
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        $user = User::find($this->userId);
        return "Kartu Kendali - {$user->nama}";
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
