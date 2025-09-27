<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    //location controller
    public function location()
    {
        // Create a new location
        $location = Location::create([
            'university_id' => 'uni-123',
            'department_id' => 'dept-456',
            'location_code' => 'STOR-001',
            'name' => 'Main Storage Room',
            'building' => 'Science Building',
            'floor' => '1',
            'room_number' => '101',
            'aisle' => 'A',
            'shelf' => '2',
            'bin' => '3',
            'capacity' => 1000.00,
            'location_type' => Location::TYPE_STORAGE,
            'is_secured' => true,
            'is_climate_controlled' => true,
            'temperature_min' => 18.00,
            'temperature_max' => 22.00,
            'humidity_min' => 40.00,
            'humidity_max' => 60.00,
            'managed_by' => 'user-789',
        ]);

        // Get active storage locations with available capacity
        $locations = Location::active()
            ->storage()
            ->withAvailableCapacity(100.00)
            ->orderBy('building')
            ->orderBy('floor')
            ->orderBy('room_number')
            ->get();

        // Get locations near capacity
        $locationsNearCapacity = Location::whereNotNull('capacity')
            ->whereRaw('(current_utilization / capacity * 100) >= 90')
            ->get();

        // Update location utilization
        $location->updateUtilization(150.00); // Add utilization
        $location->updateUtilization(50.00, false); // Reduce utilization

        // Access computed attributes
        echo $location->full_address; // "Science Building, Floor 1, Room 101, Aisle A, Shelf 2, Bin 3"
        echo $location->detailed_location_code; // "STOR-001-A2-S2-B3"
        echo $location->utilization_percentage; // 15.0 (percentage)
        echo $location->climate_control_range; // "Temp: 18.00°C - 22.00°C | Humidity: 40.00% - 60.00%"

        // Check capacity status
        if ($location->isNearCapacity()) {
            // Handle near capacity situation
        }

        // Get capacity status label
        $status = $location->capacity_status_label;
        // Returns: ['text' => 'Within Capacity', 'class' => 'badge bg-success', 'icon' => '✅']

        // Check if location can accommodate more items
        if ($location->hasAvailableCapacity(200.00)) {
            // Proceed with storage
        }

        // Get related data
        $university = $location->university;
        $department = $location->department;
        $manager = $location->manager;
        $sourceTransactions = $location->sourceTransactions;
        $destinationTransactions = $location->destinationTransactions;
        $allTransactions = $location->allTransactions;

        // Soft delete a location
        $location->delete(); // Sets deleted_at timestamp

        // Restore a soft-deleted location
        $location->restore();

        // Permanently delete a location
        $location->forceDelete();

    }
}
