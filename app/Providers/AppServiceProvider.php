<?php

namespace App\Providers;

use App\Models\PurchaseOrder;
use App\Policies\PurchaseOrderPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::policy(PurchaseOrder::class, PurchaseOrderPolicy::class);

         // Register policies
        Gate::policy(\Spatie\Permission\Models\Role::class, \App\Policies\RolePolicy::class);
        Gate::policy(\Spatie\Permission\Models\Permission::class, \App\Policies\PermissionPolicy::class);

        // Auto-clear permission cache in development
        if (app()->environment('local')) {
            $this->autoClearPermissionCache();
        }

    }

     protected function autoClearPermissionCache()
    {
        $clearCache = function () {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        };

        Role::saved($clearCache);
        Role::deleted($clearCache);
        Permission::saved($clearCache);
        Permission::deleted($clearCache);
    }
    
}
