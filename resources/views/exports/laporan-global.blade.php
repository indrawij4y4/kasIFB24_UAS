<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Pemasukan - {{ $bulan }} {{ $tahun }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10pt;
            /* Reduced font size */
            line-height: 1.2;
            /* Tighter line height */
            padding: 10px;
            /* Reduced padding */
        }

        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .header h2 {
            font-size: 12pt;
            font-weight: normal;
            margin-bottom: 3px;
        }

        .header p {
            font-size: 10pt;
            color: #000;
            /* Solid black */
            font-weight: bold;
        }

        /* Remove info section as requested "taruh intinya saja" */
        .info-section {
            display: none;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            /* Compact padding */
            text-align: center;
            font-size: 9pt;
            /* Smaller table font */
        }

        .footer {
            margin-top: 10px;
            font-size: 9pt;
        }

        .signature-section {
            margin-top: 20px;
            width: 100%;
            page-break-inside: avoid;
        }

        .signature-section td {
            padding: 5px;
        }

        .signature-line {
            margin-top: 50px;
            width: 150px;
        }

        .date-generated {
            display: none;
            /* Hide generated date for cleaner look */
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Laporan Pemasukan Kas Kelas</h1>
        <h2>Periode: {{ $bulan }} {{ $tahun }}</h2>
        <p>Informatics Class IFB24</p>
    </div>



    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th style="width: 80px;">NIM</th>
                <th>Nama Mahasiswa</th>
                <th style="width: 60px;">M1</th>
                <th style="width: 60px;">M2</th>
                <th style="width: 60px;">M3</th>
                <th style="width: 60px;">M4</th>
                @if(($settings['weeks_per_month'] ?? 4) >= 5)
                    <th style="width: 60px;">M5</th>
                @endif
                <th style="width: 80px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalM1 = 0;
                $totalM2 = 0;
                $totalM3 = 0;
                $totalM4 = 0;
                $totalM5 = 0;
                $grandTotal = 0;
                $no = 0;
            @endphp
            @foreach($data as $row)
                @if($row['nama'] === 'TOTAL PER MINGGU' || $row['nama'] === 'TOTAL KESELURUHAN')
                    @continue
                @endif
                @php
                    $no++;
                    $totalM1 += $row['m1'] ?? 0;
                    $totalM2 += $row['m2'] ?? 0;
                    $totalM3 += $row['m3'] ?? 0;
                    $totalM4 += $row['m4'] ?? 0;
                    $totalM5 += $row['m5'] ?? 0;
                    $grandTotal += $row['total'] ?? 0;
                @endphp
                <tr>
                    <td>{{ $no }}</td>
                    <td>{{ $row['nim'] }}</td>
                    <td class="nama">{{ $row['nama'] }}</td>
                    <td class="nominal">{{ number_format($row['m1'] ?? 0, 0, ',', '.') }}</td>
                    <td class="nominal">{{ number_format($row['m2'] ?? 0, 0, ',', '.') }}</td>
                    <td class="nominal">{{ number_format($row['m3'] ?? 0, 0, ',', '.') }}</td>
                    <td class="nominal">{{ number_format($row['m4'] ?? 0, 0, ',', '.') }}</td>
                    @if(($settings['weeks_per_month'] ?? 4) >= 5)
                        <td class="nominal">{{ number_format($row['m5'] ?? 0, 0, ',', '.') }}</td>
                    @endif
                    <td class="nominal">{{ number_format($row['total'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL PER MINGGU</td>
                <td class="nominal">{{ number_format($totalM1, 0, ',', '.') }}</td>
                <td class="nominal">{{ number_format($totalM2, 0, ',', '.') }}</td>
                <td class="nominal">{{ number_format($totalM3, 0, ',', '.') }}</td>
                <td class="nominal">{{ number_format($totalM4, 0, ',', '.') }}</td>
                @if(($settings['weeks_per_month'] ?? 4) >= 5)
                    <td class="nominal">{{ number_format($totalM5, 0, ',', '.') }}</td>
                @endif
                <td class="nominal"></td>
            </tr>
            <tr class="grand-total-row">
                <td colspan="{{ ($settings['weeks_per_month'] ?? 4) >= 5 ? 8 : 7 }}"
                    style="text-align: right; font-weight: bold;">TOTAL KESELURUHAN</td>
                <td class="nominal" style="font-weight: bold;">{{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="signature-section">
        <table>
            <tr>
                <td>
                    <p>Mengetahui,</p>
                    <p>Ketua Kelas</p>
                    <div class="signature-line"></div>
                    <p class="signature-name">( ............................ )</p>
                </td>
                <td>
                    <p>{{ now()->locale('id')->isoFormat('D MMMM Y') }}</p>
                    <p>Bendahara</p>
                    <div class="signature-line"></div>
                    <p class="signature-name">( ............................ )</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="date-generated">
        Dokumen ini digenerate pada: {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>

</html>