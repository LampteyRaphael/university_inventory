<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ItemCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example UUIDs for universities (replace with actual ones from your universities seeder)
        $ugId = '11111111-1111-1111-1111-111111111111';
        $knustId = '22222222-2222-2222-2222-222222222222';

        // Parent Category: Electronics
        $electronicsId = Str::uuid();

        DB::table('item_categories')->insert([
            [
                'category_id' => $electronicsId,
                'university_id' => $ugId,
                'parent_category_id' => null,
                'category_code' => 'ELEC',
                'name' => 'Electronics',
                'description' => 'Electronic devices and equipment',
                'image_url' => 'https://example.com/images/electronics.png',
                'warranty_period_days' => 365,
                'depreciation_rate' => 10.00,
                'depreciation_method' => 'straight_line',
                'requires_serial_number' => true,
                'requires_maintenance' => true,
                'maintenance_interval_days' => 180,
                'specification_template' => json_encode([
                    'brand' => 'string',
                    'model' => 'string',
                    'power' => 'watts'
                ]),
                'lft' => 1,
                'rgt' => 4,
                'depth' => 0,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            // Child: Laptops
            [
                'category_id' => Str::uuid(),
                'university_id' => $ugId,
                'parent_category_id' => $electronicsId,
                'category_code' => 'LAP',
                'name' => 'Laptops',
                'description' => 'Portable computers for staff and students',
                'image_url' => 'https://example.com/images/laptops.png',
                'warranty_period_days' => 730,
                'depreciation_rate' => 15.00,
                'depreciation_method' => 'reducing_balance',
                'requires_serial_number' => true,
                'requires_maintenance' => true,
                'maintenance_interval_days' => 365,
                'specification_template' => json_encode([
                    'processor' => 'string',
                    'ram' => 'GB',
                    'storage' => 'GB',
                ]),
                'lft' => 2,
                'rgt' => 3,
                'depth' => 1,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            // Parent Category: Furniture
            [
                'category_id' => Str::uuid(),
                'university_id' => $knustId,
                'parent_category_id' => null,
                'category_code' => 'FURN',
                'name' => 'Furniture',
                'description' => 'Furniture for offices and classrooms',
                'image_url' => 'https://example.com/images/furniture.png',
                'warranty_period_days' => 365,
                'depreciation_rate' => 8.00,
                'depreciation_method' => 'straight_line',
                'requires_serial_number' => false,
                'requires_maintenance' => false,
                'maintenance_interval_days' => null,
                'specification_template' => json_encode([
                    'material' => 'string',
                    'color' => 'string',
                ]),
                'lft' => 1,
                'rgt' => 2,
                'depth' => 0,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
        ]);
    }
}
