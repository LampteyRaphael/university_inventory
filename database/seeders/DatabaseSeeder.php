<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Department;
use App\Models\User;
use App\Models\ItemCategory;
use App\Models\InventoryItem;
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
        University::truncate();
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
        $this->createInventoryItems($universities);

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
        $universities->each(function ($university) {
            $categories = ItemCategory::where('university_id', $university->university_id)->get();
            $users = User::where('university_id', $university->university_id)->get();
            
            if ($users->isEmpty()) {
                $this->command->error("No users found for university: {$university->name}");
                return;
            }
            
            $this->command->info("Creating inventory items for university: {$university->name}");
            
            $categories->each(function ($category) use ($users) {
                $itemCount = random_int(3, 8);
                for ($i = 0; $i < $itemCount; $i++) {
                    InventoryItem::create([
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
                }
                $this->command->info("  - Created {$itemCount} items for category: {$category->name}");
            });
        });
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