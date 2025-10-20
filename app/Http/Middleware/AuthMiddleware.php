<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            if ($request->inertia()) {
                return inertia()->location(route('logout'));
            }
            return redirect()->route('login');
        }

        // Check if user is active
        if (!Auth::user()->is_active) {
            Auth::logout();
            
            if ($request->inertia()) {
                return inertia()->location(route('login'));
            }
            return redirect()->route('login')->with('error', 'Your account has been deactivated.');
        }

        return $next($request);
    }
}