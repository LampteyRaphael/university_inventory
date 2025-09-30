<?php

namespace Database\Factories;

use App\Models\University;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $username = Str::lower($firstName . '.' . $lastName);
        $email = $username . '@' . $this->faker->safeEmailDomain();

        $roles = [
            'super_admin', 
            'inventory_manager', 
            'department_head', 
            'procurement_officer', 
            'faculty', 
            'staff', 
            'student'
        ];

        $role = $this->faker->randomElement($roles);

        // Define positions based on role
        $positions = [
            'super_admin' => ['System Administrator', 'IT Director'],
            'inventory_manager' => ['Inventory Manager', 'Stock Controller'],
            'department_head' => ['Department Chair', 'Head of Department'],
            'procurement_officer' => ['Procurement Specialist', 'Purchasing Officer'],
            'faculty' => ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
            'staff' => ['Administrative Assistant', 'Office Manager', 'IT Support', 'Lab Technician'],
            'student' => ['Undergraduate Student', 'Graduate Student', 'Research Student']
        ];

        return [
            'user_id' => Str::uuid(),
            'university_id' => University::factory(),
            'department_id' => Department::factory(),
            'employee_id' => 'EMP' . $this->faker->unique()->numberBetween(1000, 9999),
            'username' => $username,
            'email' => $email,
            'email_verified_at' => $this->faker->optional(80)->dateTimeBetween('-1 year', 'now'),
            'password' => Hash::make('password'),
            'name' => $username,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $this->faker->optional(70)->phoneNumber(),
            'position' => $this->faker->randomElement($positions[$role]),
            'role' => $role,
            'permissions' => $this->generatePermissions($role),
            'is_active' => $this->faker->boolean(85),
            'hire_date' => $role !== 'student' ? $this->faker->optional(80)->dateTimeBetween('-5 years', 'now') : null,
            'termination_date' => $this->faker->optional(5)->dateTimeBetween('-1 year', 'now'),
            'profile_image' => $this->faker->optional(30)->imageUrl(200, 200, 'people'),
            'timezone' => $this->faker->timezone(),
            'language' => $this->faker->randomElement(['en', 'es', 'fr', 'de']),
            'remember_token' => Str::random(10),
            'last_login_at' => $this->faker->optional(60)->dateTimeBetween('-30 days', 'now'),
            'last_login_ip' => $this->faker->optional(60)->ipv4(),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'deleted_at' => null,
        ];
    }

    private function generatePermissions(string $role): ?array
    {
        $permissionSets = [
            'super_admin' => ['*'],
            'inventory_manager' => ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'reports.view'],
            'department_head' => ['inventory.view', 'requests.create', 'requests.approve', 'reports.view', 'budget.view'],
            'procurement_officer' => ['procurement.view', 'procurement.create', 'procurement.edit', 'vendors.manage'],
            'faculty' => ['inventory.view', 'requests.create', 'profile.edit'],
            'staff' => ['inventory.view', 'requests.create', 'profile.edit'],
            'student' => ['inventory.view', 'profile.edit'],
        ];

        return $permissionSets[$role] ?? null;
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'super_admin',
            'position' => 'System Administrator',
            'is_active' => true,
        ]);
    }

    public function inventoryManager(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'inventory_manager',
            'position' => 'Inventory Manager',
        ]);
    }

    public function departmentHead(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'department_head',
            'position' => 'Department Head',
        ]);
    }

    public function faculty(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'faculty',
            'position' => $this->faker->randomElement(['Professor', 'Associate Professor', 'Assistant Professor']),
        ]);
    }

    public function staff(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'staff',
            'position' => $this->faker->randomElement(['Administrative Assistant', 'Office Manager', 'IT Support']),
        ]);
    }

    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'student',
            'position' => $this->faker->randomElement(['Undergraduate Student', 'Graduate Student']),
            'hire_date' => null,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function forUniversity($university): static
    {
        return $this->state(fn (array $attributes) => [
            'university_id' => $university->university_id,
        ]);
    }

    public function forDepartment($department): static
    {
        return $this->state(fn (array $attributes) => [
            'department_id' => $department->department_id,
            'university_id' => $department->university_id,
        ]);
    }

    public function withHireDate($date = null): static
    {
        return $this->state(fn (array $attributes) => [
            'hire_date' => $date ?? $this->faker->dateTimeBetween('-5 years', 'now'),
        ]);
    }
}