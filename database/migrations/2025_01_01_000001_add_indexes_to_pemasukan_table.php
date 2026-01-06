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
        Schema::table('pemasukan', function (Blueprint $table) {
            // Index for filtering by period (common in reports)
            $table->index(['bulan', 'tahun']);

            // Index for filtering by user and period (common in individual checks)
            $table->index(['user_id', 'bulan', 'tahun']);

            // Index for filtering by user (common in history)
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemasukan', function (Blueprint $table) {
            $table->dropIndex(['bulan', 'tahun']);
            $table->dropIndex(['user_id', 'bulan', 'tahun']);
            $table->dropIndex(['user_id']);
        });
    }
};
