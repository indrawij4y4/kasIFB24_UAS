<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Laporan Pengeluaran {{ $bulan }} {{ $tahun }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        h1 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 5px;
        }

        h2 {
            text-align: center;
            font-size: 14px;
            font-weight: normal;
            margin-top: 0;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        td.keterangan {
            text-align: left;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #666;
        }

        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
    </style>
</head>

<body>
    <h1>LAPORAN PENGELUARAN KAS KELAS IFB24</h1>
    <h2>Periode: {{ $bulan }} {{ $tahun }}</h2>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $total = 0;
            $no = 1; @endphp
            @forelse($data as $row)
                @php $total += $row['nominal']; @endphp
                <tr>
                    <td>{{ $no++ }}</td>
                    <td>{{ $row['tanggal'] }}</td>
                    <td class="keterangan">{{ $row['judul'] }}</td>
                    <td>{{ number_format($row['nominal'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 20px;">
                        Belum ada pengeluaran untuk periode ini
                    </td>
                </tr>
            @endforelse
            @if(count($data) > 0)
                <tr class="total-row">
                    <td colspan="3">TOTAL PENGELUARAN</td>
                    <td>Rp {{ number_format($total, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <p class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i') }} WIB
    </p>
</body>

</html>