<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class UniversityAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            $this->logSecurityEvent('unauthenticated_university_access', $request);
            return $this->unauthorizedResponse($request);
        }

        // Enhanced university access validation
        $accessGranted = $this->validateUniversityAccess($user, $request);

        if (!$accessGranted) {
            $this->logSecurityEvent('university_access_denied', $request, [
                'user_id' => $user->user_id,
                'user_university_id' => $user->university_id,
                'requested_university' => $this->getRequestedUniversityId($request)
            ]);
            
            return $this->forbiddenResponse($request, 
                'University access denied.'
            );
        }

        $this->logSecurityEvent('university_access_granted', $request, [
            'user_id' => $user->user_id,
            'university_id' => $user->university_id
        ], 'info');

        return $next($request);
    }

    private function validateUniversityAccess($user, Request $request): bool
    {
        // Super admins can access all universities with additional checks
        if ($user->isSuperAdmin()) {
            return $this->validateSuperAdminAccess($user, $request);
        }

        // Enhanced university membership checks
        if (!$user->university_id) {
            $this->logSecurityEvent('no_university_assigned', $request, [
                'user_id' => $user->user_id
            ]);
            return false;
        }

        // University status validation
        if (!$this->isUniversityActive($user->university_id)) {
            $this->logSecurityEvent('inactive_university_access', $request, [
                'user_id' => $user->user_id,
                'university_id' => $user->university_id
            ]);
            return false;
        }

        // Requested university validation
        $requestedUniversityId = $this->getRequestedUniversityId($request);
        if ($requestedUniversityId && $requestedUniversityId !== $user->university_id) {
            $this->logSecurityEvent('university_mismatch', $request, [
                'user_id' => $user->user_id,
                'user_university' => $user->university_id,
                'requested_university' => $requestedUniversityId
            ]);
            return false;
        }

        return true;
    }

    private function validateSuperAdminAccess($user, Request $request): bool
    {
        // Additional security checks for super admin access
        if ($this->isUnusualSuperAdminAccess($user, $request)) {
            $this->logSecurityEvent('unusual_super_admin_access', $request, [
                'user_id' => $user->user_id,
                'ip' => $request->ip()
            ]);
            // Log unusual access but don't block
        }

        return true;
    }

    private function isUnusualSuperAdminAccess($user, Request $request): bool
    {
        // Check for unusual access patterns
        $hour = now()->hour;
        $isOffHours = $hour >= 0 && $hour < 6; // Midnight to 6 AM
        
        // Check for multiple university accesses in short time
        $key = 'super_admin_access:' . $user->user_id;
        $accessCount = app('redis')->get($key) ?: 0;
        
        return $isOffHours || $accessCount > 10;
    }

    private function isUniversityActive(?string $universityId): bool
    {
        if (!$universityId) return false;

        try {
            $university = \App\Models\University::find($universityId);
            return $university && $university->is_active;
        } catch (\Exception $e) {
            Log::error('University status check failed', [
                'university_id' => $universityId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    private function getRequestedUniversityId(Request $request): ?string
    {
        // Check route parameters
        if ($request->route('university_id')) {
            return $request->route('university_id');
        }

        if ($request->route('university')) {
            return $request->route('university');
        }

        // Check request data
        if ($request->input('university_id')) {
            return $request->input('university_id');
        }

        // Check URL segments
        $path = $request->path();
        if (preg_match('/universities\/([a-f0-9-]{36})/i', $path, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function logSecurityEvent(string $event, Request $request, array $context = [], string $level = 'warning'): void
    {
        $logData = array_merge([
            'event' => $event,
            'path' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ], $context);

        Log::{$level}('University Access: ' . $event, $logData);
    }

    private function unauthorizedResponse(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Authentication Required',
                'message' => 'Please log in to access this resource.'
            ], 401);
        }

        if ($request->inertia()) {
            return inertia()->location(route('login'));
        }

        return redirect()->route('login');
    }

    private function forbiddenResponse(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Access Denied',
                'message' => $message
            ], 403);
        }

        if ($request->inertia()) {
            return Inertia::render('Error', [
                'status' => 403,
                'message' => $message
            ])->toResponse($request)->setStatusCode(403);
        }

        return back()->with('error', $message);
    }
}