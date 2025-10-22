<?php

use App\Http\Middleware\AuthMiddleware;
use App\Http\Middleware\CheckRolePermission;
use App\Http\Middleware\UniversityAccessMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->alias([
            'auth.custom' => AuthMiddleware::class,
            'university.access' => UniversityAccessMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {

    // Handle 403 Forbidden
    $exceptions->render(function (Throwable $e, $request) {

        if (! $request->inertia()) {
            return null; // Let Laravel handle non-Inertia requests normally
        }

        $status = 500; // Default error code
        $message = $e->getMessage() ?: 'Something went wrong';

        // Detect known HTTP exceptions
        if ($e instanceof HttpException) {
            $status = $e->getStatusCode();
        } elseif ($e instanceof ValidationException) {
            $status = 422;
        } elseif ($e instanceof AuthenticationException) {
            $status = 401;
        } elseif ($e instanceof AuthorizationException) {
            $status = 403;
        } elseif ($e instanceof TokenMismatchException) {
            $status = 419;
        }

        // Map status codes to error page names
        $pages = [
            401 => 'Errors/401',
            403 => 'Errors/403',
            404 => 'Errors/404',
            419 => 'Errors/419',
            422 => 'Errors/422',
            429 => 'Errors/429',
            500 => 'Errors/500',
            503 => 'Errors/503',
        ];

        $page = $pages[$status] ?? 'Errors/500';

        return Inertia::render('Error', [
            'status' => $status,
            'message' => $message,
        ])->toResponse($request)->setStatusCode($status);
    });
        //
    })->create();
