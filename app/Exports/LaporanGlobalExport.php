<?php

namespace App\Exports;

use App\Models\Pemasukan;
use App\Models\Setting;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class LaporanGlobalExport implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths, WithEvents
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
            ->with([
                'pemasukan' => function ($query) {
                    $query->where('bulan', $this->bulan)
                        ->where('tahun', $this->tahun);
                }
            ])
            ->orderBy('nama')
            ->get();

        $weeksPerMonth = Setting::getPeriodWeeks($this->bulan, $this->tahun);
        $weeklyFee = Setting::getPeriodFee($this->bulan, $this->tahun);

        $data = $users->map(function ($user, $index) use ($weeksPerMonth, $weeklyFee) {
            $payments = $user->pemasukan->keyBy('minggu_ke');

            $m1 = (float) ($payments->get(1)?->nominal ?? 0);
            $m2 = (float) ($payments->get(2)?->nominal ?? 0);
            $m3 = (float) ($payments->get(3)?->nominal ?? 0);
            $m4 = (float) ($payments->get(4)?->nominal ?? 0);
            $m5 = $weeksPerMonth >= 5 ? (float) ($payments->get(5)?->nominal ?? 0) : 0;

            $total = $m1 + $m2 + $m3 + $m4 + $m5;

            $row = [
                'no' => $index + 1,
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

        // Add Total Per Minggu row
        $totalM1 = $data->sum('m1');
        $totalM2 = $data->sum('m2');
        $totalM3 = $data->sum('m3');
        $totalM4 = $data->sum('m4');
        $totalM5 = $weeksPerMonth >= 5 ? $data->sum('m5') : 0;
        $grandTotal = $data->sum('total');

        $totalPerMingguRow = [
            'no' => '',
            'nim' => '',
            'nama' => 'TOTAL PER MINGGU',
            'm1' => $totalM1,
            'm2' => $totalM2,
            'm3' => $totalM3,
            'm4' => $totalM4,
        ];

        if ($weeksPerMonth >= 5) {
            $totalPerMingguRow['m5'] = $totalM5;
        }

        $totalPerMingguRow['total'] = '';

        $data->push($totalPerMingguRow);

        // Add Grand Total row
        $grandTotalRow = [
            'no' => '',
            'nim' => '',
            'nama' => 'TOTAL KESELURUHAN',
            'm1' => '',
            'm2' => '',
            'm3' => '',
            'm4' => '',
        ];

        if ($weeksPerMonth >= 5) {
            $grandTotalRow['m5'] = '';
        }

        $grandTotalRow['total'] = $grandTotal;

        $data->push($grandTotalRow);

        return $data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        $weeksPerMonth = Setting::getPeriodWeeks($this->bulan, $this->tahun);

        $headings = [
            'No',
            'NIM',
            'Nama Mahasiswa',
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
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 15,  // NIM
            'C' => 30,  // Nama
            'D' => 12,  // M1
            'E' => 12,  // M2
            'F' => 12,  // M3
            'G' => 12,  // M4
            'H' => 12,  // M5 or Total
            'I' => 15,  // Total (if M5 exists)
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

        return "Laporan {$months[$this->bulan]} {$this->tahun}";
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        $weeksPerMonth = Setting::getWeeksPerMonth();
        $lastCol = $weeksPerMonth >= 5 ? 'I' : 'H';

        return [
            // Header row styling
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E40AF'], // Blue
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $weeksPerMonth = Setting::getPeriodWeeks($this->bulan, $this->tahun);
                $lastCol = $weeksPerMonth >= 5 ? 'I' : 'H';
                $lastRow = $sheet->getHighestRow();
                $totalPerMingguRow = $lastRow - 1;
                $grandTotalRow = $lastRow;

                // Set row height for header
                $sheet->getRowDimension(1)->setRowHeight(25);

                // Add borders to all data cells
                $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['rgb' => '000000'],
                        ],
                    ],
                ]);

                // Number format for currency columns
                $currencyStart = $weeksPerMonth >= 5 ? 'D2:I' : 'D2:H';
                $sheet->getStyle("{$currencyStart}{$lastRow}")->getNumberFormat()
                    ->setFormatCode('#,##0');

                // Center align No column
                $sheet->getStyle("A2:A{$lastRow}")->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Style the Total Per Minggu row (second last row) - Light Blue
                $sheet->getStyle("A{$totalPerMingguRow}:{$lastCol}{$totalPerMingguRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'DBEAFE'], // Light blue
                    ],
                ]);

                // Style the Grand Total row (last row) - Dark Blue
                $sheet->getStyle("A{$grandTotalRow}:{$lastCol}{$grandTotalRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1E40AF'], // Dark blue
                    ],
                ]);

                // Alternate row colors for better readability (exclude summary rows)
                for ($row = 2; $row < $totalPerMingguRow; $row++) {
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F9FAFB'],
                            ],
                        ]);
                    }
                }

                // Freeze header row
                $sheet->freezePane('A2');
            },
        ];
    }
}
