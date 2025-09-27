<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SuppliersTableSeeder extends Seeder
{
    public function run()
    {
        $universityId = DB::table('universities')->value('university_id'); // Ensure at least 1 university exists

        $suppliers = [
            [
                'supplier_id' => (string) Str::uuid(),
                'university_id' => $universityId,
                'supplier_code' => 'SUP-001',
                'legal_name' => 'Global Manufacturing Ltd',
                'trade_name' => 'GlobalMFG',
                'supplier_type' => 'manufacturer',
                'contact_person' => 'John Doe',
                'phone' => '+233201234567',
                'email' => 'contact@globalmfg.com',
                'website' => 'https://www.globalmfg.com',
                'address' => 'Industrial Area, Accra',
                'city' => 'Accra',
                'state' => 'Greater Accra',
                'country' => 'Ghana',
                'postal_code' => 'GA-123-4567',
                'tax_id' => 'TIN123456',
                'vat_number' => 'VAT987654',
                'credit_limit' => 50000,
                'payment_terms_days' => 30,
                'rating' => 4.5,
                'delivery_reliability' => 90,
                'quality_rating' => 88,
                'certifications' => json_encode(['ISO 9001', 'ISO 14001']),
                'is_approved' => true,
                'approval_date' => Carbon::now()->subMonths(3),
                'next_evaluation_date' => Carbon::now()->addMonths(9),
                'is_active' => true,
                'notes' => 'Preferred supplier for raw materials.',
                'approved_by' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'supplier_id' => (string) Str::uuid(),
                'university_id' => $universityId,
                'supplier_code' => 'SUP-002',
                'legal_name' => 'Tech Distributors Ltd',
                'trade_name' => 'TechDist',
                'supplier_type' => 'distributor',
                'contact_person' => 'Mary Johnson',
                'phone' => '+233501234567',
                'email' => 'sales@techdist.com',
                'website' => 'https://www.techdist.com',
                'address' => 'Spintex Road, Accra',
                'city' => 'Accra',
                'state' => 'Greater Accra',
                'country' => 'Ghana',
                'postal_code' => 'GA-789-1234',
                'tax_id' => 'TIN654321',
                'vat_number' => 'VAT123456',
                'credit_limit' => 30000,
                'payment_terms_days' => 45,
                'rating' => 4.2,
                'delivery_reliability' => 85,
                'quality_rating' => 80,
                'certifications' => json_encode(['ISO 27001']),
                'is_approved' => true,
                'approval_date' => Carbon::now()->subMonths(6),
                'next_evaluation_date' => Carbon::now()->addMonths(6),
                'is_active' => true,
                'notes' => 'Reliable IT distributor, supplies computers and accessories.',
                'approved_by' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'supplier_id' => (string) Str::uuid(),
                'university_id' => $universityId,
                'supplier_code' => 'SUP-003',
                'legal_name' => 'Quality Retailers',
                'trade_name' => 'QualiMart',
                'supplier_type' => 'retailer',
                'contact_person' => 'Kwame Mensah',
                'phone' => '+233241234567',
                'email' => 'support@qualimart.com',
                'website' => 'https://www.qualimart.com',
                'address' => 'Kumasi Central',
                'city' => 'Kumasi',
                'state' => 'Ashanti',
                'country' => 'Ghana',
                'postal_code' => 'AK-111-2222',
                'tax_id' => null,
                'vat_number' => null,
                'credit_limit' => 10000,
                'payment_terms_days' => 15,
                'rating' => 3.8,
                'delivery_reliability' => 70,
                'quality_rating' => 75,
                'certifications' => null,
                'is_approved' => false,
                'approval_date' => null,
                'next_evaluation_date' => null,
                'is_active' => true,
                'notes' => 'Retail supplier for general goods.',
                'approved_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('suppliers')->insert($suppliers);
    }
}
