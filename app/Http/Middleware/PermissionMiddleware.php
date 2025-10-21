<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use App\Models\RolePermission;
use App\Models\Permission;

class PermissionMiddleware
{
    // Rate limiting for security
    protected int $maxAttempts = 15;
    protected int $decayMinutes = 2;

    // Cache settings
    protected int $cacheTtl = 300; // 5 minutes
    protected bool $enableCaching = true;

    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = Auth::user();

        if (!$user) {
            $this->logSecurityEvent('unauthenticated_access_attempt', $request, [
                'permissions' => $permissions,
                'path' => $request->path()
            ]);
            return $this->unauthorizedResponse($request);
        }

        // Super admin bypass - grant all access
        if ($this->isSuperAdmin($user)) {
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
                'user_id' => $user->user_id,
                'original_permissions' => func_get_args()
            ]);
            return $this->forbiddenResponse($request, 'Invalid permission configuration.');
        }

        // Rate limiting to prevent brute force attacks
        if ($this->tooManyPermissionAttempts($user, $request)) {
            $this->logSecurityEvent('permission_rate_limit_exceeded', $request, [
                'user_id' => $user->user_id,
                'ip' => $request->ip()
            ]);
            return $this->rateLimitResponse($request);
        }

        // Enhanced security checks before permission validation
        $securityCheck = $this->preFlightSecurityChecks($user, $request);
        if ($securityCheck !== true) {
            return $securityCheck;
        }

        // Check permissions using RolePermission model
        if (!$this->hasRequiredPermissions($user, $permissions, $request)) {
            $this->logSecurityEvent('permission_denied', $request, [
                'user_id' => $user->user_id,
                'required_permissions' => $permissions,
                'user_role' => $user->role?->name ?? 'No Role',
                'user_permissions' => $this->getUserPermissionSummary($user),
                'user_agent' => $this->safeUserAgent($request),
                'ip_address' => $request->ip(),
                'route' => $request->route()?->getName()
            ]);
            
            return $this->forbiddenResponse($request, 
                'You do not have the required permissions to access this resource.'
            );
        }

        // Log successful access for audit trail
        $this->logSecurityEvent('permission_granted', $request, [
            'user_id' => $user->user_id,
            'permissions' => $permissions,
            'access_level' => $this->calculateAccessLevel($user, $permissions)
        ], 'info');

        return $next($request);
    }

    /**
     * Enhanced permission checking using RolePermission model
     */
    private function hasRequiredPermissions($user, array $requiredPermissions, Request $request): bool
    {
        // Get user's role ID
        $roleId = $user->role_id;
        if (!$roleId) {
            return false;
        }

        // Check cache first if enabled
        $cacheKey = $this->enableCaching ? "user_permissions:{$user->user_id}" : null;
        
        if ($cacheKey && Cache::has($cacheKey)) {
            $userPermissions = Cache::get($cacheKey);
        } else {
            // Fetch permissions from database using RolePermission model
            $userPermissions = $this->fetchUserPermissions($user, $roleId);
            
            if ($cacheKey) {
                Cache::put($cacheKey, $userPermissions, $this->cacheTtl);
            }
        }

        // Check if user has any of the required permissions
        foreach ($requiredPermissions as $requiredPermission) {
            if ($this->checkSinglePermission($userPermissions, $requiredPermission, $request)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch user permissions using RolePermission model with optimizations
     */
    private function fetchUserPermissions($user, string $roleId): array
    {
        return RolePermission::with(['permission'])
            ->where('role_id', $roleId)
            ->where('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->get()
            ->mapWithKeys(function ($rolePermission) {
                $permissionName = $rolePermission->permission?->name;
                if ($permissionName) {
                    return [
                        $permissionName => [
                            'constraints' => $rolePermission->constraints,
                            'expires_at' => $rolePermission->expires_at,
                            'granted_at' => $rolePermission->granted_at,
                            'is_active' => $rolePermission->isActive()
                        ]
                    ];
                }
                return [];
            })
            ->filter()
            ->toArray();
    }

    /**
     * Check a single permission with constraint validation
     */
    private function checkSinglePermission(array $userPermissions, string $requiredPermission, Request $request): bool
    {
        if (!isset($userPermissions[$requiredPermission])) {
            return false;
        }

        $permissionData = $userPermissions[$requiredPermission];

        // Check if permission is still active
        if (!$permissionData['is_active']) {
            return false;
        }

        // Check constraints if they exist
        if (!empty($permissionData['constraints'])) {
            return $this->validateConstraints($permissionData['constraints'], $request);
        }

        return true;
    }

    /**
     * Validate permission constraints against request data
     */
    private function validateConstraints(?array $constraints, Request $request): bool
    {
        if (empty($constraints)) {
            return true;
        }

        foreach ($constraints as $key => $expectedValue) {
            $actualValue = $this->getConstraintValue($key, $request);
            
            if ($actualValue !== $expectedValue) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get constraint value from request
     */
    private function getConstraintValue(string $key, Request $request)
    {
        // Check route parameters
        if ($request->route()->hasParameter($key)) {
            return $request->route()->parameter($key);
        }

        // Check request input
        if ($request->has($key)) {
            return $request->input($key);
        }

        // Check user attributes
        if (Auth::check() && isset(Auth::user()->{$key})) {
            return Auth::user()->{$key};
        }

        // Check headers
        return $request->header($key);
    }

    /**
     * Enhanced security checks before permission validation
     */
    private function preFlightSecurityChecks($user, Request $request)
    {
        // Check if user account is active
        if (!$user->is_active) {
            $this->logSecurityEvent('inactive_account_access', $request, [
                'user_id' => $user->user_id,
                'account_status' => 'inactive'
            ]);
            return $this->forbiddenResponse($request, 'Your account has been deactivated.');
        }

        // Check for suspicious user patterns
        $suspiciousActivity = $this->detectSuspiciousActivity($user, $request);
        if ($suspiciousActivity === 'block') {
            $this->logSecurityEvent('suspicious_activity_blocked', $request, [
                'user_id' => $user->user_id,
                'ip' => $request->ip(),
                'reason' => 'suspicious_pattern'
            ]);
            return $this->forbiddenResponse($request, 'Suspicious activity detected. Access blocked.');
        }

        // Validate user session security
        if (!$this->validateSessionSecurity($request)) {
            $this->logSecurityEvent('session_security_issue', $request, [
                'user_id' => $user->user_id,
                'session_id' => $request->session()->getId()
            ]);
            return $this->unauthorizedResponse($request);
        }

        // Check if user's role is still active
        if (!$user->role || !$user->role->is_active) {
            $this->logSecurityEvent('inactive_role_access', $request, [
                'user_id' => $user->user_id,
                'role_id' => $user->role_id
            ]);
            return $this->forbiddenResponse($request, 'Your role is no longer active.');
        }

        return true;
    }

    /**
     * Enhanced suspicious activity detection
     */
    private function detectSuspiciousActivity($user, Request $request): string
    {
        $userAgent = $request->userAgent();
        
        // Check for automated behavior patterns
        if ($userAgent && preg_match('/bot|crawl|scraper|script|python|java|curl|wget/i', $userAgent)) {
            return 'block';
        }

        // Check for rapid successive permission checks
        $key = 'permission_attempts:' . $user->user_id;
        $attempts = RateLimiter::attempts($key);
        
        if ($attempts > 10) {
            return 'block';
        }

        // Check for unusual access patterns
        $accessPatternKey = 'access_pattern:' . $user->user_id . ':' . $request->ip();
        $accessCount = Cache::get($accessPatternKey, 0);
        
        if ($accessCount > 50) { // More than 50 accesses in cache period
            return 'block';
        }

        Cache::put($accessPatternKey, $accessCount + 1, 300); // 5 minutes

        return 'allow';
    }

    /**
     * Enhanced session security validation
     */
    private function validateSessionSecurity(Request $request): bool
    {
        $session = $request->session();
        
        if (!$session->isStarted()) {
            return false;
        }

        // Check if session is too old (potential hijacking)
        $sessionAge = $session->get('created_at');
        if ($sessionAge && now()->diffInMinutes($sessionAge) > 120) { // 2 hours max
            $session->flush();
            return false;
        }

        // Check session regeneration
        $lastRegeneration = $session->get('last_regeneration');
        if ($lastRegeneration && now()->diffInMinutes($lastRegeneration) > 30) {
            // Session should be regenerated periodically
            $session->regenerate();
            $session->put('last_regeneration', now());
        }

        return true;
    }

    /**
     * Check if user is super admin
     */
    private function isSuperAdmin($user): bool
    {
        return $user?->role??'' && $user?->role?->name === 'super_admin';
    }

    /**
     * Calculate access level for logging
     */
    private function calculateAccessLevel($user, array $permissions): string
    {
        $permissionCount = count($permissions);
        
        if ($permissionCount === 0) return 'none';
        if ($permissionCount === 1) return 'single';
        if ($permissionCount <= 3) return 'multiple';
        if ($permissionCount <= 10) return 'extensive';
        
        return 'administrative';
    }

    /**
     * Get user permission summary for logging
     */
    private function getUserPermissionSummary($user): array
    {
        if (!$user->role_id) {
            return ['count' => 0, 'permissions' => []];
        }

        $permissionCount = RolePermission::where('role_id', $user->role_id)
            ->where('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->count();

        return [
            'count' => $permissionCount,
            'role_name' => $user->role?->name
        ];
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
            'timestamp' => now()->toISOString(),
            'middleware' => 'PermissionMiddleware'
        ], $context);

        Log::{$level}('Security: ' . $event, $logData);

        // Also log to security channel if configured
        if (config('logging.channels.security')) {
            Log::channel('security')->{$level}($event, $logData);
        }
    }

    private function unauthorizedResponse(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Authentication Required',
                'message' => 'Please log in to access this resource.',
                'reference_id' => $this->generateReferenceId()
            ], 401);
        }

        if ($request->inertia()) {
            return Inertia::location(route('login'));
        }

        return redirect()->route('login')->with([
            'error' => 'Please log in to access this resource.',
            'intended' => $request->fullUrl(),
            'reference_id' => $this->generateReferenceId()
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
        $key = 'permission_middleware:' . Auth::id() . ':' . $request->ip();
        $retryAfter = RateLimiter::availableIn($key);

        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Too Many Requests',
                'message' => 'Too many permission checks. Please try again later.',
                'retry_after' => $retryAfter,
                'reference_id' => $this->generateReferenceId()
            ], 429);
        }

        return back()->with([
            'error' => 'Too many permission requests. Please wait ' . $retryAfter . ' seconds.',
            'error_type' => 'rate_limit',
            'reference_id' => $this->generateReferenceId()
        ]);
    }

    private function generateReferenceId(): string
    {
        return 'REF-' . strtoupper(substr(md5(uniqid()), 0, 8)) . '-' . time();
    }
} 