<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class UniversityController extends Controller
{
        public function index()
        {
                $universities= University::all();
                return Inertia::render('Universities/Universities', [
                    'universities'=>$universities,
                ]);
        }

}
