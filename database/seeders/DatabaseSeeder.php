<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Department;
use App\Models\User;
use App\Models\ItemCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear any existing data first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        Department::truncate();
        ItemCategory::truncate();
        InventoryItem::truncate();
        Supplier::truncate(); 
        PurchaseOrder::truncate(); 
        University::truncate();
        PurchaseOrderItem::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create 3 universities with pre-defined data
        $universities = $this->createUniversities();
        
        // Create departments with guaranteed unique codes per university
        $departments = $this->createDepartments($universities);
        
        // Create all users
        $this->createUsers($universities, $departments);
        
        // Create item categories
        $this->createItemCategories($universities);
        
        // Create inventory items
        $inventoryItems=$this->createInventoryItems($universities);

        $suppliers=$this->createSuppliers($universities);

        $purchaseOrders=$this->createPurchaseOrders($universities, $departments, $suppliers);

        $this->createPurchaseOrderItems($purchaseOrders, $inventoryItems);


            
        // Output statistics
        $this->outputStatistics();
    }

    private function createUniversities()
    {
        $universitiesData = [
            [
                'name' => 'University of Ghana',
                'code' => 'UG',
                'city' => 'Accra',
                'region' => 'Greater Accra',
            ],
            [
                'name' => 'Kwame Nkrumah University of Science and Technology',
                'code' => 'KNUST', 
                'city' => 'Kumasi',
                'region' => 'Ashanti',
            ],
            [
                'name' => 'University of Cape Coast',
                'code' => 'UCC',
                'city' => 'Cape Coast', 
                'region' => 'Central',
            ],
        ];

        $universities = collect();
        foreach ($universitiesData as $uniData) {
            $university = University::create([
                'university_id' => Str::uuid(),
                'name' => $uniData['name'],
                'code' => $uniData['code'],
                'address' => fake()->streetAddress() . ', ' . $uniData['city'],
                'city' => $uniData['city'],
                'state' => $uniData['region'],
                'country' => 'Ghana',
                'postal_code' => 'GA' . fake()->numberBetween(100, 999),
                'contact_number' => '+233 024 ' . fake()->numberBetween(1000000, 9999999),
                'email' => 'info@' . Str::lower($uniData['code']) . '.edu.gh',
                'website' => 'https://www.' . Str::lower($uniData['code']) . '.edu.gh',
                'established_date' => fake()->dateTimeBetween('-70 years', '-10 years'),
                'logo_url' => fake()->imageUrl(200, 200, 'university'),
                'settings' => json_encode(['timezone' => 'Africa/Accra', 'language' => 'en']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $universities->push($university);
            $this->command->info("Created university: {$uniData['name']} ({$uniData['code']})");
        }

        return $universities;
    }

    private function createDepartments($universities)
    {
        $allDepartmentTemplates = [
            ['name' => 'Computer Science', 'code' => 'CS'],
            ['name' => 'Electrical Engineering', 'code' => 'EE'],
            ['name' => 'Mechanical Engineering', 'code' => 'ME'],
            ['name' => 'Civil Engineering', 'code' => 'CE'],
            ['name' => 'Biology', 'code' => 'BIO'],
            ['name' => 'Chemistry', 'code' => 'CHEM'],
            ['name' => 'Physics', 'code' => 'PHY'],
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'Business Administration', 'code' => 'BUS'],
            ['name' => 'Economics', 'code' => 'ECON'],
            ['name' => 'Psychology', 'code' => 'PSY'],
            ['name' => 'Sociology', 'code' => 'SOC'],
            ['name' => 'History', 'code' => 'HIST'],
            ['name' => 'English Literature', 'code' => 'ENG'],
            ['name' => 'Political Science', 'code' => 'POLI'],
        ];

        $departments = collect();
        
        $universities->each(function ($university) use (&$departments, $allDepartmentTemplates) {
            $departmentCount = random_int(4, 6);
            $this->command->info("Creating {$departmentCount} departments for university: {$university->name}");
            
            // Shuffle and take unique departments for this university
            shuffle($allDepartmentTemplates);
            $selectedDepartments = array_slice($allDepartmentTemplates, 0, $departmentCount);
            
            foreach ($selectedDepartments as $dept) {
                $department = Department::create([
                    'department_id' => Str::uuid(),
                    'university_id' => $university->university_id,
                    'department_code' => $dept['code'],
                    'name' => $dept['name'],
                    'building' => $this->getRandomBuilding(),
                    'floor' => $this->getRandomFloor(),
                    'room_number' => $this->getRandomRoom(),
                    'contact_person' => fake()->name(),
                    'contact_email' => Str::lower($dept['code']) . '@' . fake()->domainName(),
                    'contact_phone' => fake()->phoneNumber(),
                    'annual_budget' => fake()->randomFloat(2, 50000, 500000),
                    'remaining_budget' => fake()->randomFloat(2, 0, 500000),
                    'department_head_id' => null,
                    'is_active' => true,
                    'custom_fields' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $departments->push($department);
                $this->command->info("  - Created department: {$department->name} ({$department->department_code})");
            }
        });

        return $departments;
    }

    private function createUsers($universities, $departments)
    {
        // Track used emails and employee IDs
        $usedEmails = [];
        $usedEmployeeIds = [];

        // Create super admin user
        $superAdmin = User::create([
            'user_id' => Str::uuid(),
            'university_id' => $universities->first()->university_id,
            'department_id' => $departments->first()->department_id,
            'employee_id' => 'EMP0001',
            'username' => 'admin',
            'email' => 'admin@university.edu',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'name' => 'admin',
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'phone' => fake()->phoneNumber(),
            'position' => 'System Administrator',
            'role' => 'super_admin',
            'permissions' => json_encode(['*']),
            'is_active' => true,
            'hire_date' => now(),
            'timezone' => 'UTC',
            'language' => 'en',
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $usedEmails[] = 'admin@university.edu';
        $usedEmployeeIds[] = 'EMP0001';
        $this->command->info("Created super admin: admin@university.edu");

        // Create inventory managers (1 per university)
        $universities->each(function ($university) use ($departments, &$usedEmails, &$usedEmployeeIds) {
            $employeeId = $this->generateUniqueEmployeeId('INV', $usedEmployeeIds);
            $email = $this->generateUniqueEmail('inventory', $university->code, $usedEmails);
            
            $usedEmployeeIds[] = $employeeId;
            $usedEmails[] = $email;
            
            User::create([
                'user_id' => Str::uuid(),
                'university_id' => $university->university_id,
                'department_id' => $departments->where('university_id', $university->university_id)->first()->department_id,
                'employee_id' => $employeeId,
                'username' => 'inventory.' . Str::lower($university->code),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'name' => 'inventory.' . Str::lower($university->code),
                'first_name' => 'Inventory',
                'last_name' => 'Manager',
                'phone' => fake()->phoneNumber(),
                'position' => 'Inventory Manager',
                'role' => 'inventory_manager',
                'permissions' => json_encode(['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'reports.view']),
                'is_active' => true,
                'hire_date' => now(),
                'timezone' => 'UTC',
                'language' => 'en',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info("Created inventory manager for {$university->name}");
        });

        // Create department heads (1 per department) with unique emails
        $departments->each(function ($department) use (&$usedEmails, &$usedEmployeeIds) {
            $employeeId = $this->generateUniqueEmployeeId('DEPT', $usedEmployeeIds);
            $email = $this->generateUniqueEmail('head', $department->department_code, $usedEmails);
            
            $usedEmployeeIds[] = $employeeId;
            $usedEmails[] = $email;

            $departmentHead = User::create([
                'user_id' => Str::uuid(),
                'university_id' => $department->university_id,
                'department_id' => $department->department_id,
                'employee_id' => $employeeId,
                'username' => 'head.' . Str::lower($department->department_code) . '.' . Str::substr($department->university_id, 0, 4),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'name' => 'head.' . Str::lower($department->department_code) . '.' . Str::substr($department->university_id, 0, 4),
                'first_name' => 'Department',
                'last_name' => 'Head',
                'phone' => fake()->phoneNumber(),
                'position' => 'Head of ' . $department->name,
                'role' => 'department_head',
                'permissions' => json_encode(['inventory.view', 'requests.create', 'requests.approve', 'reports.view', 'budget.view']),
                'is_active' => true,
                'hire_date' => now(),
                'timezone' => 'UTC',
                'language' => 'en',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update department with head
            $department->update([
                'department_head_id' => $departmentHead->user_id,
                'contact_person' => $departmentHead->first_name . ' ' . $departmentHead->last_name,
                'contact_email' => $departmentHead->email,
                'contact_phone' => $departmentHead->phone,
            ]);
            
            $this->command->info("Created department head for {$department->name}");
        });

        // Create additional users (faculty, staff, etc.)
        $this->createAdditionalUsers($universities, $departments, $usedEmails, $usedEmployeeIds);
    }

    private function createAdditionalUsers($universities, $departments, &$usedEmails, &$usedEmployeeIds)
    {
        // Create faculty members (3-5 per department)
        $departments->each(function ($department) use (&$usedEmails, &$usedEmployeeIds) {
            $facultyCount = random_int(3, 5);
            for ($i = 0; $i < $facultyCount; $i++) {
                $employeeId = $this->generateUniqueEmployeeId('FAC', $usedEmployeeIds);
                $email = $this->generateUniqueEmail('faculty', $department->department_code . $i, $usedEmails);
                
                $usedEmployeeIds[] = $employeeId;
                $usedEmails[] = $email;
                
                User::create([
                    'user_id' => Str::uuid(),
                    'university_id' => $department->university_id,
                    'department_id' => $department->department_id,
                    'employee_id' => $employeeId,
                    'username' => 'faculty.' . Str::lower($department->department_code) . $i . '.' . Str::substr($department->university_id, 0, 4),
                    'email' => $email,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'name' => 'faculty.' . Str::lower($department->department_code) . $i . '.' . Str::substr($department->university_id, 0, 4),
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'phone' => fake()->phoneNumber(),
                    'position' => fake()->randomElement(['Professor', 'Associate Professor', 'Assistant Professor']),
                    'role' => 'faculty',
                    'permissions' => json_encode(['inventory.view', 'requests.create', 'profile.edit']),
                    'is_active' => true,
                    'hire_date' => now(),
                    'timezone' => 'UTC',
                    'language' => 'en',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->command->info("Created {$facultyCount} faculty members for {$department->name}");
        });

        // Create staff members (2-4 per department)
        $departments->each(function ($department) use (&$usedEmails, &$usedEmployeeIds) {
            $staffCount = random_int(2, 4);
            for ($i = 0; $i < $staffCount; $i++) {
                $employeeId = $this->generateUniqueEmployeeId('STAFF', $usedEmployeeIds);
                $email = $this->generateUniqueEmail('staff', $department->department_code . $i, $usedEmails);
                
                $usedEmployeeIds[] = $employeeId;
                $usedEmails[] = $email;
                
                User::create([
                    'user_id' => Str::uuid(),
                    'university_id' => $department->university_id,
                    'department_id' => $department->department_id,
                    'employee_id' => $employeeId,
                    'username' => 'staff.' . Str::lower($department->department_code) . $i . '.' . Str::substr($department->university_id, 0, 4),
                    'email' => $email,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'name' => 'staff.' . Str::lower($department->department_code) . $i . '.' . Str::substr($department->university_id, 0, 4),
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'phone' => fake()->phoneNumber(),
                    'position' => fake()->randomElement(['Administrative Assistant', 'Office Manager', 'IT Support']),
                    'role' => 'staff',
                    'permissions' => json_encode(['inventory.view', 'requests.create', 'profile.edit']),
                    'is_active' => true,
                    'hire_date' => now(),
                    'timezone' => 'UTC',
                    'language' => 'en',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->command->info("Created {$staffCount} staff members for {$department->name}");
        });
    }

    private function createItemCategories($universities)
    {
        $universities->each(function ($university) {
            $this->command->info("Creating item categories for university: {$university->name}");
            
            $categories = [
                ['name' => 'Electronics', 'code' => 'ELEC'],
                ['name' => 'Furniture', 'code' => 'FURN'],
                ['name' => 'Lab Equipment', 'code' => 'LAB'],
                ['name' => 'Office Supplies', 'code' => 'OFFICE'],
                ['name' => 'Vehicles', 'code' => 'VEH'],
            ];

            foreach ($categories as $category) {
                ItemCategory::create([
                    'category_id' => Str::uuid(),
                    'university_id' => $university->university_id,
                    'parent_category_id' => null,
                    'category_code' => $category['code'],
                    'name' => $category['name'],
                    'description' => "All {$category['name']} related items",
                    'warranty_period_days' => fake()->numberBetween(0, 365),
                    'depreciation_rate' => fake()->randomFloat(2, 5, 30),
                    'depreciation_method' => 'straight_line',
                    'requires_serial_number' => $category['code'] === 'ELEC',
                    'requires_maintenance' => $category['code'] === 'LAB',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("  - Created category: {$category['name']}");
            }
        });
    }

    private function createInventoryItems($universities)
    {
        $inventoryItems = collect(); // Create a collection to store all items
        
        $universities->each(function ($university) use (&$inventoryItems) {
            $categories = ItemCategory::where('university_id', $university->university_id)->get();
            $users = User::where('university_id', $university->university_id)->get();
            
            if ($users->isEmpty()) {
                $this->command->error("No users found for university: {$university->name}");
                return;
            }
            
            $this->command->info("Creating inventory items for university: {$university->name}");
            
            $categories->each(function ($category) use ($users, &$inventoryItems) {
                $itemCount = random_int(3, 8);
                for ($i = 0; $i < $itemCount; $i++) {
                    $item = InventoryItem::create([
                        'item_id' => Str::uuid(),
                        'university_id' => $category->university_id,
                        'category_id' => $category->category_id,
                        'item_code' => 'ITEM' . fake()->unique()->numberBetween(10000, 99999),
                        'name' => fake()->words(3, true),
                        'description' => fake()->sentence(),
                        'unit_of_measure' => 'Piece',
                        'unit_cost' => fake()->randomFloat(2, 10, 1000),
                        'current_value' => fake()->randomFloat(2, 5, 800),
                        'minimum_stock_level' => fake()->numberBetween(1, 10),
                        'reorder_point' => fake()->numberBetween(5, 15),
                        'abc_classification' => 'C',
                        'is_active' => true,
                        'created_by' => $users->random()->user_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $inventoryItems->push($item); // Add each item to the collection
                }
                $this->command->info("  - Created {$itemCount} items for category: {$category->name}");
            });
        });
        
        return $inventoryItems; // Return the collection of created items
    }
    
    private function createSuppliers($universities)
    {
        $supplierTypes = ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service'];
        $ghanaianCities = ['Accra', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tamale', 'Sunyani', 'Ho', 'Koforidua'];
        $ghanaianRegions = ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Volta', 'Eastern'];
        
        $suppliers = collect();
        
        $universities->each(function ($university) use (&$suppliers, $supplierTypes, $ghanaianCities, $ghanaianRegions) {
            $supplierCount = random_int(8, 15);
            $this->command->info("Creating {$supplierCount} suppliers for university: {$university->name}");
            
            for ($i = 0; $i < $supplierCount; $i++) {
                $supplierCode = 'SUP' . $university->code . str_pad($i + 1, 3, '0', STR_PAD_LEFT);
                $legalName = $this->generateSupplierName();
                $city = fake()->randomElement($ghanaianCities);
                $region = fake()->randomElement($ghanaianRegions);
                
                $supplier = \App\Models\Supplier::create([
                    'supplier_id' => Str::uuid(),
                    'university_id' => $university->university_id,
                    'supplier_code' => $supplierCode,
                    'legal_name' => $legalName,
                    'trade_name' => fake()->optional(70)->company(),
                    'supplier_type' => fake()->randomElement($supplierTypes),
                    'contact_person' => fake()->name(),
                    'phone' => '+233 ' . fake()->randomElement(['024', '025', '026', '027']) . ' ' . fake()->numberBetween(1000000, 9999999),
                    'email' => 'contact@' . Str::slug($legalName) . '.com',
                    'website' => fake()->optional(60)->url(),
                    'address' => fake()->streetAddress() . ', ' . $city,
                    'city' => $city,
                    'state' => $region,
                    'country' => 'Ghana',
                    'postal_code' => fake()->postcode(),
                    'tax_id' => fake()->optional(50)->bothify('TIN#########'),
                    'vat_number' => fake()->optional(40)->bothify('VAT#########'),
                    'credit_limit' => fake()->optional(70)->randomFloat(2, 1000, 50000),
                    'payment_terms_days' => fake()->randomElement([15, 30, 45, 60]),
                    'rating' => fake()->randomFloat(2, 3, 5),
                    'delivery_reliability' => fake()->numberBetween(80, 100),
                    'quality_rating' => fake()->numberBetween(85, 100),
                    'certifications' => fake()->optional(50)->passthrough([
                        'iso_9001' => fake()->boolean(60),
                        'iso_14001' => fake()->boolean(40),
                        'ghana_fda' => fake()->boolean(70),
                        'local_content' => fake()->boolean(80),
                    ]),
                    'is_approved' => fake()->boolean(80),
                    'approval_date' => fake()->optional(70)->dateTimeBetween('-2 years', 'now'),
                    'next_evaluation_date' => fake()->optional(60)->dateTimeBetween('now', '+1 year'),
                    'is_active' => fake()->boolean(90),
                    'notes' => fake()->optional(40)->sentence(),
                    'approved_by' => null,
                    'created_at' => fake()->dateTimeBetween('-2 years', 'now'),
                    'updated_at' => fake()->dateTimeBetween('-1 year', 'now'),
                ]);
                
                $suppliers->push($supplier);
                $this->command->info("  - Created supplier: {$supplier->legal_name} ({$supplier->supplier_code})");
            }
        });
        
        return $suppliers;
    }

    private function createPurchaseOrders($universities, $departments, $suppliers)
    {
        $orderTypes = ['regular', 'emergency', 'capital', 'consumable', 'service'];
        $currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
        $statuses = ['draft', 'submitted', 'approved', 'ordered', 'partially_received', 'received', 'cancelled', 'closed'];
        $paymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
        
        $purchaseOrders = collect();
        
        $universities->each(function ($university) use (&$purchaseOrders, $departments, $suppliers, $orderTypes, $currencies, $statuses, $paymentStatuses) {
            $orderCount = random_int(5, 12);
            $this->command->info("Creating {$orderCount} purchase orders for university: {$university->name}");
            
            $universityDepartments = $departments->where('university_id', $university->university_id);
            $universitySuppliers = $suppliers->where('university_id', $university->university_id);
            $universityUsers = User::where('university_id', $university->university_id)->get();
            
            if ($universityDepartments->isEmpty() || $universitySuppliers->isEmpty() || $universityUsers->isEmpty()) {
                $this->command->error("No departments, suppliers, or users found for university: {$university->name}");
                return;
            }
            
            for ($i = 0; $i < $orderCount; $i++) {
                $poNumber = 'PO-' . $university->code . '-' . date('Y') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
                $department = $universityDepartments->random();
                $supplier = $universitySuppliers->random();
                $requestedBy = $universityUsers->random();
                
                // Fix for approved_by - get user first, then apply optional
                $approvingUser = fake()->optional(70)->randomElement($universityUsers);
                $approvedBy = $approvingUser ? $approvingUser->user_id : null;
                
                $subtotal = fake()->randomFloat(2, 1000, 50000);
                $taxAmount = $subtotal * 0.15; // 15% tax
                $shippingAmount = fake()->randomFloat(2, 50, 500);
                $discountAmount = fake()->optional(40)->randomFloat(2, 100, 1000) ?? 0; // Default to 0 if null
                $totalAmount = $subtotal + $taxAmount + $shippingAmount - $discountAmount;
                
                $orderDate = fake()->dateTimeBetween('-1 year', 'now');
                $expectedDeliveryDate = fake()->dateTimeBetween($orderDate, '+3 months');
                $actualDeliveryDate = fake()->optional(60)->dateTimeBetween($orderDate, $expectedDeliveryDate);
                
                $purchaseOrder = \App\Models\PurchaseOrder::create([
                    'order_id' => Str::uuid(),
                    'university_id' => $university->university_id,
                    'supplier_id' => $supplier->supplier_id,
                    'department_id' => $department->department_id,
                    'po_number' => $poNumber,
                    'order_type' => fake()->randomElement($orderTypes),
                    'order_date' => $orderDate,
                    'expected_delivery_date' => $expectedDeliveryDate,
                    'actual_delivery_date' => $actualDeliveryDate,
                    'subtotal_amount' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'shipping_amount' => $shippingAmount,
                    'discount_amount' => $discountAmount,
                    'total_amount' => $totalAmount,
                    'currency' => fake()->randomElement($currencies),
                    'exchange_rate' => fake()->randomFloat(4, 0.8, 1.2),
                    'status' => fake()->randomElement($statuses),
                    'payment_status' => fake()->randomElement($paymentStatuses),
                    'notes' => fake()->optional(50)->sentence(),
                    'terms_and_conditions' => fake()->optional(30)->text(),
                    'requested_by' => $requestedBy->user_id,
                    'approved_by' => $approvedBy, // This can be null now
                    'approved_at' => $approvedBy ? fake()->dateTimeBetween($orderDate, 'now') : null,
                    'received_by' => $actualDeliveryDate ? fake()->randomElement($universityUsers->pluck('user_id')->toArray()) : null,
                    'created_at' => $orderDate,
                    'updated_at' => fake()->dateTimeBetween($orderDate, 'now'),
                ]);
                
                $purchaseOrders->push($purchaseOrder);
                $this->command->info("  - Created purchase order: {$purchaseOrder->po_number} ({$purchaseOrder->status})");
            }
        });
        
        return $purchaseOrders;
    }


    private function createPurchaseOrderItems($purchaseOrders, $inventoryItems)
    {
        // Add detailed debugging
        $this->command->info("=== Starting Purchase Order Items Seeder ===");
        $this->command->info("Purchase Orders count: " . $purchaseOrders->count());
        $this->command->info("Inventory Items count: " . $inventoryItems->count());
        
        if (!$inventoryItems || $inventoryItems->isEmpty()) {
            $this->command->error("❌ No inventory items provided to create purchase order items");
            return collect();
        }

        if ($purchaseOrders->isEmpty()) {
            $this->command->error("❌ No purchase orders provided");
            return collect();
        }

        $purchaseOrderItems = collect();
        $totalItemsCreated = 0;

        $purchaseOrders->each(function ($purchaseOrder) use (&$purchaseOrderItems, $inventoryItems, &$totalItemsCreated) {
            $itemCount = random_int(2, 8);
            $this->command->info("Creating {$itemCount} items for purchase order: {$purchaseOrder->po_number} (University: {$purchaseOrder->university_id})");
            
            // Get items that belong to the same university as the purchase order
            $universityItems = $inventoryItems->where('university_id', $purchaseOrder->university_id);
            
            $this->command->info("  Found {$universityItems->count()} inventory items for this university");
            
            if ($universityItems->isEmpty()) {
                $this->command->warn("  ⚠️ No inventory items found for university: {$purchaseOrder->university_id}");
                return;
            }
            
            // Ensure we don't request more items than available
            $actualItemCount = min($itemCount, $universityItems->count());
            $this->command->info("  Selecting {$actualItemCount} random items");
            
            // Select random items for this purchase order - handle single vs multiple items properly
            $selectedItems = $universityItems->random($actualItemCount);
            
            // Ensure we always have a collection (random() returns single model if count=1)
            if (!is_iterable($selectedItems)) {
                $selectedItems = collect([$selectedItems]);
            } else {
                $selectedItems = collect($selectedItems);
            }

            $this->command->info("  Processing {$selectedItems->count()} selected items");
            
            foreach ($selectedItems as $item) {
                $quantityOrdered = random_int(1, 100);
                $unitPrice = fake()->randomFloat(2, 10, 1000);
                $taxRate = fake()->randomFloat(2, 0, 25);
                $discountRate = fake()->optional(0.3, 0)->randomFloat(2, 5, 15);
                
                // Use your model's built-in calculation for line_total
                $netUnitPrice = $unitPrice * (1 - ($discountRate / 100));
                $lineTotal = $quantityOrdered * $netUnitPrice;
                
                // Determine status and set quantities accordingly
                $status = fake()->randomElement([
                    PurchaseOrderItem::STATUS_ORDERED,
                    PurchaseOrderItem::STATUS_PARTIALLY_RECEIVED,
                    PurchaseOrderItem::STATUS_RECEIVED,
                    PurchaseOrderItem::STATUS_CANCELLED
                ]);
                
                $quantityReceived = 0;
                $quantityCancelled = 0;

                switch ($status) {
                    case PurchaseOrderItem::STATUS_RECEIVED:
                        $quantityReceived = $quantityOrdered;
                        break;
                    case PurchaseOrderItem::STATUS_PARTIALLY_RECEIVED:
                        $quantityReceived = random_int(1, $quantityOrdered - 1);
                        break;
                    case PurchaseOrderItem::STATUS_CANCELLED:
                        $quantityCancelled = $quantityOrdered;
                        break;
                    default: // ordered
                        $quantityReceived = 0;
                        $quantityCancelled = 0;
                }
                
                // Set delivery dates based on purchase order dates and status
                $expectedDeliveryDate = $purchaseOrder->expected_delivery_date 
                    ? fake()->dateTimeBetween($purchaseOrder->order_date, $purchaseOrder->expected_delivery_date)->format('Y-m-d')
                    : null;
                    
                $actualDeliveryDate = null;
                if ($status === PurchaseOrderItem::STATUS_RECEIVED || $status === PurchaseOrderItem::STATUS_PARTIALLY_RECEIVED) {
                    $actualDeliveryDate = $expectedDeliveryDate 
                        ? fake()->dateTimeBetween($purchaseOrder->order_date, $expectedDeliveryDate)->format('Y-m-d')
                        : fake()->dateTimeBetween($purchaseOrder->order_date, '+1 month')->format('Y-m-d');
                }
                
                try {
                    $purchaseOrderItem = PurchaseOrderItem::create([
                        'order_item_id' => Str::uuid(),
                        'order_id' => $purchaseOrder->order_id,
                        'item_id' => $item->item_id,
                        'quantity_ordered' => $quantityOrdered,
                        'quantity_received' => $quantityReceived,
                        'quantity_cancelled' => $quantityCancelled,
                        'unit_price' => $unitPrice,
                        'tax_rate' => $taxRate,
                        'discount_rate' => $discountRate,
                        'line_total' => $lineTotal,
                        'expected_delivery_date' => $expectedDeliveryDate,
                        'actual_delivery_date' => $actualDeliveryDate,
                        'status' => $status,
                        'notes' => fake()->optional(0.2)->sentence(),
                        'created_at' => $purchaseOrder->order_date,
                        'updated_at' => fake()->dateTimeBetween($purchaseOrder->order_date, 'now'),
                    ]);
                    
                    $purchaseOrderItems->push($purchaseOrderItem);
                    $totalItemsCreated++;
                    $this->command->info("    ✅ Created item: {$item->name} (Qty: {$quantityOrdered}, Status: {$status}, Total: \${$lineTotal})");
                    
                } catch (\Exception $e) {
                    $this->command->error("    ❌ Failed to create item: {$e->getMessage()}");
                    $this->command->error("    Order ID: {$purchaseOrder->order_id}, Item ID: {$item->item_id}");
                }
            }
        });
        
        $this->command->info("=== Purchase Order Items Seeder Completed ===");
        $this->command->info("Total purchase order items created: {$totalItemsCreated}");
        
        return $purchaseOrderItems;
    }

    // private function createPurchaseOrderItems($purchaseOrders, $inventoryItems)
    // {
    //     // Add detailed debugging
    //     $this->command->info("=== Starting Purchase Order Items Seeder ===");
    //     $this->command->info("Purchase Orders count: " . $purchaseOrders->count());
    //     $this->command->info("Inventory Items count: " . $inventoryItems->count());
        
    //     if (!$inventoryItems || $inventoryItems->isEmpty()) {
    //         $this->command->error("No inventory items provided to create purchase order items");
    //         return collect();
    //     }

    //     if ($purchaseOrders->isEmpty()) {
    //         $this->command->error("No purchase orders provided");
    //         return collect();
    //     }

    //     $statuses = ['ordered', 'partially_received', 'received', 'cancelled'];
    //     $purchaseOrderItems = collect();
    //     $totalItemsCreated = 0;

    //     $purchaseOrders->each(function ($purchaseOrder) use (&$purchaseOrderItems, $inventoryItems, $statuses, &$totalItemsCreated) {
    //         $itemCount = random_int(2, 8);
    //         $this->command->info("Creating {$itemCount} items for purchase order: {$purchaseOrder->po_number} (University: {$purchaseOrder->university_id})");
            
    //         // Get items that belong to the same university as the purchase order
    //         $universityItems = $inventoryItems->where('university_id', $purchaseOrder->university_id);
            
    //         $this->command->info("  Found {$universityItems->count()} inventory items for this university");
            
    //         if ($universityItems->isEmpty()) {
    //             $this->command->warn("  ⚠️ No inventory items found for university: {$purchaseOrder->university_id}");
    //             return;
    //         }
            
    //         // Ensure we don't request more items than available
    //         $actualItemCount = min($itemCount, $universityItems->count());
    //         $this->command->info("  Selecting {$actualItemCount} random items");
            
    //         // Select random items for this purchase order
    //         $selectedItems = $universityItems->random($actualItemCount);
            
    //         // If we got a single item instead of collection, convert to collection
    //         if (!is_iterable($selectedItems)) {
    //             $selectedItems = collect([$selectedItems]);
    //         }

    //         $this->command->info("  Processing {$selectedItems->count()} selected items");
            
    //         foreach ($selectedItems as $item) {
    //             $quantityOrdered = random_int(1, 100);
    //             $quantityReceived = 0;
    //             $quantityCancelled = 0;
    //             $unitPrice = fake()->randomFloat(2, 10, 1000);
    //             $taxRate = fake()->randomFloat(2, 0, 25);
    //             $discountRate = fake()->optional(30)->randomFloat(2, 5, 15) ?? 0;
                
    //             // Calculate line total
    //             $subtotal = $quantityOrdered * $unitPrice;
    //             $discountAmount = $subtotal * ($discountRate / 100);
    //             $taxAmount = ($subtotal - $discountAmount) * ($taxRate / 100);
    //             $lineTotal = $subtotal - $discountAmount + $taxAmount;
                
    //             // Determine status and set quantities accordingly
    //             $status = fake()->randomElement($statuses);
                
    //             switch ($status) {
    //                 case 'received':
    //                     $quantityReceived = $quantityOrdered;
    //                     break;
    //                 case 'partially_received':
    //                     $quantityReceived = random_int(1, $quantityOrdered - 1);
    //                     break;
    //                 case 'cancelled':
    //                     $quantityCancelled = $quantityOrdered;
    //                     break;
    //                 default: // ordered
    //                     $quantityReceived = 0;
    //                     $quantityCancelled = 0;
    //             }
                
    //             // Set delivery dates based on purchase order dates and status
    //             $expectedDeliveryDate = $purchaseOrder->expected_delivery_date 
    //                 ? fake()->dateTimeBetween($purchaseOrder->order_date, $purchaseOrder->expected_delivery_date)
    //                 : null;
                    
    //             $actualDeliveryDate = null;
    //             if ($status === 'received' || $status === 'partially_received') {
    //                 $actualDeliveryDate = $expectedDeliveryDate 
    //                     ? fake()->dateTimeBetween($purchaseOrder->order_date, $expectedDeliveryDate)
    //                     : fake()->dateTimeBetween($purchaseOrder->order_date, '+1 month');
    //             }
                
    //             try {
    //                 $purchaseOrderItem = \App\Models\PurchaseOrderItem::create([
    //                     'order_item_id' => Str::uuid(),
    //                     'order_id' => $purchaseOrder->order_id,
    //                     'item_id' => $item->item_id,
    //                     'quantity_ordered' => $quantityOrdered,
    //                     'quantity_received' => $quantityReceived,
    //                     'quantity_cancelled' => $quantityCancelled,
    //                     'unit_price' => $unitPrice,
    //                     'tax_rate' => $taxRate,
    //                     'discount_rate' => $discountRate,
    //                     'line_total' => $lineTotal,
    //                     'expected_delivery_date' => $expectedDeliveryDate,
    //                     'actual_delivery_date' => $actualDeliveryDate,
    //                     'status' => $status,
    //                     'notes' => fake()->optional(20)->sentence(),
    //                     'created_at' => $purchaseOrder->order_date,
    //                     'updated_at' => fake()->dateTimeBetween($purchaseOrder->order_date, 'now'),
    //                 ]);
                    
    //                 $purchaseOrderItems->push($purchaseOrderItem);
    //                 $totalItemsCreated++;
    //                 $this->command->info("    ✅ Created item: {$item->item_name} (Qty: {$quantityOrdered}, Status: {$status}, Total: \${$lineTotal})");
                    
    //             } catch (\Exception $e) {
    //                 $this->command->error("    ❌ Failed to create item: {$e->getMessage()}");
    //             }
    //         }
    //     });
        
    //     $this->command->info("=== Purchase Order Items Seeder Completed ===");
    //     $this->command->info("Total purchase order items created: {$totalItemsCreated}");
        
    //     return $purchaseOrderItems;
    // }

    private function generateSupplierName(): string
    {
        $companyTypes = ['Limited', 'Company Ltd', 'Enterprises', 'Group', 'Solutions', 'Services', 'Trading', 'Manufacturing'];
        $businessTypes = ['General', 'Technical', 'Industrial', 'Commercial', 'Agricultural', 'Medical', 'Educational', 'Construction'];
        $adjectives = ['Advanced', 'Premium', 'Quality', 'Reliable', 'Trusted', 'Ghana', 'West Africa', 'Prime'];
        
        return fake()->randomElement($adjectives) . ' ' . 
            fake()->randomElement($businessTypes) . ' ' . 
            fake()->randomElement($companyTypes);
    }

    private function outputStatistics()
    {
        $this->command->info('');
        $this->command->info('=== Database Seeding Complete ===');
        $this->command->info('Universities created: ' . University::count());
        $this->command->info('Departments created: ' . Department::count());
        $this->command->info('Item categories created: ' . ItemCategory::count());
        $this->command->info('Inventory items created: ' . InventoryItem::count());
        $this->command->info('Total users created: ' . User::count());
        $this->command->info('');
        $this->command->info('=== Login Credentials ===');
        $this->command->info('Super Admin: admin@university.edu / admin123');
        $this->command->info('===');
    }

    private function generateUniqueEmployeeId(string $prefix, array &$usedIds): string
    {
        $counter = 1;
        $employeeId = $prefix . str_pad($counter, 4, '0', STR_PAD_LEFT);
        
        while (in_array($employeeId, $usedIds)) {
            $counter++;
            $employeeId = $prefix . str_pad($counter, 4, '0', STR_PAD_LEFT);
        }
        
        return $employeeId;
    }

    private function generateUniqueEmail(string $prefix, string $identifier, array &$usedEmails): string
    {
        $baseEmail = $prefix . '.' . Str::lower($identifier) . '@university.edu';
        $email = $baseEmail;
        $counter = 1;

        while (in_array($email, $usedEmails)) {
            $email = $prefix . '.' . Str::lower($identifier) . $counter . '@university.edu';
            $counter++;
            
            // Safety fallback
            if ($counter > 100) {
                $email = $prefix . '.' . Str::lower($identifier) . '.' . Str::random(6) . '@university.edu';
                break;
            }
        }

        return $email;
    }

    private function getRandomBuilding(): string
    {
        return fake()->randomElement(['Science Building', 'Engineering Hall', 'Business Tower', 'Liberal Arts Building']);
    }

    private function getRandomFloor(): string
    {
        return fake()->randomElement(['1', '2', '3', 'G']);
    }

    private function getRandomRoom(): string
    {
        return fake()->randomElement(['101', '201', '301', '102', '202']);
    }

    
}