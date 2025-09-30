<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    // Static array to track used codes across all factory instances
    private static $usedCodesByUniversity = [];

    public function definition(): array
    {
        $departments = [
            'Computer Science' => 'CS',
            'Electrical Engineering' => 'EE', 
            'Mechanical Engineering' => 'ME',
            'Civil Engineering' => 'CE',
            'Biology' => 'BIO',
            'Chemistry' => 'CHEM',
            'Physics' => 'PHY',
            'Mathematics' => 'MATH',
            'Business Administration' => 'BUS',
            'Economics' => 'ECON',
            'Psychology' => 'PSY',
            'Sociology' => 'SOC',
            'History' => 'HIST',
            'English Literature' => 'ENG',
            'Political Science' => 'POLI',
            'Accounting' => 'ACC',
            'Finance' => 'FIN',
            'Marketing' => 'MKT',
            'Human Resources' => 'HR',
            'Information Technology' => 'IT',
            'Environmental Science' => 'ENV',
            'Biomedical Engineering' => 'BME',
            'Architecture' => 'ARCH',
            'Fine Arts' => 'ART',
            'Music' => 'MUSIC',
            'Drama' => 'DRAMA',
            'Communications' => 'COMM',
            'Journalism' => 'JOUR'
        ];

        // Get university - will be overridden by forUniversity() if used
        $university = University::inRandomOrder()->first() ?? University::factory()->create();
        $universityId = $university->university_id;

        // Get unique department data
        $departmentData = $this->getUniqueDepartmentData($universityId, $departments);

        $buildings = ['Science Building', 'Engineering Hall', 'Business Tower', 'Liberal Arts Building', 'Technology Center'];
        $floors = ['1', '2', '3', '4', 'G', 'B1'];
        $rooms = ['101', '201', '301', '102', '202', '302', '105A', '205B'];

        return [
            'department_id' => Str::uuid(),
            'university_id' => $universityId,
            'department_code' => $departmentData['code'],
            'name' => $departmentData['name'],
            'building' => $this->faker->randomElement($buildings),
            'floor' => $this->faker->randomElement($floors),
            'room_number' => $this->faker->randomElement($rooms),
            'contact_person' => $this->faker->name(),
            'contact_email' => Str::lower($departmentData['code']) . '@' . $this->faker->domainName(),
            'contact_phone' => $this->faker->phoneNumber(),
            'annual_budget' => $this->faker->randomFloat(2, 50000, 500000),
            'remaining_budget' => function (array $attributes) {
                return $this->faker->randomFloat(2, 0, $attributes['annual_budget']);
            },
            'department_head_id' => null,
            'is_active' => $this->faker->boolean(95),
            'custom_fields' => $this->faker->optional(40)->passthrough([
                'research_focus' => $this->faker->sentence(3),
                'lab_count' => $this->faker->numberBetween(1, 10),
                'student_capacity' => $this->faker->numberBetween(50, 500),
            ]),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    private function getUniqueDepartmentData(string $universityId, array $allDepartments): array
    {
        // Initialize tracking for this university if not exists
        if (!isset(self::$usedCodesByUniversity[$universityId])) {
            self::$usedCodesByUniversity[$universityId] = [];
        }

        // Get available departments that haven't been used for this university
        $available = array_filter($allDepartments, function ($code) use ($universityId) {
            return !in_array($code, self::$usedCodesByUniversity[$universityId]);
        });

        if (!empty($available)) {
            // Use a standard department
            $name = array_key_first($available); // Get first available department
            $code = $available[$name];
        } else {
            // Create a unique department name and code
            $name = $this->generateUniqueDepartmentName();
            $code = $this->generateUniqueCode($name, $universityId);
        }

        // Mark this code as used for this university
        self::$usedCodesByUniversity[$universityId][] = $code;

        return [
            'name' => $name,
            'code' => $code
        ];
    }

    private function generateUniqueDepartmentName(): string
    {
        $subjects = ['Studies', 'Sciences', 'Engineering', 'Management', 'Technology', 'Research', 'Arts'];
        $prefixes = ['Advanced', 'Applied', 'Digital', 'Global', 'Sustainable', 'Industrial'];
        
        return $this->faker->randomElement($prefixes) . ' ' . 
               $this->faker->word() . ' ' . 
               $this->faker->randomElement($subjects);
    }

    private function generateUniqueCode(string $departmentName, string $universityId): string
    {
        // Create base code from department name
        $words = explode(' ', $departmentName);
        $baseCode = '';
        
        foreach ($words as $word) {
            $baseCode .= strtoupper(substr($word, 0, 1));
        }
        
        // Ensure base code is at least 2 characters
        if (strlen($baseCode) < 2) {
            $baseCode = strtoupper(substr($departmentName, 0, 3));
        }
        
        $code = $baseCode;
        $counter = 1;

        // Check if code is already used
        while (in_array($code, self::$usedCodesByUniversity[$universityId] ?? [])) {
            $code = $baseCode . $counter;
            $counter++;
            
            if ($counter > 50) {
                // Fallback to completely random code
                $code = 'D' . Str::upper(Str::random(3));
                break;
            }
        }

        return $code;
    }

    public function forUniversity($university): static
    {
        return $this->state([
            'university_id' => $university->university_id,
        ]);
    }

    public function inactive(): static
    {
        return $this->state([
            'is_active' => false,
        ]);
    }

    public function highBudget(): static
    {
        return $this->state([
            'annual_budget' => $this->faker->randomFloat(2, 300000, 500000),
            'remaining_budget' => $this->faker->randomFloat(2, 50000, 300000),
        ]);
    }

    public function lowBudget(): static
    {
        return $this->state([
            'annual_budget' => $this->faker->randomFloat(2, 50000, 150000),
            'remaining_budget' => $this->faker->randomFloat(2, 0, 50000),
        ]);
    }

    /**
     * Reset the used codes tracking (useful for testing)
     */
    public static function resetUsedCodes(): void
    {
        self::$usedCodesByUniversity = [];
    }
}