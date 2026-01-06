<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class PengeluaranController extends Controller
{
    /**
     * Get all pengeluaran with pagination
     */
    public function index(Request $request)
    {
        $query = Pengeluaran::orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc');

        // Optional month/year filter
        if ($request->has('bulan') && $request->has('tahun')) {
            $bulan = (int) $request->input('bulan');
            $tahun = (int) $request->input('tahun');
            $query->forPeriod($bulan, $tahun);
        }

        $pengeluaran = $query->paginate(20);

        return response()->json($pengeluaran);
    }

    /**
     * Get specific pengeluaran detail
     */
    public function show(int $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);

        return response()->json([
            'id' => $pengeluaran->id,
            'judul' => $pengeluaran->judul,
            'nominal' => (float) $pengeluaran->nominal,
            'tanggal' => $pengeluaran->tanggal->format('Y-m-d'),
            'foto_path' => $pengeluaran->foto_path,
            'foto_url' => $pengeluaran->foto_url,
            'created_at' => $pengeluaran->created_at,
        ]);
    }

    /**
     * Store a new pengeluaran (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('struk', 'public');
        }

        $pengeluaran = Pengeluaran::create([
            'judul' => $request->input('judul'),
            'nominal' => $request->input('nominal'),
            'tanggal' => $request->input('tanggal'),
            'foto_path' => $fotoPath,
        ]);

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Pengeluaran berhasil disimpan',
            'data' => [
                'id' => $pengeluaran->id,
                'judul' => $pengeluaran->judul,
                'nominal' => (float) $pengeluaran->nominal,
                'tanggal' => $pengeluaran->tanggal->format('Y-m-d'),
                'foto_url' => $pengeluaran->foto_url,
            ],
        ], 201);
    }

    /**
     * Update a pengeluaran (Admin only)
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'judul' => 'sometimes|string|max:255',
            'nominal' => 'sometimes|numeric|min:0',
            'tanggal' => 'sometimes|date',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $pengeluaran = Pengeluaran::findOrFail($id);

        $data = $request->only(['judul', 'nominal', 'tanggal']);

        if ($request->hasFile('foto')) {
            // Delete old foto if exists
            if ($pengeluaran->foto_path) {
                Storage::disk('public')->delete($pengeluaran->foto_path);
            }
            $data['foto_path'] = $request->file('foto')->store('struk', 'public');
        }

        $pengeluaran->update($data);

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Pengeluaran berhasil diupdate',
            'data' => $pengeluaran,
        ]);
    }

    /**
     * Delete a pengeluaran (Admin only)
     */
    public function destroy(int $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);

        // Delete foto file if exists
        if ($pengeluaran->foto_path) {
            Storage::disk('public')->delete($pengeluaran->foto_path);
        }

        $pengeluaran->delete();

        // Invalidate dashboard cache
        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Pengeluaran berhasil dihapus',
        ]);
    }
}
