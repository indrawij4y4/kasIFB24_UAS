<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Fix public path for InfinityFree/Shared Hosting structure
        if (str_contains(base_path(), 'laravel_core')) {
            // Paksa path public ke folder di atasnya (htdocs)
            $publicPath = realpath(base_path('../'));
            if ($publicPath) {
                // Gunakan instance binding yang lebih kuat
                $this->app->instance('path.public', $publicPath);
            }
        }

        // Vercel serverless: use /tmp for writable directories
        if (isset($_ENV['VERCEL']) && $_ENV['VERCEL']) {
            $tmpStorage = '/tmp/storage';

            // Create required directories
            if (!is_dir($tmpStorage)) {
                @mkdir($tmpStorage, 0755, true);
            }
            if (!is_dir($tmpStorage . '/framework/views')) {
                @mkdir($tmpStorage . '/framework/views', 0755, true);
            }
            if (!is_dir($tmpStorage . '/framework/cache')) {
                @mkdir($tmpStorage . '/framework/cache', 0755, true);
            }
            if (!is_dir($tmpStorage . '/logs')) {
                @mkdir($tmpStorage . '/logs', 0755, true);
            }

            // Override storage path
            $this->app->useStoragePath($tmpStorage);

            // Set compiled view path
            config(['view.compiled' => $tmpStorage . '/framework/views']);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
