<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => Uuid::uuid4()->toString(),
            'university_id' => function () {
                return \App\Models\University::factory()->create()->university_id;
            },
            'department_code' => strtoupper($this->faker->bothify('DEPT###')),
            'name' => $this->faker->unique()->words(3, true) . ' Department',
            'building' => $this->faker->buildingNumber(),
            'floor' => $this->faker->randomElement([null, $this->faker->numberBetween(1, 10)]),
            'room_number' => $this->faker->randomElement([null, $this->faker->bothify('Room ###')]),
            'contact_person' => $this->faker->name(),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'annual_budget' => $this->faker->randomFloat(2, 10000, 500000),
            'remaining_budget' => function (array $attributes) {
                return $this->faker->randomFloat(2, 0, $attributes['annual_budget']);
            },
            'department_head_id' => $this->faker->randomElement([null, function () {
                return \App\Models\User::factory()->create()->id;
            }]),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'custom_fields' => $this->faker->randomElement([
                null,
                json_encode(['specialization' => $this->faker->word(), 'established_year' => $this->faker->year()])
            ]),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            },
            'deleted_at' => null,
        ];
    }

    /**
     * Indicate that the department is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the department is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the department has a department head.
     */
    public function withHead(): static
    {
        return $this->state(fn (array $attributes) => [
            'department_head_id' => \App\Models\User::factory()->create()->id,
        ]);
    }

    /**
     * Indicate that the department has no department head.
     */
    public function withoutHead(): static
    {
        return $this->state(fn (array $attributes) => [
            'department_head_id' => null,
        ]);
    }

    /**
     * Indicate that the department has specific location details.
     */
    public function withLocation(): static
    {
        return $this->state(fn (array $attributes) => [
            'floor' => $this->faker->numberBetween(1, 10),
            'room_number' => $this->faker->bothify('Room ###'),
        ]);
    }

    /**
     * Indicate that the department has custom fields.
     */
    public function withCustomFields(): static
    {
        return $this->state(fn (array $attributes) => [
            'custom_fields' => json_encode([
                'specialization' => $this->faker->word(),
                'established_year' => $this->faker->year(),
                'accreditation_status' => $this->faker->randomElement(['A', 'B', 'C']),
                'student_capacity' => $this->faker->numberBetween(50, 500),
            ]),
        ]);
    }

    /**
     * Indicate that the department has a specific annual budget.
     */
    public function withBudget(float $annualBudget): static
    {
        return $this->state(fn (array $attributes) => [
            'annual_budget' => $annualBudget,
            'remaining_budget' => $this->faker->randomFloat(2, 0, $annualBudget),
        ]);
    }

    /**
     * Indicate that the department is soft deleted.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => $this->faker->dateTimeBetween($attributes['created_at'], 'now'),
            'is_active' => false,
        ]);
    }
}