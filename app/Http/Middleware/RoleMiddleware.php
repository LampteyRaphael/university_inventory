<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    protected int $maxAttempts = 15;
    protected int $decayMinutes = 2;

    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = Auth::user();

        if (!$user) {
            $this->logSecurityEvent('unauthenticated_role_access', $request, [
                'roles' => $roles
            ]);
            return $this->unauthorizedResponse($request);
        }

        // Super admin bypass - grant all access regardless of required roles
        if ($user->isSuperAdmin()) {
            $this->logSecurityEvent('super_admin_role_bypass', $request, [
                'user_id' => $user->user_id,
                'required_roles' => $roles
            ], 'info');
            return $next($request);
        }

        // Validate and sanitize roles
        $roles = $this->sanitizeRoles($roles);
        if (empty($roles)) {
            Log::error('Role middleware called with invalid roles', [
                'user_id' => $user->user_id
            ]);
            return $this->forbiddenResponse($request, 'Invalid role configuration.');
        }

        // Rate limiting for role checks
        if ($this->tooManyRoleAttempts($user, $request)) {
            $this->logSecurityEvent('role_rate_limit_exceeded', $request, [
                'user_id' => $user->user_id
            ]);
            return $this->rateLimitResponse($request);
        }

        // Security checks before role validation
        if (!$this->preFlightSecurityChecks($user, $request)) {
            return $this->forbiddenResponse($request, 'Security validation failed.');
        }

        // Real-time role check (no caching)
        if (!$user->hasAnyRole($roles)) {
            $this->logSecurityEvent('role_denied', $request, [
                'user_id' => $user->user_id,
                'required_roles' => $roles,
                'user_role' => $user->getRoleName(),
                'user_agent' => $this->safeUserAgent($request),
                'ip_address' => $request->ip()
            ]);
            
            return $this->forbiddenResponse($request, 
                'You do not have the required role to access this resource.'
            );
        }

        // Log successful role-based access
        $this->logSecurityEvent('role_granted', $request, [
            'user_id' => $user->user_id,
            'roles' => $roles
        ], 'info');

        return $next($request);
    }

    /**
     * Enhanced security checks for role validation
     */
    private function preFlightSecurityChecks($user, Request $request): bool
    {
        // Account status check
        if (!$user->is_active) {
            $this->logSecurityEvent('inactive_account_role_check', $request, [
                'user_id' => $user->user_id
            ]);
            return false;
        }

        // Check for role escalation attempts
        if ($this->detectRoleEscalation($user, $request)) {
            $this->logSecurityEvent('possible_role_escalation', $request, [
                'user_id' => $user->user_id
            ]);
            // Log but don't block - adjust based on security policy
        }

        // Session validation
        if (!$this->validateSession($request)) {
            $this->logSecurityEvent('invalid_session_role_check', $request, [
                'user_id' => $user->user_id
            ]);
            return false;
        }

        return true;
    }

    /**
     * Detect potential role escalation attempts - FIXED VERSION
     */
    private function detectRoleEscalation($user, Request $request): bool
    {
        $currentLevel = $user->getRoleLevel();
        
        // Get the highest required role level from the middleware parameters
        $roleLevels = [
            'super_admin' => 100,
            'inventory_manager' => 80,
            'department_head' => 70,
            'procurement_officer' => 60,
            'faculty' => 40,
            'staff' => 30,
            'student' => 10,
        ];

        $requiredLevel = 0;
        
        // Get roles from route middleware parameters, not route parameters
        $route = $request->route();
        if ($route) {
            $middleware = $route->gatherMiddleware();
            foreach ($middleware as $middlewareItem) {
                if (str_contains($middlewareItem, 'role:')) {
                    // Extract roles from middleware string like "role:super_admin,inventory_manager"
                    $rolesString = str_replace('role:', '', $middlewareItem);
                    $rolesArray = explode(',', $rolesString);
                    
                    foreach ($rolesArray as $role) {
                        $role = trim($role);
                        if (isset($roleLevels[$role])) {
                            $requiredLevel = max($requiredLevel, $roleLevels[$role]);
                        }
                    }
                }
            }
        }

        return $requiredLevel > $currentLevel;
    }

    /**
     * Alternative simpler approach for role escalation detection
     */
    private function detectRoleEscalationSimple($user, Request $request): bool
    {
        $currentLevel = $user->getRoleLevel();
        
        // Define minimum levels for different route patterns
        $routePatternLevels = [
            '/admin/*' => 80, // inventory_manager level
            '/users/*' => 70, // department_head level  
            '/roles/*' => 100, // super_admin level
            '/analytics/*' => 70, // department_head level
            '/audit-logs/*' => 70, // department_head level
        ];

        $path = $request->path();
        $requiredLevel = 0;

        foreach ($routePatternLevels as $pattern => $level) {
            if (preg_match('#^' . str_replace('*', '.*', $pattern) . '$#', $path)) {
                $requiredLevel = max($requiredLevel, $level);
            }
        }

        return $requiredLevel > $currentLevel;
    }

    /**
     * Session validation
     */
    private function validateSession(Request $request): bool
    {
        $session = $request->session();
        
        // Basic session age check
        $sessionAge = $session->get('last_activity');
        if ($sessionAge && now()->diffInMinutes($sessionAge) > 180) { // 3 hours max
            return false;
        }

        return true;
    }

    /**
     * Rate limiting for role checks
     */
    private function tooManyRoleAttempts($user, Request $request): bool
    {
        $key = 'role_middleware:' . $user->user_id . ':' . $request->ip();
        return RateLimiter::tooManyAttempts($key, $this->maxAttempts);
    }

    /**
     * Sanitize and validate roles
     */
    private function sanitizeRoles(array $roles): array
    {
        $validRoles = ['super_admin', 'inventory_manager', 'department_head', 'procurement_officer', 'faculty', 'staff', 'student'];
        $sanitized = [];

        foreach ($roles as $role) {
            $clean = preg_replace('/[^a-zA-Z0-9_-]/', '', $role);
            if (in_array($clean, $validRoles)) {
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

        Log::{$level}('Role Security: ' . $event, $logData);
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
        $retryAfter = RateLimiter::availableIn('role_middleware:' . Auth::id() . ':' . $request->ip());

        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Too Many Requests',
                'message' => 'Too many role checks. Please try again later.',
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