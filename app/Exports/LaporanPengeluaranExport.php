<?php

namespace App\Exports;

use App\Models\Pengeluaran;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanPengeluaranExport implements FromCollection, WithHeadings, WithTitle, WithStyles
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
        $pengeluaran = Pengeluaran::forPeriod($this->bulan, $this->tahun)
            ->orderBy('tanggal', 'desc')
            ->get();

        return $pengeluaran->map(function ($item) {
            $tanggal = $item->tanggal instanceof Carbon
                ? $item->tanggal
                : Carbon::parse($item->tanggal);

            return [
                'tanggal' => $tanggal->format('d/m/Y'),
                'judul' => $item->judul,
                'nominal' => (float) $item->nominal,
            ];
        });
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Tanggal',
            'Keterangan',
            'Nominal (Rp)',
        ];
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

        return "Pengeluaran {$months[$this->bulan]} {$this->tahun}";
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
