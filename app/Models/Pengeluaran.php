<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Pengeluaran extends Model
{
    use HasFactory;

    protected $table = 'pengeluaran';

    protected $fillable = [
        'judul',
        'nominal',
        'foto_path',
        'tanggal',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'tanggal' => 'date',
    ];

    protected $appends = ['foto_url'];

    /**
     * Get the full URL for the receipt photo
     */
    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto_path) {
            return null;
        }
        return Storage::url($this->foto_path);
    }

    /**
     * Scope to filter by month and year
     */
    public function scopeForPeriod($query, int $bulan, int $tahun)
    {
        return $query->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun);
    }
}
