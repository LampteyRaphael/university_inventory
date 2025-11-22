<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Illuminate\Support\Str;

class UniversityController extends Controller
{
    public function index()
    {
        $universities = University::all();
        return Inertia::render('Universities/Universities', [
            'universities' => $universities,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:universities,code',
                'address' => 'nullable|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'contact_number' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'website' => 'nullable|url',
                'established_date' => 'nullable|date',
                'logo_url' => 'nullable|url',
                'is_active' => 'boolean',
            ]);

            $validated['university_id'] = (string) Str::uuid();
            
            University::create($validated);

            return redirect()->back()->with('success', 'University created successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create university: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'code' => 'sometimes|required|string|max:50|unique:universities,code,' . $id . ',university_id',
                'address' => 'nullable|string',
                'city' => 'sometimes|required|string|max:100',
                'state' => 'sometimes|required|string|max:100',
                'country' => 'sometimes|required|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'contact_number' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'website' => 'nullable|url',
                'established_date' => 'nullable|date',
                'logo_url' => 'nullable|url',
                'is_active' => 'boolean',
            ]);

            $university = University::findOrFail($id);
            $university->update($validated);

            return redirect()->back()->with('success', 'University updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update university: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $university = University::findOrFail($id);
            $university->delete();

            return redirect()->back()->with('success', 'University deleted successfully!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete university: ' . $e->getMessage());
        }
    }
}