<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    
    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            
            'auth' => fn (Request $request) => [
                'user' => $request->user() ? $this->getUserData($request->user()) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ], 
            
             'errors' => fn () => $request->session()->get('errors') 
            ? $request->session()->get('errors')->getBag('default')->toArray()
            : (object)[],
        ];
    }

    protected function getUserData($user): array
    {
        try {
            // Get the primary role (first role) or default to empty string
            $primaryRole = $user->roles->first() ? $user->roles->first()->name : '';
            
            return [
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'position' => $user->position,
                'university_id' => $user->university_id,
                'department_id' => $user->department_id,
                'profile_image' => $user->profile_image,
                'roles' => $user->getRoleNames()->toArray(), // All roles as array
                'permissions' => $user->getPermissionNames()->toArray(),
                'is_active' => $user->is_active,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting user data for Inertia: ' . $e->getMessage());
            
            return [
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'university_id' => $user->university_id,
                'department_id' => $user->department_id,
                'roles' => [],
                'permissions' => [],
            ];
        }
    }
}