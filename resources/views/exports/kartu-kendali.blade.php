<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Kartu Kendali - {{ $user->nama }}</title>
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

        .user-info {
            text-align: center;
            margin-bottom: 20px;
        }

        .user-info p {
            margin: 5px 0;
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

        td.bulan {
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
    <h1>KARTU KENDALI PEMBAYARAN KAS</h1>

    <div class="user-info">
        <p><strong>NIM:</strong> {{ $user->nim }}</p>
        <p><strong>Nama:</strong> {{ $user->nama }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Bulan</th>
                <th>Tahun</th>
                <th>Minggu</th>
                <th>Nominal (Rp)</th>
                <th>Tanggal Bayar</th>
            </tr>
        </thead>
        <tbody>
            @php $total = 0;
            $no = 1; @endphp
            @foreach($data as $row)
                @php $total += $row['nominal']; @endphp
                <tr>
                    <td>{{ $no++ }}</td>
                    <td class="bulan">{{ $row['bulan'] }}</td>
                    <td>{{ $row['tahun'] }}</td>
                    <td>{{ $row['minggu_ke'] }}</td>
                    <td>{{ number_format($row['nominal'], 0, ',', '.') }}</td>
                    <td>{{ $row['tanggal'] }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="4">TOTAL PEMBAYARAN</td>
                <td colspan="2">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <p class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i') }} WIB
    </p>
</body>

</html>