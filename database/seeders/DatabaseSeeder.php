<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Department;
use App\Models\User;
use App\Models\ItemCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLevel;
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
    InventoryTransaction::truncate(); 
    StockLevel::truncate();
    MaintenanceRecord::truncate();
    Location::truncate();
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
    $inventoryItems = $this->createInventoryItems($universities);

    $suppliers = $this->createSuppliers($universities);

    $purchaseOrders = $this->createPurchaseOrders($universities, $departments, $suppliers);

    $this->createPurchaseOrderItems($purchaseOrders, $inventoryItems);

    // Add this line - create inventory transactions
    $allUsers = User::all();
    $this->createInventoryTransactions($universities, $inventoryItems, $departments, $purchaseOrders, $allUsers);
            
    $this->createStockLevels($universities, $inventoryItems, $departments);


    // $this->createMaintenanceRecords($universities, $inventoryItems, $departments, $allUsers);
    // Create maintenance records
    $this->createMaintenanceRecords($universities, $inventoryItems, $departments, $allUsers);

    // Add this line - create locations
    $locations = $this->createLocations($universities, $departments, $allUsers);
            

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
                $quantityOrdered = random_int(2, 100); // CHANGED: Minimum 2 to avoid the error
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
                        // FIXED: Now safe because quantityOrdered is at least 2
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

///////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////

    private function generateSupplierName(): string
    {
        $companyTypes = ['Limited', 'Company Ltd', 'Enterprises', 'Group', 'Solutions', 'Services', 'Trading', 'Manufacturing'];
        $businessTypes = ['General', 'Technical', 'Industrial', 'Commercial', 'Agricultural', 'Medical', 'Educational', 'Construction'];
        $adjectives = ['Advanced', 'Premium', 'Quality', 'Reliable', 'Trusted', 'Ghana', 'West Africa', 'Prime'];
        
        return fake()->randomElement($adjectives) . ' ' . 
            fake()->randomElement($businessTypes) . ' ' . 
            fake()->randomElement($companyTypes);
    }

    private function createInventoryTransactions($universities, $inventoryItems, $departments, $purchaseOrders, $users)
    {
        $this->command->info("=== Starting Inventory Transactions Seeder ===");
        
        $transactionTypes = ['purchase', 'sale', 'transfer', 'adjustment', 'return', 'write_off', 'consumption', 'production', 'donation'];
        $statuses = ['pending', 'completed', 'cancelled', 'reversed'];
        
        $inventoryTransactions = collect();
        $totalTransactionsCreated = 0;

        $universities->each(function ($university) use (&$inventoryTransactions, $inventoryItems, $departments, $purchaseOrders, $users, $transactionTypes, $statuses, &$totalTransactionsCreated) {
            $this->command->info("Creating inventory transactions for university: {$university->name}");
            
            $universityItems = $inventoryItems->where('university_id', $university->university_id);
            $universityDepartments = $departments->where('university_id', $university->university_id);
            $universityUsers = $users->where('university_id', $university->university_id);
            $universityPurchaseOrders = $purchaseOrders->where('university_id', $university->university_id);
            
            if ($universityItems->isEmpty() || $universityDepartments->isEmpty() || $universityUsers->isEmpty()) {
                $this->command->warn("  ⚠️ No items, departments, or users found for university: {$university->name}");
                return;
            }
            
            // Create multiple transactions per university
            $transactionCount = random_int(20, 50);
            
            for ($i = 0; $i < $transactionCount; $i++) {
                $item = $universityItems->random();
                $department = $universityDepartments->random();
                $performedBy = $universityUsers->random();
                $approvedBy = fake()->optional(70)->randomElement($universityUsers);
                $transactionType = fake()->randomElement($transactionTypes);
                
                // Set quantity based on transaction type
                $quantity = $this->getQuantityForTransactionType($transactionType, $item);
                $unitCost = $item->unit_cost;
                $totalValue = $quantity * $unitCost;
                
                // Set reference based on transaction type
                $referenceNumber = $this->generateReferenceNumber($transactionType, $i);
                $referenceId = $this->getReferenceId($transactionType, $universityPurchaseOrders);
                
                // Set locations based on transaction type
                $sourceLocationId = $this->getSourceLocation($transactionType, $universityDepartments);
                $destinationLocationId = $this->getDestinationLocation($transactionType, $universityDepartments);
                $expiryDate = fake()->optional(40)->dateTimeBetween('now', '+2 years');
                $formattedExpiryDate = $expiryDate ? $expiryDate->format('Y-m-d') : null;

                try {
                    $transaction = \App\Models\InventoryTransaction::create([
                        'transaction_id' => Str::uuid(),
                        'university_id' => $university->university_id,
                        'item_id' => $item->item_id,
                        'department_id' => $department->department_id,
                        'transaction_type' => $transactionType,
                        'quantity' => $quantity,
                        'unit_cost' => $unitCost,
                        'total_value' => $totalValue,
                        'transaction_date' => fake()->dateTimeBetween('-1 year', 'now'),
                        'reference_number' => $referenceNumber,
                        'reference_id' => $referenceId,
                        'batch_number' => fake()->optional(60)->bothify('BATCH-#####'),
                        'expiry_date' => $formattedExpiryDate,
                        'notes' => $this->getNotesForTransactionType($transactionType, $item, $quantity),
                        'source_location_id' => $sourceLocationId,
                        'destination_location_id' => $destinationLocationId,
                        'status' => fake()->randomElement($statuses),
                        'performed_by' => $performedBy->user_id,
                        'approved_by' => $approvedBy ? $approvedBy->user_id : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $inventoryTransactions->push($transaction);
                    $totalTransactionsCreated++;
                    $this->command->info("    ✅ Created {$transactionType} transaction: {$referenceNumber} (Qty: {$quantity})");
                    
                } catch (\Exception $e) {
                    $this->command->error("    ❌ Failed to create transaction: {$e->getMessage()}");
                }
            }
        });
        
        $this->command->info("=== Inventory Transactions Seeder Completed ===");
        $this->command->info("Total inventory transactions created: {$totalTransactionsCreated}");
        
        return $inventoryTransactions;
    }

    // Helper methods for the transaction seeder
    private function getQuantityForTransactionType($transactionType, $item)
    {
        switch ($transactionType) {
            case 'purchase':
                return fake()->numberBetween(10, 100);
            case 'sale':
                return fake()->numberBetween(1, 20);
            case 'transfer':
                return fake()->numberBetween(5, 50);
            case 'adjustment':
                return fake()->numberBetween(-10, 10);
            case 'return':
                return fake()->numberBetween(1, 15);
            case 'write_off':
                return fake()->numberBetween(-20, -1);
            case 'consumption':
                return fake()->numberBetween(1, 25);
            case 'production':
                return fake()->numberBetween(10, 100);
            case 'donation':
                return fake()->numberBetween(5, 30);
            default:
                return fake()->numberBetween(1, 50);
        }
    }

    private function generateReferenceNumber($transactionType, $index)
    {
        $prefixes = [
            'purchase' => 'PO',
            'sale' => 'SO',
            'transfer' => 'TR',
            'adjustment' => 'ADJ',
            'return' => 'RET',
            'write_off' => 'WO',
            'consumption' => 'CON',
            'production' => 'PROD',
            'donation' => 'DON'
        ];
        
        $prefix = $prefixes[$transactionType] ?? 'TRX';
        return $prefix . '-' . date('Y') . '-' . str_pad($index + 1, 5, '0', STR_PAD_LEFT);
    }

    private function getReferenceId($transactionType, $purchaseOrders)
    {
        if ($transactionType === 'purchase' && $purchaseOrders->isNotEmpty()) {
            return fake()->optional(80)->randomElement($purchaseOrders->pluck('order_id')->toArray());
        }
        return null;
    }

    private function getSourceLocation($transactionType, $departments)
    {
        if (in_array($transactionType, ['transfer', 'sale', 'return', 'consumption'])) {
            return fake()->optional(70)->randomElement($departments->pluck('department_id')->toArray());
        }
        return null;
    }

    private function getDestinationLocation($transactionType, $departments)
    {
        if (in_array($transactionType, ['purchase', 'transfer', 'production', 'donation'])) {
            return fake()->optional(80)->randomElement($departments->pluck('department_id')->toArray());
        }
        return null;
    }

    private function getNotesForTransactionType($transactionType, $item, $quantity)
    {
        $notes = [
            'purchase' => "Purchased {$quantity} units of {$item->name}",
            'sale' => "Sold {$quantity} units of {$item->name}",
            'transfer' => "Transferred {$quantity} units of {$item->name} between locations",
            'adjustment' => "Stock adjustment of {$quantity} units for {$item->name}",
            'return' => "Returned {$quantity} units of {$item->name}",
            'write_off' => "Written off {$quantity} units of {$item->name} due to damage/expiry",
            'consumption' => "Consumed {$quantity} units of {$item->name} for project/department use",
            'production' => "Produced {$quantity} units of {$item->name}",
            'donation' => "Donated {$quantity} units of {$item->name}"
        ];
        
        return $notes[$transactionType] ?? "Transaction of {$quantity} units for {$item->name}";
    }

    private function createStockLevels($universities, $inventoryItems, $departments)
    {
        $this->command->info("=== Starting Stock Levels Seeder ===");
        
        $countFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
        
        $stockLevels = collect();
        $totalStockLevelsCreated = 0;

        $universities->each(function ($university) use (&$stockLevels, $inventoryItems, $departments, $countFrequencies, &$totalStockLevelsCreated) {
            $this->command->info("Creating stock levels for university: {$university->name}");
            
            $universityItems = $inventoryItems->where('university_id', $university->university_id);
            $universityDepartments = $departments->where('university_id', $university->university_id);
            
            if ($universityItems->isEmpty() || $universityDepartments->isEmpty()) {
                $this->command->warn("  ⚠️ No items or departments found for university: {$university->name}");
                return;
            }
            
            // Create stock levels for each item in each department
            $universityItems->each(function ($item) use ($university, $universityDepartments, $countFrequencies, &$stockLevels, &$totalStockLevelsCreated) {
                $universityDepartments->each(function ($department) use ($university, $item, $countFrequencies, &$stockLevels, &$totalStockLevelsCreated) {
                    // Generate realistic stock level data
                    $currentQuantity = fake()->numberBetween(0, 500);
                    $committedQuantity = fake()->numberBetween(0, min(50, $currentQuantity));
                    $availableQuantity = $currentQuantity - $committedQuantity;
                    $onOrderQuantity = fake()->numberBetween(0, 200);
                    $averageCost = $item->unit_cost * fake()->randomFloat(2, 0.8, 1.2); // Some variation from unit cost
                    $totalValue = $currentQuantity * $averageCost;
                    
                    // Set reorder levels based on item usage
                    $reorderLevel = fake()->numberBetween(10, 50);
                    $safetyStock = fake()->numberBetween(5, 20);
                    $maxLevel = fake()->optional(70)->numberBetween(100, 1000);
                    
                    // Stock movement statistics
                    $stockMovementStats = [
                        'daily_movement' => fake()->numberBetween(0, 50),
                        'weekly_movement' => fake()->numberBetween(0, 200),
                        'monthly_movement' => fake()->numberBetween(0, 800),
                        'turnover_rate' => fake()->randomFloat(2, 0.5, 12.0),
                        'last_month_usage' => fake()->numberBetween(0, 300),
                        'current_month_usage' => fake()->numberBetween(0, 150),
                    ];
                    
                    try {
                        $stockLevel = \App\Models\StockLevel::create([
                            'stock_id' => Str::uuid(),
                            'university_id' => $university->university_id,
                            'item_id' => $item->item_id,
                            'department_id' => $department->department_id,
                            'location_id' => fake()->optional(60)->passthrough($department->department_id), // Using department as location
                            'current_quantity' => $currentQuantity,
                            'committed_quantity' => $committedQuantity,
                            'available_quantity' => $availableQuantity,
                            'on_order_quantity' => $onOrderQuantity,
                            'average_cost' => $averageCost,
                            'total_value' => $totalValue,
                            'last_count_date' => fake()->optional(70)->dateTimeBetween('-6 months', 'now'),
                            'next_count_date' => fake()->optional(60)->dateTimeBetween('now', '+1 year'),
                            'count_frequency' => fake()->optional(80)->randomElement($countFrequencies),
                            'reorder_level' => $reorderLevel,
                            'max_level' => $maxLevel,
                            'safety_stock' => $safetyStock,
                            'lead_time_days' => fake()->numberBetween(1, 30),
                            'service_level' => fake()->randomFloat(2, 85, 99.5),
                            'stock_movement_stats' => $stockMovementStats,
                            'last_updated' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        $stockLevels->push($stockLevel);
                        $totalStockLevelsCreated++;
                        $this->command->info("    ✅ Created stock level for {$item->name} in {$department->name} (Available: {$availableQuantity})");
                        
                    } catch (\Exception $e) {
                        $this->command->error("    ❌ Failed to create stock level: {$e->getMessage()}");
                    }
                });
            });
        });
        
        $this->command->info("=== Stock Levels Seeder Completed ===");
        $this->command->info("Total stock levels created: {$totalStockLevelsCreated}");
        
        return $stockLevels;
    }


    // Maintenance Records
    private function createMaintenanceRecords($universities, $inventoryItems, $departments, $users)
    {
        $this->command->info("=== Starting Maintenance Records Seeder ===");
        
        $maintenanceTypes = ['preventive', 'corrective', 'predictive', 'condition_based', 'emergency'];
        $priorities = ['low', 'medium', 'high', 'critical'];
        $statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'];
        
        $maintenanceRecords = collect();
        $totalRecordsCreated = 0;

        $universities->each(function ($university) use (&$maintenanceRecords, $inventoryItems, $departments, $users, $maintenanceTypes, $priorities, $statuses, &$totalRecordsCreated) {
            $this->command->info("Creating maintenance records for university: {$university->name}");
            
            $universityItems = $inventoryItems->where('university_id', $university->university_id);
            $universityDepartments = $departments->where('university_id', $university->university_id);
            $universityUsers = $users->where('university_id', $university->university_id);
            
            if ($universityItems->isEmpty() || $universityDepartments->isEmpty() || $universityUsers->isEmpty()) {
                $this->command->warn("  ⚠️ No items, departments, or users found for university: {$university->name}");
                return;
            }
            
            // Create maintenance records for each university
            $recordCount = random_int(15, 30);
            
            for ($i = 0; $i < $recordCount; $i++) {
                $item = $universityItems->random();
                $department = $universityDepartments->random();
                $createdBy = $universityUsers->random();
                $assignedTo = fake()->optional(80)->randomElement($universityUsers);
                $maintenanceType = fake()->randomElement($maintenanceTypes);
                $status = fake()->randomElement($statuses);
                
                // Generate maintenance code
                $maintenanceCode = 'MNT-' . $university->code . '-' . date('Y') . '-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT);
                
                // Set dates based on status - FIXED: Ensure proper date ordering
                $scheduledDate = fake()->dateTimeBetween('-6 months', '+3 months');
                $completedDate = null;
                $nextMaintenanceDate = null;
                
                if ($status === 'completed') {
                    // FIX: Ensure completed date is after scheduled date by adding at least 1 day
                    $minCompletedDate = (clone $scheduledDate)->modify('+1 day');
                    $maxCompletedDate = (clone $scheduledDate)->modify('+2 months');
                    
                    // Only generate completed date if min date is not in the future
                    if ($minCompletedDate <= new \DateTime()) {
                        $completedDate = fake()->dateTimeBetween($minCompletedDate, $maxCompletedDate);
                        $nextMaintenanceDate = fake()->optional(70)->dateTimeBetween($completedDate, '+1 year');
                    } else {
                        // If scheduled date is in the future, change status to scheduled
                        $status = 'scheduled';
                    }
                }
                
                if ($status === 'scheduled' && $scheduledDate > new \DateTime()) {
                    $nextMaintenanceDate = fake()->optional(60)->dateTimeBetween($scheduledDate, '+6 months');
                }
                
                // Generate costs based on maintenance type and priority
                $laborCost = fake()->randomFloat(2, 50, 2000);
                $partsCost = fake()->optional(70)->randomFloat(2, 10, 1500) ?? 0;
                $totalCost = $laborCost + $partsCost;
                
                // Generate downtime based on priority and type
                $downtimeHours = $this->getDowntimeHours($maintenanceType, $status);
                
                try {
                    $maintenanceRecord = \App\Models\MaintenanceRecord::create([
                        'maintenance_id' => Str::uuid(),
                        'university_id' => $university->university_id,
                        'item_id' => $item->item_id,
                        'department_id' => $department->department_id,
                        'maintenance_code' => $maintenanceCode,
                        'scheduled_date' => $scheduledDate->format('Y-m-d'),
                        'completed_date' => $completedDate ? $completedDate->format('Y-m-d') : null,
                        'maintenance_type' => $maintenanceType,
                        'priority' => fake()->randomElement($priorities),
                        'description' => $this->getMaintenanceDescription($maintenanceType, $item),
                        'work_performed' => $status === 'completed' ? $this->getWorkPerformed($maintenanceType) : null,
                        'root_cause' => $status === 'completed' ? fake()->optional(60)->sentence() : null,
                        'recommendations' => $status === 'completed' ? fake()->optional(50)->sentence() : null,
                        'labor_cost' => $laborCost,
                        'parts_cost' => $partsCost,
                        'total_cost' => $totalCost,
                        'downtime_hours' => $downtimeHours,
                        'technician' => fake()->optional(80)->name(),
                        'vendor' => fake()->optional(40)->company(),
                        'next_maintenance_date' => $nextMaintenanceDate ? $nextMaintenanceDate->format('Y-m-d') : null,
                        'status' => $status,
                        'created_by' => $createdBy->user_id,
                        'assigned_to' => $assignedTo ? $assignedTo->user_id : null,
                        'created_at' => $scheduledDate,
                        'updated_at' => fake()->dateTimeBetween($scheduledDate, 'now'),
                    ]);
                    
                    $maintenanceRecords->push($maintenanceRecord);
                    $totalRecordsCreated++;
                    $this->command->info("    ✅ Created {$maintenanceType} maintenance: {$maintenanceCode} ({$status})");
                    
                } catch (\Exception $e) {
                    $this->command->error("    ❌ Failed to create maintenance record: {$e->getMessage()}");
                }
            }
        });
        
        $this->command->info("=== Maintenance Records Seeder Completed ===");
        $this->command->info("Total maintenance records created: {$totalRecordsCreated}");
        
        return $maintenanceRecords;
    }

    // Helper methods for maintenance records
    private function getDowntimeHours($maintenanceType, $status)
    {
        if ($status !== 'completed') {
            return 0;
        }
        
        switch ($maintenanceType) {
            case 'emergency':
                return fake()->numberBetween(2, 48); // Longer downtime for emergencies
            case 'corrective':
                return fake()->numberBetween(1, 24);
            case 'preventive':
                return fake()->numberBetween(1, 8);
            case 'predictive':
                return fake()->numberBetween(1, 4);
            case 'condition_based':
                return fake()->numberBetween(1, 6);
            default:
                return fake()->numberBetween(1, 12);
        }
    }

    private function getMaintenanceDescription($maintenanceType, $item)
    {
        $descriptions = [
            'preventive' => [
                "Routine preventive maintenance for {$item->name}",
                "Scheduled maintenance check for {$item->name}",
                "Regular service and inspection of {$item->name}",
                "Preventive maintenance as per maintenance schedule for {$item->name}"
            ],
            'corrective' => [
                "Repair and correction of faults in {$item->name}",
                "Corrective maintenance to fix reported issues with {$item->name}",
                "Troubleshooting and repair of {$item->name}",
                "Fix operational issues with {$item->name}"
            ],
            'predictive' => [
                "Predictive maintenance based on condition monitoring of {$item->name}",
                "Advanced diagnostics and predictive analysis for {$item->name}",
                "Condition-based predictive maintenance for {$item->name}",
                "Monitoring and predictive maintenance activities for {$item->name}"
            ],
            'condition_based' => [
                "Condition-based maintenance triggered by monitoring parameters of {$item->name}",
                "Maintenance based on actual condition assessment of {$item->name}",
                "Condition monitoring and maintenance for {$item->name}",
                "Performance-based maintenance for {$item->name}"
            ],
            'emergency' => [
                "Emergency repair for critical failure of {$item->name}",
                "Urgent maintenance to restore functionality of {$item->name}",
                "Emergency response for breakdown of {$item->name}",
                "Critical repair work for {$item->name}"
            ]
        ];
        
        return fake()->randomElement($descriptions[$maintenanceType]);
    }

    private function getWorkPerformed($maintenanceType)
    {
        $workDescriptions = [
            'preventive' => [
                "Performed routine inspection, cleaning, and lubrication. Checked all components for wear and tear. Replaced consumable parts as needed.",
                "Completed scheduled maintenance including calibration, testing, and minor adjustments. Verified all safety features are functional.",
                "Conducted preventive maintenance procedures as per manufacturer specifications. Inspected electrical and mechanical systems."
            ],
            'corrective' => [
                "Identified and repaired faulty components. Replaced damaged parts and tested system functionality. Performed alignment and calibration.",
                "Troubleshooted reported issues, identified root cause, and implemented corrective actions. Verified repair effectiveness.",
                "Fixed operational defects, replaced worn components, and restored equipment to optimal working condition."
            ],
            'predictive' => [
                "Analyzed condition monitoring data, performed advanced diagnostics, and addressed potential failure points before breakdown occurs.",
                "Conducted vibration analysis, thermal imaging, and other predictive techniques to identify early signs of deterioration.",
                "Used predictive analytics to identify maintenance needs and performed proactive repairs based on data-driven insights."
            ],
            'condition_based' => [
                "Monitored equipment condition parameters and performed maintenance based on actual asset condition rather than fixed schedule.",
                "Assessed equipment health through various monitoring techniques and performed necessary maintenance actions.",
                "Evaluated performance metrics and condition indicators to determine optimal maintenance timing and scope."
            ],
            'emergency' => [
                "Emergency response team deployed to address critical failure. Performed urgent repairs to restore essential functionality.",
                "Immediate corrective actions taken to resolve emergency breakdown. Temporary fixes applied with follow-up scheduled.",
                "Critical repair work completed under emergency conditions to minimize operational impact and ensure safety."
            ]
        ];
        
        return fake()->randomElement($workDescriptions[$maintenanceType]);
    }
   
    private function createLocations($universities, $departments, $users)
    {
        $this->command->info("=== Starting Locations Seeder ===");
        
        $locationTypes = ['storage', 'office', 'lab', 'classroom', 'workshop', 'outdoor'];
        $buildings = [
            'Science Building', 'Engineering Hall', 'Business Tower', 'Liberal Arts Building',
            'Technology Center', 'Research Complex', 'Main Library', 'Student Center',
            'Administration Building', 'Arts Building', 'Medical Center', 'Sports Complex'
        ];
        
        $locations = collect();
        $totalLocationsCreated = 0;

        $universities->each(function ($university) use (&$locations, $departments, $users, $locationTypes, $buildings, &$totalLocationsCreated) {
            $this->command->info("Creating locations for university: {$university->name}");
            
            $universityDepartments = $departments->where('university_id', $university->university_id);
            $universityUsers = $users->where('university_id', $university->university_id);
            
            if ($universityDepartments->isEmpty() || $universityUsers->isEmpty()) {
                $this->command->warn("  ⚠️ No departments or users found for university: {$university->name}");
                return;
            }
            
            // Create multiple locations per department
            $universityDepartments->each(function ($department) use ($university, $universityUsers, $locationTypes, $buildings, &$locations, &$totalLocationsCreated) {
                $locationCount = random_int(3, 8);
                
                for ($i = 0; $i < $locationCount; $i++) {
                    $locationType = fake()->randomElement($locationTypes);
                    $building = fake()->randomElement($buildings);
                    $managedBy = fake()->optional(60)->randomElement($universityUsers);
                    
                    // Generate location code
                    $locationCode = 'LOC-' . $university->code . '-' . $department->department_code . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);
                    
                    // Generate location name based on type and department
                    $locationName = $this->generateLocationName($locationType, $department, $i);
                    
                    // Set location-specific properties
                    $locationProperties = $this->getLocationProperties($locationType);
                    
                    try {
                        $location = \App\Models\Location::create([
                            'location_id' => Str::uuid(),
                            'university_id' => $university->university_id,
                            'department_id' => $department->department_id,
                            'location_code' => $locationCode,
                            'name' => $locationName,
                            'building' => $building,
                            'floor' => fake()->randomElement(['G', '1', '2', '3', '4', '5', 'B1', 'B2']),
                            'room_number' => fake()->bothify('###'),
                            'aisle' => fake()->optional(40)->bothify('Aisle ?'),
                            'shelf' => fake()->optional(30)->bothify('Shelf ?'),
                            'bin' => fake()->optional(20)->bothify('Bin ?'),
                            'capacity' => fake()->optional(70)->randomFloat(2, 100, 5000),
                            'current_utilization' => fake()->randomFloat(2, 0, 100),
                            'location_type' => $locationType,
                            'is_secured' => fake()->boolean(40),
                            'is_climate_controlled' => $locationProperties['is_climate_controlled'],
                            'temperature_min' => $locationProperties['temperature_min'],
                            'temperature_max' => $locationProperties['temperature_max'],
                            'humidity_min' => $locationProperties['humidity_min'],
                            'humidity_max' => $locationProperties['humidity_max'],
                            'is_active' => fake()->boolean(90),
                            'managed_by' => $managedBy ? $managedBy->user_id : null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        $locations->push($location);
                        $totalLocationsCreated++;
                        $this->command->info("    ✅ Created {$locationType} location: {$locationName} ({$locationCode})");
                        
                    } catch (\Exception $e) {
                        $this->command->error("    ❌ Failed to create location: {$e->getMessage()}");
                    }
                }
            });
        });
        
        $this->command->info("=== Locations Seeder Completed ===");
        $this->command->info("Total locations created: {$totalLocationsCreated}");
        
        return $locations;
    }

    // Helper methods for locations
    private function generateLocationName($locationType, $department, $index)
    {
        $names = [
            'storage' => [
                "{$department->name} Storage Room",
                "{$department->name} Supply Closet",
                "{$department->name} Equipment Storage",
                "{$department->name} Materials Room"
            ],
            'office' => [
                "{$department->name} Office #{$index}",
                "{$department->name} Faculty Office",
                "{$department->name} Staff Office",
                "{$department->name} Administration Office"
            ],
            'lab' => [
                "{$department->name} Laboratory #{$index}",
                "{$department->name} Research Lab",
                "{$department->name} Computer Lab",
                "{$department->name} Science Lab"
            ],
            'classroom' => [
                "{$department->name} Classroom #{$index}",
                "{$department->name} Lecture Hall",
                "{$department->name} Seminar Room",
                "{$department->name} Tutorial Room"
            ],
            'workshop' => [
                "{$department->name} Workshop",
                "{$department->name} Maker Space",
                "{$department->name} Technical Workshop",
                "{$department->name} Project Room"
            ],
            'outdoor' => [
                "{$department->name} Outdoor Storage",
                "{$department->name} Yard Area",
                "{$department->name} External Compound",
                "{$department->name} Open Area"
            ]
        ];
        
        return fake()->randomElement($names[$locationType]);
    }

    private function getLocationProperties($locationType)
    {
        $properties = [
            'storage' => [
                'is_climate_controlled' => fake()->boolean(60),
                'temperature_min' => fake()->optional(50)->randomFloat(2, 15, 20),
                'temperature_max' => fake()->optional(50)->randomFloat(2, 20, 25),
                'humidity_min' => fake()->optional(40)->randomFloat(2, 30, 40),
                'humidity_max' => fake()->optional(40)->randomFloat(2, 40, 60),
            ],
            'lab' => [
                'is_climate_controlled' => true,
                'temperature_min' => fake()->randomFloat(2, 18, 20),
                'temperature_max' => fake()->randomFloat(2, 22, 24),
                'humidity_min' => fake()->randomFloat(2, 40, 45),
                'humidity_max' => fake()->randomFloat(2, 45, 55),
            ],
            'office' => [
                'is_climate_controlled' => true,
                'temperature_min' => fake()->randomFloat(2, 20, 22),
                'temperature_max' => fake()->randomFloat(2, 22, 24),
                'humidity_min' => fake()->randomFloat(2, 40, 45),
                'humidity_max' => fake()->randomFloat(2, 45, 55),
            ],
            'classroom' => [
                'is_climate_controlled' => fake()->boolean(80),
                'temperature_min' => fake()->optional(70)->randomFloat(2, 18, 20),
                'temperature_max' => fake()->optional(70)->randomFloat(2, 22, 24),
                'humidity_min' => fake()->optional(60)->randomFloat(2, 40, 45),
                'humidity_max' => fake()->optional(60)->randomFloat(2, 45, 55),
            ],
            'workshop' => [
                'is_climate_controlled' => fake()->boolean(30),
                'temperature_min' => fake()->optional(20)->randomFloat(2, 15, 18),
                'temperature_max' => fake()->optional(20)->randomFloat(2, 20, 25),
                'humidity_min' => fake()->optional(15)->randomFloat(2, 30, 40),
                'humidity_max' => fake()->optional(15)->randomFloat(2, 40, 60),
            ],
            'outdoor' => [
                'is_climate_controlled' => false,
                'temperature_min' => null,
                'temperature_max' => null,
                'humidity_min' => null,
                'humidity_max' => null,
            ]
        ];
        
        return $properties[$locationType];
    }



    private function outputStatistics()
    {
        $this->command->info('');
        $this->command->info('=== Database Seeding Complete ===');
        $this->command->info('Universities created: ' . University::count());
        $this->command->info('Departments created: ' . Department::count());
        $this->command->info('Item categories created: ' . ItemCategory::count());
        $this->command->info('Inventory items created: ' . InventoryItem::count());
        $this->command->info('Suppliers created: ' . Supplier::count());
        $this->command->info('Purchase orders created: ' . PurchaseOrder::count());
        $this->command->info('Purchase order items created: ' . PurchaseOrderItem::count());
        $this->command->info('Inventory transactions created: ' . \App\Models\InventoryTransaction::count());
        $this->command->info('Stock levels created: ' . \App\Models\StockLevel::count());
        $this->command->info('Maintenance records created: ' . \App\Models\MaintenanceRecord::count());
        $this->command->info('Locations created: ' . \App\Models\Location::count()); // Add this line
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