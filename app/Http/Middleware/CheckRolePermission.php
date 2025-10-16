<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRolePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->isInventoryManager()) {

            return back()->with('error', 'Unauthenticated.');
        }

        if (!auth()->user()->hasRole('super_admin')) {
            abort(403, 'Unauthorized action.');
        }
        
        return $next($request);
    }
}