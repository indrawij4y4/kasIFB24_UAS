<?php

namespace App\Exports;

use App\Models\Pengeluaran;
use Carbon\Carbon;
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

class LaporanPengeluaranExport implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths, WithEvents
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

        $data = $pengeluaran->map(function ($item, $index) {
            $tanggal = $item->tanggal instanceof Carbon
                ? $item->tanggal
                : Carbon::parse($item->tanggal);

            return [
                'no' => $index + 1,
                'tanggal' => $tanggal->format('d/m/Y'),
                'judul' => $item->judul,
                'nominal' => (float) $item->nominal,
            ];
        });

        // Add total row
        $totalNominal = $data->sum('nominal');

        $data->push([
            'no' => '',
            'tanggal' => '',
            'judul' => 'TOTAL PENGELUARAN',
            'nominal' => $totalNominal,
        ]);

        return $data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Keterangan',
            'Nominal (Rp)',
        ];
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 15,  // Tanggal
            'C' => 40,  // Keterangan
            'D' => 18,  // Nominal
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
            // Header row styling
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'DC2626'], // Red for expenses
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
                $lastRow = $sheet->getHighestRow();

                // Set row height for header
                $sheet->getRowDimension(1)->setRowHeight(25);

                // Add borders to all data cells
                $sheet->getStyle("A1:D{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['rgb' => '000000'],
                        ],
                    ],
                ]);

                // Number format for currency column (D)
                $sheet->getStyle("D2:D{$lastRow}")->getNumberFormat()
                    ->setFormatCode('#,##0');

                // Center align No and Tanggal columns
                $sheet->getStyle("A2:A{$lastRow}")->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("B2:B{$lastRow}")->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Right align nominal column
                $sheet->getStyle("D2:D{$lastRow}")->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Style the total row (last row)
                $sheet->getStyle("A{$lastRow}:D{$lastRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['rgb' => 'DC2626'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FEE2E2'], // Light red
                    ],
                    'borders' => [
                        'top' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['rgb' => 'DC2626'],
                        ],
                        'bottom' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['rgb' => 'DC2626'],
                        ],
                    ],
                ]);

                // Alternate row colors for better readability
                for ($row = 2; $row < $lastRow; $row++) {
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:D{$row}")->applyFromArray([
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
