<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Pengeluaran - {{ $bulan }} {{ $tahun }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header h2 {
            font-size: 13pt;
            font-weight: normal;
            margin-bottom: 3px;
        }

        .header p {
            font-size: 10pt;
            color: #333;
        }

        .info-section {
            margin-bottom: 15px;
        }

        .info-section table {
            font-size: 10pt;
        }

        .info-section td {
            padding: 2px 10px 2px 0;
        }

        .info-section td:first-child {
            font-weight: bold;
            width: 120px;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #000;
            padding: 8px 10px;
        }

        table.data-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 10pt;
            text-align: center;
        }

        table.data-table td {
            font-size: 10pt;
        }

        table.data-table td.center {
            text-align: center;
        }

        table.data-table td.keterangan {
            text-align: left;
        }

        table.data-table td.nominal {
            text-align: right;
        }

        table.data-table tr.total-row {
            font-weight: bold;
            background-color: #e0e0e0;
        }

        .footer {
            margin-top: 30px;
            font-size: 10pt;
        }

        .signature-section {
            margin-top: 40px;
            width: 100%;
        }

        .signature-section table {
            width: 100%;
        }

        .signature-section td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 10px;
        }

        .signature-line {
            margin-top: 60px;
            border-bottom: 1px solid #000;
            width: 180px;
            margin-left: auto;
            margin-right: auto;
        }

        .signature-name {
            margin-top: 5px;
            font-weight: bold;
        }

        .date-generated {
            text-align: right;
            font-size: 9pt;
            color: #666;
            margin-top: 20px;
        }

        .empty-message {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Laporan Pengeluaran Kas Kelas</h1>
        <h2>Periode: {{ $bulan }} {{ $tahun }}</h2>
        <p>Informatics Class IFB24</p>
    </div>

    <div class="info-section">
        <table>
            <tr>
                <td>Periode</td>
                <td>: {{ $bulan }} {{ $tahun }}</td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 40px;">No</th>
                <th style="width: 100px;">Tanggal</th>
                <th>Keterangan</th>
                <th style="width: 120px;">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalPengeluaran = 0;
                $no = 0;
            @endphp
            @forelse($data as $row)
                @if($row['judul'] === 'TOTAL PENGELUARAN')
                    @continue
                @endif
                @php
                    $no++;
                    $totalPengeluaran += $row['nominal'] ?? 0;
                @endphp
                <tr>
                    <td class="center">{{ $no }}</td>
                    <td class="center">{{ $row['tanggal'] }}</td>
                    <td class="keterangan">{{ $row['judul'] }}</td>
                    <td class="nominal">{{ number_format($row['nominal'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="empty-message">Tidak ada data pengeluaran untuk periode ini</td>
                </tr>
            @endforelse
            @if($no > 0)
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL PENGELUARAN</td>
                    <td class="nominal" style="font-weight: bold;">{{ number_format($totalPengeluaran, 0, ',', '.') }}</td>
                </tr>
            @endif
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