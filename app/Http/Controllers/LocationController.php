<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Location;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $locations = Location::with([
            'university:university_id,name',
            'department:department_id,name',
        ])->get()->map(function ($location) {
            return [
                'location_id'           => $location->location_id,
                'university_id'         => $location->university_id,
                'university_name'       => optional($location->university)->name,
                'department_id'         => $location->department_id,
                'department_name'       => optional($location->department)->name,
                'location_code'         => $location->location_code,
                'name'                  => $location->name,
                'building'              => $location->building,
                'floor'                 => $location->floor,
                'room_number'           => $location->room_number,
                'aisle'                 => $location->aisle,
                'shelf'                 => $location->shelf,
                'bin'                   => $location->bin,
                'capacity'              => $location->capacity,
                'current_utilization'   => $location->current_utilization,
                'location_type'         => $location->location_type,
                'is_secured'            => $location->is_secured,
                'is_climate_controlled' => $location->is_climate_controlled,
                'temperature_min'       => $location->temperature_min,
                'temperature_max'       => $location->temperature_max,
                'humidity_min'          => $location->humidity_min,
                'humidity_max'          => $location->humidity_max,
                'is_active'             => $location->is_active,
                'managed_by'            => $location->managed_by,
            ];
        });
        
        return Inertia::render('Locations/Locations')->with([
            'locations' => Inertia::defer(fn () =>
                 $locations,
            ),
            'universities' => Inertia::defer(fn () =>
                University::select('university_id','name')->get()
            ),
            'departments' => Inertia::defer(fn () =>
                Department::select('department_id','name')->get(),
            ),

        ]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'university_id' => 'required|uuid|exists:universities,university_id',
            'department_id' => 'required|uuid|exists:departments,department_id',
            'location_code' => 'required|string|max:50|unique:locations,location_code',
            'name' => 'required|string|max:255',
            'building' => 'required|string|max:100',
            'floor' => 'nullable|string|max:50',
            'room_number' => 'nullable|string|max:50',
            'aisle' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'bin' => 'nullable|string|max:50',
            'capacity' => 'nullable|numeric|min:0',
            'current_utilization' => 'nullable|numeric|min:0',
            'location_type' => 'required|in:storage,office,lab,classroom,workshop,outdoor',
            'is_secured' => 'boolean',
            'is_climate_controlled' => 'boolean',
            'temperature_min' => 'nullable|numeric|between:-50,100',
            'temperature_max' => 'nullable|numeric|between:-50,100',
            'humidity_min' => 'nullable|numeric|between:0,100',
            'humidity_max' => 'nullable|numeric|between:0,100',
            'is_active' => 'boolean',
            'managed_by' => 'nullable|uuid',
        ]);

        // Validate capacity vs utilization
        if (isset($validated['capacity']) && isset($validated['current_utilization'])) {
            if ($validated['current_utilization'] > $validated['capacity']) {
                return Redirect::back()
                    ->with('error', 'Current utilization cannot exceed capacity')
                    ->withInput();
            }
        }

        // Validate temperature range
        if (isset($validated['temperature_min']) && isset($validated['temperature_max'])) {
            if ($validated['temperature_min'] >= $validated['temperature_max']) {
                return Redirect::back()
                    ->with('error', 'Minimum temperature must be less than maximum temperature')
                    ->withInput();
            }
        }

        // Validate humidity range
        if (isset($validated['humidity_min']) && isset($validated['humidity_max'])) {
            if ($validated['humidity_min'] >= $validated['humidity_max']) {
                return Redirect::back()
                    ->with('error', 'Minimum humidity must be less than maximum humidity')
                    ->withInput();
            }
        }

        DB::beginTransaction();
        try {
            Location::create($validated);
            DB::commit();

            return Redirect::route('locations.index')
                ->with('success', 'Location created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()
                ->with('error', 'Failed to create location: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $location = Location::with(['university', 'department'])
            ->where('location_id', $id)
            ->firstOrFail();

        return Inertia::render('Locations/Show', [
            'location' => $location
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $location = Location::where('location_id', $id)->firstOrFail();

        $validated = $request->validate([
            'university_id' => 'sometimes|uuid|exists:universities,university_id',
            'department_id' => 'sometimes|uuid|exists:departments,department_id',
            'location_code' => 'sometimes|string|max:50|unique:locations,location_code,' . $location->location_id . ',location_id',
            'name' => 'sometimes|string|max:255',
            'building' => 'sometimes|string|max:100',
            'floor' => 'nullable|string|max:50',
            'room_number' => 'nullable|string|max:50',
            'aisle' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'bin' => 'nullable|string|max:50',
            'capacity' => 'nullable|numeric|min:0',
            'current_utilization' => 'nullable|numeric|min:0',
            'location_type' => 'sometimes|in:storage,office,lab,classroom,workshop,outdoor',
            'is_secured' => 'boolean',
            'is_climate_controlled' => 'boolean',
            'temperature_min' => 'nullable|numeric|between:-50,100',
            'temperature_max' => 'nullable|numeric|between:-50,100',
            'humidity_min' => 'nullable|numeric|between:0,100',
            'humidity_max' => 'nullable|numeric|between:0,100',
            'is_active' => 'boolean',
            'managed_by' => 'nullable|uuid',
        ]);

        // Business logic validations
        if (isset($validated['current_utilization']) && isset($validated['capacity'])) {
            if ($validated['current_utilization'] > $validated['capacity']) {
                return Redirect::back()
                    ->with('error', 'Current utilization cannot exceed capacity')
                    ->withInput();
            }
        } elseif (isset($validated['current_utilization']) && $location->capacity) {
            if ($validated['current_utilization'] > $location->capacity) {
                return Redirect::back()
                    ->with('error', 'Current utilization cannot exceed capacity')
                    ->withInput();
            }
        }

        DB::beginTransaction();
        try {
            $location->update($validated);
            DB::commit();

            return Redirect::route('locations.index')
                ->with('success', 'Location updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()
                ->with('error', 'Failed to update location: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $location = Location::where('location_id', $id)->firstOrFail();

        DB::beginTransaction();
        try {
            $location->delete();
            DB::commit();

            return Redirect::route('locations.index')
                ->with('success', 'Location deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()
                ->with('error', 'Failed to delete location: ' . $e->getMessage());
        }
    }

    /**
     * Restore a soft-deleted location.
     */
    public function restore(string $id): RedirectResponse
    {
        $location = Location::withTrashed()->where('location_id', $id)->firstOrFail();

        DB::beginTransaction();
        try {
            $location->restore();
            DB::commit();

            return Redirect::route('locations.index')
                ->with('success', 'Location restored successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()
                ->with('error', 'Failed to restore location: ' . $e->getMessage());
        }
    }

    /**
     * Get location utilization statistics.
     */
    public function utilizationStats(): Response
    {
        $stats = Location::selectRaw('
            COUNT(*) as total_locations,
            SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_locations,
            SUM(capacity) as total_capacity,
            SUM(current_utilization) as total_utilization,
            location_type,
            AVG(CASE WHEN capacity > 0 THEN (current_utilization / capacity) * 100 ELSE 0 END) as avg_utilization_rate
        ')
        ->groupBy('location_type')
        ->get();

        return Inertia::render('Locations/Stats', [
            'stats' => $stats
        ]);
    }
}

