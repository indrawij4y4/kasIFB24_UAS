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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
