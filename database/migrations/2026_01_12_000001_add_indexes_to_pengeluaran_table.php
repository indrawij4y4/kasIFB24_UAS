<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pengeluaran', function (Blueprint $table) {
            // Index for ordering by date (common in reports and listings)
            $table->index(['tanggal']);

            // Composite index for period filtering + date ordering
            $table->index(['tanggal', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengeluaran', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
            $table->dropIndex(['tanggal', 'created_at']);
        });
    }
};
