<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\University;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create universities first
        $universities = University::all();
        
        if ($universities->isEmpty()) {
            // Create some universities if none exist
            $universities = University::factory()->count(3)->create();
        }
        
    $commonDepartments = [
    [
        'department_code' => 'CS',
        'name' => 'Computer Science',
        'building' => 'Engineering Building',
        'floor' => 3,
        'room_number' => '301',
        'contact_person' => 'Dr. Sarah Johnson',
        'annual_budget' => 350000.00,
    ],
    [
        'department_code' => 'MATH',
        'name' => 'Mathematics',
        'building' => 'Science Building',
        'floor' => 2,
        'room_number' => '205',
        'contact_person' => 'Prof. Michael Chen',
        'annual_budget' => 280000.00,
    ],
    [
        'department_code' => 'PHYS',
        'name' => 'Physics',
        'building' => 'Science Building',
        'floor' => 3,
        'room_number' => '310',
        'contact_person' => 'Dr. Emily Watson',
        'annual_budget' => 420000.00,
    ],
    [
        'department_code' => 'BIO',
        'name' => 'Biology',
        'building' => 'Life Sciences Building',
        'floor' => 1,
        'room_number' => '105',
        'contact_person' => 'Dr. Robert Kim',
        'annual_budget' => 380000.00,
    ],
    [
        'department_code' => 'CHEM',
        'name' => 'Chemistry',
        'building' => 'Science Building',
        'floor' => 1,
        'room_number' => '115',
        'contact_person' => 'Prof. Lisa Garcia',
        'annual_budget' => 320000.00,
    ],
    [
        'department_code' => 'ENG',
        'name' => 'English',
        'building' => 'Humanities Building',
        'floor' => 2,
        'room_number' => '210',
        'contact_person' => 'Dr. James Wilson',
        'annual_budget' => 250000.00,
    ],
    [
        'department_code' => 'HIST',
        'name' => 'History',
        'building' => 'Humanities Building',
        'floor' => 3,
        'room_number' => '315',
        'contact_person' => 'Prof. Patricia Brown',
        'annual_budget' => 220000.00,
    ],
    [
        'department_code' => 'BUS',
        'name' => 'Business Administration',
        'building' => 'Business Building',
        'floor' => 4,
        'room_number' => '401',
        'contact_person' => 'Dr. Richard Taylor',
        'annual_budget' => 450000.00,
    ],
    [
        'department_code' => 'PSY',
        'name' => 'Psychology',
        'building' => 'Social Sciences Building',
        'floor' => 2,
        'room_number' => '225',
        'contact_person' => 'Dr. Amanda Lee',
        'annual_budget' => 300000.00,
    ],
    [
        'department_code' => 'ART',
        'name' => 'Fine Arts',
        'building' => 'Arts Building',
        'floor' => 1,
        'room_number' => '101',
        'contact_person' => 'Prof. David Martinez',
        'annual_budget' => 180000.00,
    ],
    // New ones
    [
        'department_code' => 'LAW',
        'name' => 'Law',
        'building' => 'Law Building',
        'floor' => 2,
        'room_number' => '210',
        'contact_person' => 'Dr. Stephanie Green',
        'annual_budget' => 500000.00,
    ],
    [
        'department_code' => 'MED',
        'name' => 'Medicine',
        'building' => 'Medical Sciences Building',
        'floor' => 5,
        'room_number' => '505',
        'contact_person' => 'Dr. Charles Roberts',
        'annual_budget' => 800000.00,
    ],
    [
        'department_code' => 'NURS',
        'name' => 'Nursing',
        'building' => 'Health Sciences Building',
        'floor' => 2,
        'room_number' => '215',
        'contact_person' => 'Prof. Karen White',
        'annual_budget' => 400000.00,
    ],
    [
        'department_code' => 'PHAR',
        'name' => 'Pharmacy',
        'building' => 'Health Sciences Building',
        'floor' => 3,
        'room_number' => '305',
        'contact_person' => 'Dr. Henry Evans',
        'annual_budget' => 350000.00,
    ],
    [
        'department_code' => 'EDU',
        'name' => 'Education',
        'building' => 'Education Building',
        'floor' => 1,
        'room_number' => '110',
        'contact_person' => 'Prof. Alice Scott',
        'annual_budget' => 270000.00,
    ],
    [
        'department_code' => 'SOC',
        'name' => 'Sociology',
        'building' => 'Social Sciences Building',
        'floor' => 3,
        'room_number' => '320',
        'contact_person' => 'Dr. William Harris',
        'annual_budget' => 230000.00,
    ],
    [
        'department_code' => 'POL',
        'name' => 'Political Science',
        'building' => 'Social Sciences Building',
        'floor' => 4,
        'room_number' => '405',
        'contact_person' => 'Prof. Laura Adams',
        'annual_budget' => 260000.00,
    ],
    [
        'department_code' => 'ECON',
        'name' => 'Economics',
        'building' => 'Business Building',
        'floor' => 2,
        'room_number' => '215',
        'contact_person' => 'Dr. George Brown',
        'annual_budget' => 330000.00,
    ],
    [
        'department_code' => 'ARCH',
        'name' => 'Architecture',
        'building' => 'Architecture Building',
        'floor' => 1,
        'room_number' => '120',
        'contact_person' => 'Prof. Daniel Turner',
        'annual_budget' => 370000.00,
    ],
    [
        'department_code' => 'ENV',
        'name' => 'Environmental Science',
        'building' => 'Science Building',
        'floor' => 4,
        'room_number' => '410',
        'contact_person' => 'Dr. Monica Perez',
        'annual_budget' => 340000.00,
    ],
    [
        'department_code' => 'LING',
        'name' => 'Linguistics',
        'building' => 'Humanities Building',
        'floor' => 1,
        'room_number' => '115',
        'contact_person' => 'Dr. Samuel Young',
        'annual_budget' => 210000.00,
    ],
    [
        'department_code' => 'MUS',
        'name' => 'Music',
        'building' => 'Arts Building',
        'floor' => 2,
        'room_number' => '220',
        'contact_person' => 'Prof. Olivia Walker',
        'annual_budget' => 200000.00,
    ],
    [
        'department_code' => 'SPORT',
        'name' => 'Sports Science',
        'building' => 'Recreation Center',
        'floor' => 1,
        'room_number' => '105',
        'contact_person' => 'Dr. Brian Clark',
        'annual_budget' => 240000.00,
    ],
    [
        'department_code' => 'IT',
        'name' => 'Information Technology',
        'building' => 'Engineering Building',
        'floor' => 2,
        'room_number' => '215',
        'contact_person' => 'Dr. Natalie Brooks',
        'annual_budget' => 360000.00,
    ],
    [
        'department_code' => 'ASTRO',
        'name' => 'Astronomy',
        'building' => 'Observatory',
        'floor' => 1,
        'room_number' => '101',
        'contact_person' => 'Prof. Ethan Carter',
        'annual_budget' => 310000.00,
    ],
];


        // Create departments for each university
        foreach ($universities as $university) {
            foreach ($commonDepartments as $departmentData) {
                Department::factory()->create([
                    'university_id' => $university->university_id,
                    'department_code' => $departmentData['department_code'],
                    'name' => $departmentData['name'],
                    'building' => $departmentData['building'],
                    'floor' => $departmentData['floor'],
                    'room_number' => $departmentData['room_number'],
                    'contact_person' => $departmentData['contact_person'],
                    'contact_email' => strtolower(str_replace(' ', '.', $departmentData['contact_person'])) . '@' . strtolower(str_replace(' ', '', $university->name)) . '.edu',
                    'contact_phone' => $this->generatePhoneNumber(),
                    'annual_budget' => $departmentData['annual_budget'],
                    'remaining_budget' => $departmentData['annual_budget'] * 0.7, // 70% of annual budget remaining
                    'is_active' => true,
                    'custom_fields' => $this->getCustomFields($departmentData['department_code']),
                ]);
            }

            // Create some additional random departments for variety
            Department::factory()->count(5)->create([
                'university_id' => $university->university_id,
                'is_active' => $this->faker()->boolean(85), // 85% chance of being active
            ]);
        }

        // Create some inactive departments
        Department::factory()->count(8)->inactive()->create([
            'university_id' => $universities->random()->university_id,
        ]);

        // Create some departments with custom fields
        Department::factory()->count(6)->withCustomFields()->create([
            'university_id' => $universities->random()->university_id,
        ]);

        $this->command->info('Departments seeded successfully!');
        $this->command->info('Total departments created: ' . Department::count());
    }

    /**
     * Generate a random phone number.
     */
    private function generatePhoneNumber(): string
    {
        return sprintf(
            '(%03d) %03d-%04d',
            rand(200, 999),
            rand(200, 999),
            rand(1000, 9999)
        );
    }

    /**
     * Get custom fields based on department code.
     */
    private function getCustomFields(string $departmentCode): array
    {
        $customFields = [
            'CS' => [
                'specialization' => 'Artificial Intelligence',
                'lab_count' => 4,
                'software_licenses' => ['MATLAB', 'IntelliJ', 'VS Code'],
                'accreditation_status' => 'ABET'
            ],
            'MATH' => [
                'specialization' => 'Applied Mathematics',
                'lab_count' => 1,
                'research_focus' => 'Number Theory',
                'accreditation_status' => 'AMS'
            ],
            'PHYS' => [
                'specialization' => 'Quantum Physics',
                'lab_count' => 3,
                'equipment_value' => 150000.00,
                'accreditation_status' => 'APS'
            ],
            'BIO' => [
                'specialization' => 'Molecular Biology',
                'lab_count' => 5,
                'specimen_count' => 2500,
                'biosafety_level' => 2
            ],
            'BUS' => [
                'specialization' => 'Finance',
                'accreditation' => 'AACSB',
                'corporate_partners' => 15,
                'internship_program' => true
            ]
        ];

        return $customFields[$departmentCode] ?? [
            'specialization' => 'General',
            'established_year' => rand(1990, 2020),
            'notes' => 'Standard department configuration'
        ];
    }

    /**
     * Get Faker instance.
     */
    private function faker()
    {
        return \Faker\Factory::create();
    }
}