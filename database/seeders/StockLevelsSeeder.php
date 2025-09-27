<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class StockLevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('stock_levels')->insert([
            [
                'stock_id' => Str::uuid(),
                'university_id' => 'ATU2223', // replace with valid id
                'item_id' => 'item_123',       // replace with valid id
                'department_id' => 'dep_123', // replace with valid id
                'location_id' => 'loc_123',   // can be null
                'current_quantity' => 100,
                'committed_quantity' => 20,
                'available_quantity' => 80,
                'on_order_quantity' => 50,
                'average_cost' => 12.50,
                'total_value' => 100 * 12.50,
                'last_count_date' => Carbon::now()->subDays(10),
                'next_count_date' => Carbon::now()->addDays(20),
                'count_frequency' => 'monthly',
                'reorder_level' => 30,
                'max_level' => 200,
                'safety_stock' => 15,
                'lead_time_days' => 7,
                'service_level' => 95.00,
                'stock_movement_stats' => json_encode([
                    'received' => 150,
                    'issued' => 70,
                    'adjustments' => 5,
                ]),
                'last_updated' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // you can add more seed records here
        ]);
    }
}
