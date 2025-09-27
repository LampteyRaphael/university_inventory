<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class LocationsTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('locations')->insert([
            [
                'location_id' => Str::uuid(),
                'university_id' => 'AT2223', // replace with actual university_id
                'department_id' => '4444', // replace with actual department_id
                'location_code' => 'LOC-001',
                'name' => 'Central Storage Warehouse',
                'building' => 'Main Warehouse Block',
                'floor' => 'Ground',
                'room_number' => 'WH1',
                'aisle' => 'A1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'capacity' => 10000.00,
                'current_utilization' => 3500.00,
                'location_type' => 'storage',
                'is_secured' => true,
                'is_climate_controlled' => true,
                'temperature_min' => 18.00,
                'temperature_max' => 25.00,
                'humidity_min' => 40.00,
                'humidity_max' => 60.00,
                'is_active' => true,
                'managed_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            [
                'location_id' => Str::uuid(),
                'university_id' => '11111111-1111-1111-1111-111111111111',
                'department_id' => '33333333-3333-3333-3333-333333333333',
                'location_code' => 'LOC-002',
                'name' => 'Computer Science Lab',
                'building' => 'Science Block',
                'floor' => '3',
                'room_number' => '301',
                'aisle' => null,
                'shelf' => null,
                'bin' => null,
                'capacity' => 200.00,
                'current_utilization' => 120.00,
                'location_type' => 'lab',
                'is_secured' => true,
                'is_climate_controlled' => true,
                'temperature_min' => 20.00,
                'temperature_max' => 23.00,
                'humidity_min' => 35.00,
                'humidity_max' => 55.00,
                'is_active' => true,
                'managed_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            [
                'location_id' => Str::uuid(),
                'university_id' => '11111111-1111-1111-1111-111111111111',
                'department_id' => '44444444-4444-4444-4444-444444444444',
                'location_code' => 'LOC-003',
                'name' => 'Engineering Workshop',
                'building' => 'Engineering Block',
                'floor' => '1',
                'room_number' => '105',
                'aisle' => 'W2',
                'shelf' => 'S3',
                'bin' => 'B4',
                'capacity' => 500.00,
                'current_utilization' => 300.00,
                'location_type' => 'workshop',
                'is_secured' => false,
                'is_climate_controlled' => false,
                'temperature_min' => null,
                'temperature_max' => null,
                'humidity_min' => null,
                'humidity_max' => null,
                'is_active' => true,
                'managed_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
        ]);
    }
}
