<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views. Of course
    | the usual Laravel view path has already been registered for you.
    |
    */

    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | This option determines where all the compiled Blade templates will be
    | stored for your application. Typically, this is within the storage
    | directory. However, for Vercel serverless, we use /tmp.
    |
    */

    'compiled' => env(
        'VIEW_COMPILED_PATH',
        // Use /tmp for Vercel, otherwise use default storage path
        env('VERCEL') ? '/tmp/storage/framework/views' : realpath(storage_path('framework/views'))
    ),

];
