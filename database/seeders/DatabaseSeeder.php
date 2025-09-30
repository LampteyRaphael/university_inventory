<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Department;
use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear any existing data first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        Department::truncate();
        University::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Reset the static tracking
        \Database\Factories\DepartmentFactory::resetUsedCodes();

        // Create 3 universities
        $universities = University::factory()->count(3)->create();

        // Create departments for each university with unique codes
        $departments = collect();
        
        $universities->each(function ($university) use (&$departments) {
            $departmentCount = random_int(4, 6);
            $this->command->info("Creating {$departmentCount} departments for university: {$university->name}");
            
            // Pre-define available department codes for this university
            $availableDepartments = [
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
            
            // Shuffle and take the required number
            shuffle($availableDepartments);
            $selectedDepartments = array_slice($availableDepartments, 0, $departmentCount);
            
            foreach ($selectedDepartments as $dept) {
                $department = Department::factory()
                    ->forUniversity($university)
                    ->create([
                        'name' => $dept['name'],
                        'department_code' => $dept['code'],
                    ]);
                
                $departments->push($department);
                $this->command->info("  - Created department: {$department->name} ({$department->department_code})");
            }
        });

        // ADD THIS LINE: Create item categories for each university
        $universities->each(function ($university) {
            $this->command->info("Creating item categories for university: {$university->name}");
            $this->createCategoryHierarchy($university);
        });

        // Create super admin user
        $superAdmin = User::factory()->superAdmin()->create([
            'name' => 'admin',
            'username' => 'admin',
            'email' => 'admin@university.edu',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'employee_id' => 'EMP0001',
            'university_id' => $universities->first()->university_id,
            'department_id' => $departments->first()->department_id,
        ]);
        $this->command->info("Created super admin: admin@university.edu");

        // Track used employee IDs
        $usedEmployeeIds = ['EMP0001']; // Start with super admin ID

        // Create inventory managers (1 per university)
        $universities->each(function ($university) use ($departments, &$usedEmployeeIds) {
            $employeeId = $this->generateUniqueEmployeeId('INV', $usedEmployeeIds);
            $usedEmployeeIds[] = $employeeId;
            
            $inventoryManager = User::factory()->inventoryManager()
                ->forUniversity($university)
                ->forDepartment($departments->where('university_id', $university->university_id)->first())
                ->create([
                    'employee_id' => $employeeId,
                ]);
            $this->command->info("Created inventory manager for {$university->name}: {$inventoryManager->email}");
        });

        // Create department heads (1 per department)
        $departments->each(function ($department) use (&$usedEmployeeIds) {
            $employeeId = $this->generateUniqueEmployeeId('DEPT', $usedEmployeeIds);
            $usedEmployeeIds[] = $employeeId;

            $departmentHead = User::factory()->departmentHead()
                ->forDepartment($department)
                ->create([
                    'employee_id' => $employeeId,
                    'position' => 'Head of ' . $department->name,
                ]);

            // Update department with head of department
            $department->update([
                'department_head_id' => $departmentHead->user_id,
                'contact_person' => $departmentHead->first_name . ' ' . $departmentHead->last_name,
                'contact_email' => $departmentHead->email,
                'contact_phone' => $departmentHead->phone ?? $department->contact_phone,
            ]);
            
            $this->command->info("Created department head for {$department->name}: {$departmentHead->email}");
        });

        // Continue with other user types...
        // [Rest of your user creation code with unique employee IDs]

        $this->command->info('');
        $this->command->info('=== Database Seeding Complete ===');
        $this->command->info('Universities created: ' . $universities->count());
        $this->command->info('Departments created: ' . $departments->count());
        $this->command->info('Item categories created: ' . ItemCategory::count());
        $this->command->info('Total users created: ' . User::count());
        $this->command->info('=== Login Credentials ===');
        $this->command->info('Super Admin: admin@university.edu / admin123');
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
    /**
 * Create category hierarchy for a university
 */
private function createCategoryHierarchy(University $university): void
{
    // Common inventory categories hierarchy
    $categoryHierarchy = [
        'Electronics' => [
            'code' => 'ELEC',
            'children' => [
                'Computers' => 'COMP',
                'Printers & Scanners' => 'PRINT',
                'Networking Equipment' => 'NET',
                'Audio Visual' => 'AV',
            ],
            'traits' => ['requiresSerialNumber', 'highDepreciation']
        ],
        'Furniture' => [
            'code' => 'FURN',
            'children' => [
                'Office Chairs' => 'CHAIR',
                'Desks & Tables' => 'DESK',
                'Storage Cabinets' => 'CAB',
                'Shelving' => 'SHELF',
            ],
            'traits' => ['lowDepreciation']
        ],
        'Lab Equipment' => [
            'code' => 'LAB',
            'children' => [
                'Microscopes' => 'MICRO',
                'Centrifuges' => 'CENT',
                'Incubators' => 'INCUB',
                'Safety Equipment' => 'SAFE',
            ],
            'traits' => ['requiresSerialNumber', 'requiresMaintenance', 'highDepreciation']
        ],
        'Office Supplies' => [
            'code' => 'OFFICE',
            'children' => [
                'Stationery' => 'STAT',
                'Paper Products' => 'PAPER',
                'Writing Instruments' => 'WRITE',
            ],
            'traits' => ['lowDepreciation']
        ],
    ];

    foreach ($categoryHierarchy as $parentName => $parentData) {
        // Create parent category
        $parentCategory = ItemCategory::factory()
            ->forUniversity($university)
            ->create([
                'name' => $parentName,
                'category_code' => $parentData['code'],
                'description' => "All {$parentName} related items and equipment",
                'requires_serial_number' => in_array('requiresSerialNumber', $parentData['traits']),
                'requires_maintenance' => in_array('requiresMaintenance', $parentData['traits']),
                'depreciation_rate' => in_array('highDepreciation', $parentData['traits']) ? 
                    rand(20, 40) : rand(5, 15),
                'depreciation_method' => in_array('highDepreciation', $parentData['traits']) ? 
                    'reducing_balance' : 'straight_line',
            ]);

        $this->command->info("  - Created parent category: {$parentName} ({$parentData['code']})");

        // Create child categories
        foreach ($parentData['children'] as $childName => $childCode) {
            ItemCategory::factory()
                ->forUniversity($university)
                ->withSpecificParent($parentCategory)
                ->create([
                    'name' => $childName,
                    'category_code' => $childCode,
                    'description' => "Specific items for {$childName}",
                    'requires_serial_number' => in_array('requiresSerialNumber', $parentData['traits']),
                    'requires_maintenance' => in_array('requiresMaintenance', $parentData['traits']),
                    'maintenance_interval_days' => in_array('requiresMaintenance', $parentData['traits']) ? 
                        rand(180, 365) : null,
                    'depth' => 1,
                ]);

            $this->command->info("    └── Created sub-category: {$childName} ({$childCode})");
        }
    }

    // Create some additional standalone categories
    $standaloneCategories = [
        ['name' => 'Vehicles', 'code' => 'VEH', 'warranty' => 365, 'depreciation' => 25],
        ['name' => 'Tools & Equipment', 'code' => 'TOOL', 'warranty' => 90, 'depreciation' => 15],
        ['name' => 'Safety Gear', 'code' => 'SAFETY', 'warranty' => 180, 'depreciation' => 10],
    ];

    foreach ($standaloneCategories as $category) {
        ItemCategory::factory()
            ->forUniversity($university)
            ->create([
                'name' => $category['name'],
                'category_code' => $category['code'],
                'warranty_period_days' => $category['warranty'],
                'depreciation_rate' => $category['depreciation'],
                'requires_maintenance' => true,
                'maintenance_interval_days' => rand(90, 180),
            ]);

        $this->command->info("  - Created standalone category: {$category['name']} ({$category['code']})");
    }

    // Create a few inactive categories
    ItemCategory::factory()
        ->count(2)
        ->forUniversity($university)
        ->inactive()
        ->create();

    $this->command->info("  - Created 2 inactive categories");
}

}