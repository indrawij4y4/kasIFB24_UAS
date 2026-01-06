<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemasukan extends Model
{
    use HasFactory;

    protected $table = 'pemasukan';

    protected $fillable = [
        'user_id',
        'bulan',
        'tahun',
        'minggu_ke',
        'nominal',
    ];

    protected $casts = [
        'bulan' => 'integer',
        'tahun' => 'integer',
        'minggu_ke' => 'integer',
        'nominal' => 'decimal:2',
    ];

    /**
     * Get the user that owns this payment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by month and year
     */
    public function scopeForPeriod($query, int $bulan, int $tahun)
    {
        return $query->where('bulan', $bulan)->where('tahun', $tahun);
    }

    /**
     * Get month name in Indonesian
     */
    public function getNamaBulanAttribute(): string
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
        return $months[$this->bulan] ?? '';
    }
}
