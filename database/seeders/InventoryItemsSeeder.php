<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InventoryItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example UUIDs (replace with actual IDs from your universities + categories seeders)
        $ugId = '11111111-1111-1111-1111-111111111111';
        $knustId = '22222222-2222-2222-2222-222222222222';
        $electronicsCatId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        $furnitureCatId   = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

        DB::table('inventory_items')->insert([
            [
                'item_id' => Str::uuid(),
                'university_id' => $ugId,
                'category_id' => $electronicsCatId,
                'item_code' => 'LAPTOP-UG-001',
                'name' => 'Dell Latitude Laptop',
                'description' => '14-inch business laptop with Intel i7, 16GB RAM, and 512GB SSD.',
                'specifications' => json_encode([
                    'brand' => 'Dell',
                    'model' => 'Latitude 5420',
                    'processor' => 'Intel i7',
                    'ram' => '16GB',
                    'storage' => '512GB SSD',
                ]),
                'unit_of_measure' => 'pcs',
                'unit_cost' => 1200.00,
                'current_value' => 12000.00,
                'minimum_stock_level' => 5,
                'maximum_stock_level' => 50,
                'reorder_point' => 10,
                'economic_order_quantity' => 20,
                'abc_classification' => 'A',
                'weight_kg' => 1.800,
                'volume_cubic_m' => 0.0045,
                'is_hazardous' => false,
                'hazard_type' => null,
                'handling_instructions' => 'Handle with care, avoid dropping.',
                'storage_conditions' => 'Store in cool, dry environment.',
                'shelf_life_days' => null,
                'expiry_date' => null,
                'barcode' => '123456789012',
                'qr_code' => 'LAPTOP-UG-001-QR',
                'rfid_tag' => 'RFID123456',
                'image_url' => 'https://example.com/items/laptop.png',
                'document_url' => 'https://example.com/items/laptop_manual.pdf',
                'is_active' => true,
                'created_by' => Str::uuid(),
                'updated_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
            [
                'item_id' => Str::uuid(),
                'university_id' => $knustId,
                'category_id' => $furnitureCatId,
                'item_code' => 'CHAIR-KNUST-010',
                'name' => 'Ergonomic Office Chair',
                'description' => 'Adjustable office chair with lumbar support and wheels.',
                'specifications' => json_encode([
                    'material' => 'Mesh + Steel',
                    'color' => 'Black',
                    'adjustable' => true,
                ]),
                'unit_of_measure' => 'pcs',
                'unit_cost' => 150.00,
                'current_value' => 4500.00,
                'minimum_stock_level' => 20,
                'maximum_stock_level' => 200,
                'reorder_point' => 30,
                'economic_order_quantity' => 50,
                'abc_classification' => 'B',
                'weight_kg' => 12.500,
                'volume_cubic_m' => 0.0750,
                'is_hazardous' => false,
                'hazard_type' => null,
                'handling_instructions' => 'Stack carefully to avoid damage.',
                'storage_conditions' => 'Store indoors, avoid moisture.',
                'shelf_life_days' => null,
                'expiry_date' => null,
                'barcode' => '987654321098',
                'qr_code' => 'CHAIR-KNUST-010-QR',
                'rfid_tag' => 'RFID987654',
                'image_url' => 'https://example.com/items/chair.png',
                'document_url' => null,
                'is_active' => true,
                'created_by' => Str::uuid(),
                'updated_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null,
            ],
        ]);
    }
}
