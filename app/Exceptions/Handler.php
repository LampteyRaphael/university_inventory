<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Throwable;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{

public function render($request, Throwable $exception)
{
    if ($exception instanceof HttpException && $exception->getStatusCode() === 403) {
        return Inertia::render('Errors/403')->toResponse($request)
            ->setStatusCode(403);
    }

    return parent::render($request, $exception);
}

}