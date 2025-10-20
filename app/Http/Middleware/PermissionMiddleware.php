<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    // Rate limiting for security
    protected int $maxAttempts = 10;
    protected int $decayMinutes = 1;

    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = Auth::user();

        if (!$user) {
            $this->logSecurityEvent('unauthenticated_access_attempt', $request, [
                'permissions' => $permissions
            ]);
            return $this->unauthorizedResponse($request);
        }


        // Super admin bypass - grant all access
        if ($user->isSuperAdmin()) {
            $this->logSecurityEvent('super_admin_bypass', $request, [
                'user_id' => $user->user_id,
                'permissions' => $permissions
            ], 'info');
            return $next($request);
        }

        // Validate permissions input
        $permissions = $this->sanitizePermissions($permissions);
        if (empty($permissions)) {
            Log::error('Permission middleware called with invalid permissions', [
                'user_id' => $user->user_id
            ]);
            return $this->forbiddenResponse($request, 'Invalid permission configuration.');
        }

        // Rate limiting to prevent brute force attacks
        if ($this->tooManyPermissionAttempts($user, $request)) {
            $this->logSecurityEvent('permission_rate_limit_exceeded', $request, [
                'user_id' => $user->user_id
            ]);
            return $this->rateLimitResponse($request);
        }

        // Enhanced security checks before permission validation
        if (!$this->preFlightSecurityChecks($user, $request)) {
            return $this->forbiddenResponse($request, 'Security validation failed.');
        }

        // Real-time permission check (no caching for security)
        if (!$user->hasAnyPermission($permissions)) {
            $this->logSecurityEvent('permission_denied', $request, [
                'user_id' => $user->user_id,
                'required_permissions' => $permissions,
                'user_role' => $user->getRoleName(),
                'user_agent' => $this->safeUserAgent($request),
                'ip_address' => $request->ip()
            ]);
            
            return $this->forbiddenResponse($request, 
                'You do not have the required permissions to access this resource.'
            );
        }

        // Log successful access for audit trail
        $this->logSecurityEvent('permission_granted', $request, [
            'user_id' => $user->user_id,
            'permissions' => $permissions
        ], 'info');

        return $next($request);
    }

    /**
     * Enhanced security checks before permission validation
     */
    private function preFlightSecurityChecks($user, Request $request): bool
    {
        // Check if user account is active
        if (!$user->is_active) {
            $this->logSecurityEvent('inactive_account_access', $request, [
                'user_id' => $user->user_id
            ]);
            return false;
        }

        // Check for suspicious user patterns
        if ($this->detectSuspiciousActivity($user, $request)) {
            $this->logSecurityEvent('suspicious_activity_detected', $request, [
                'user_id' => $user->user_id,
                'ip' => $request->ip()
            ]);
            // Continue but log the event
        }

        // Validate user session security
        if (!$this->validateSessionSecurity($request)) {
            $this->logSecurityEvent('session_security_issue', $request, [
                'user_id' => $user->user_id
            ]);
            return false;
        }

        return true;
    }

    /**
     * Detect suspicious activity patterns
     */
    private function detectSuspiciousActivity($user, Request $request): bool
    {
        // Check for automated behavior patterns
        $userAgent = $request->userAgent();
        if ($userAgent && preg_match('/bot|crawl|scraper|script/i', $userAgent)) {
            return true;
        }

        // Check for rapid successive permission checks
        $key = 'permission_attempts:' . $user->user_id;
        $attempts = RateLimiter::attempts($key);
        
        return $attempts > 5; // More than 5 attempts in short period
    }

    /**
     * Validate session security
     */
    private function validateSessionSecurity(Request $request): bool
    {
        $session = $request->session();
        
        // Check if session is too old (potential hijacking)
        $sessionAge = $session->get('created_at');
        if ($sessionAge && now()->diffInMinutes($sessionAge) > 120) { // 2 hours max
            return false;
        }

        return true;
    }

    /**
     * Rate limiting implementation
     */
    private function tooManyPermissionAttempts($user, Request $request): bool
    {
        $key = 'permission_middleware:' . $user->user_id . ':' . $request->ip();
        return RateLimiter::tooManyAttempts($key, $this->maxAttempts);
    }

    /**
     * Sanitize and validate permissions
     */
    private function sanitizePermissions(array $permissions): array
    {
        $sanitized = [];

        foreach ($permissions as $permission) {
            // Remove any potentially dangerous characters
            $clean = preg_replace('/[^a-zA-Z0-9._-]/', '', $permission);
            
            // Validate basic permission format
            if ($clean && preg_match('/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/', $clean)) {
                $sanitized[] = $clean;
            }
        }

        return array_unique($sanitized);
    }

    /**
     * Safe user agent logging
     */
    private function safeUserAgent(Request $request): string
    {
        $userAgent = $request->userAgent();
        return $userAgent ? substr($userAgent, 0, 250) : 'unknown';
    }

    /**
     * Security event logging
     */
    private function logSecurityEvent(string $event, Request $request, array $context = [], string $level = 'warning'): void
    {
        $logData = array_merge([
            'event' => $event,
            'path' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $this->safeUserAgent($request),
            'timestamp' => now()->toISOString()
        ], $context);

        Log::{$level}('Security: ' . $event, $logData);
    }

    private function unauthorizedResponse(Request $request): Response
    {
        if ($request->expectsJson()) {

            //  'error' => 'Authentication Required',
            // return response()->json([
            //     'error' => 'Authentication Required',
            //     'message' => 'Please log in to access this resource.'
            // ]);

             return back()->with('error','Authentication Required');
        }

        if ($request->inertia()) {
            return inertia()->location(route('login'));
        }

        return redirect()->route('login')->with([
            'error' => 'Please log in to access this resource.',
            'intended' => $request->fullUrl()
        ]);
    }

    private function forbiddenResponse(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Access Denied',
                'message' => $message,
                'reference_id' => $this->generateReferenceId()
            ], 403);
        }

        if ($request->inertia()) {
            return Inertia::render('Error', [
                'status' => 403,
                'title' => 'Access Denied',
                'message' => $message,
                'reference_id' => $this->generateReferenceId()
            ])->toResponse($request)->setStatusCode(403);
        }

        return back()->with([
            'error' => $message,
            'reference_id' => $this->generateReferenceId()
        ]);
    }

    private function rateLimitResponse(Request $request): Response
    {
        $retryAfter = RateLimiter::availableIn('permission_middleware:' . Auth::id() . ':' . $request->ip());

        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Too Many Requests',
                'message' => 'Too many permission checks. Please try again later.',
                'retry_after' => $retryAfter
            ], 429);
        }

        return back()->with([
            'error' => 'Too many requests. Please wait ' . $retryAfter . ' seconds.',
            'error_type' => 'rate_limit'
        ]);
    }

    private function generateReferenceId(): string
    {
        return 'REF-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }
}