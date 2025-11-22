<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        // Handle Spatie permission denied errors
        if ($exception instanceof UnauthorizedException) {
            return Inertia::render('Errors/403', [
                'error' => [
                    'status' => 403,
                    'message' => $exception->getMessage()
                ]
            ])->toResponse($request)->setStatusCode(403);
        }

        // Handle other 403 errors - check if it's an HTTP exception first
        if ($exception instanceof HttpException && $exception->getStatusCode() === 403) {
            return Inertia::render('Errors/403', [
                'error' => [
                    'status' => 403,
                    'message' => $exception->getMessage() ?: 'Access denied'
                ]
            ])->toResponse($request)->setStatusCode(403);
        }

        return parent::render($request, $exception);
    }
}