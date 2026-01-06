<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Laporan Pemasukan {{ $bulan }} {{ $tahun }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            font-size: 14px;
            margin-bottom: 3px;
            margin-top: 0;
        }

        h2 {
            text-align: center;
            font-size: 11px;
            font-weight: normal;
            margin-top: 0;
            margin-bottom: 8px;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 3px 4px;
            text-align: center;
            font-size: 8px;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 9px;
        }

        td.nama {
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
        }

        .footer {
            margin-top: 10px;
            text-align: right;
            font-size: 8px;
            color: #666;
        }

        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
    </style>
</head>

<body>
    <h1>LAPORAN PEMASUKAN KELAS IFB24</h1>
    <h2>Periode: {{ $bulan }} {{ $tahun }}</h2>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama</th>
                <th>M1</th>
                <th>M2</th>
                <th>M3</th>
                <th>M4</th>
                @if($settings['weeks_per_month'] >= 5)
                    <th>M5</th>
                @endif
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0;
            $no = 1; @endphp
            @foreach($data as $row)
                @php
                    $rowTotal = $row['m1'] + $row['m2'] + $row['m3'] + $row['m4'] + ($row['m5'] ?? 0);
                    $grandTotal += $rowTotal;
                @endphp
                <tr>
                    <td>{{ $no++ }}</td>
                    <td>{{ $row['nim'] }}</td>
                    <td class="nama">{{ $row['nama'] }}</td>
                    <td>{{ number_format($row['m1'], 0, ',', '.') }}</td>
                    <td>{{ number_format($row['m2'], 0, ',', '.') }}</td>
                    <td>{{ number_format($row['m3'], 0, ',', '.') }}</td>
                    <td>{{ number_format($row['m4'], 0, ',', '.') }}</td>
                    @if($settings['weeks_per_month'] >= 5)
                        <td>{{ number_format($row['m5'] ?? 0, 0, ',', '.') }}</td>
                    @endif
                    <td>{{ number_format($rowTotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="{{ $settings['weeks_per_month'] >= 5 ? 8 : 7 }}">TOTAL PEMASUKAN</td>
                <td>Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <p class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i') }} WIB<br>
        Iuran Mingguan: Rp {{ number_format($settings['weekly_fee'], 0, ',', '.') }}
    </p>
</body>

</html>