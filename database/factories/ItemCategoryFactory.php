<?php

namespace Database\Factories;

use App\Models\ItemCategory;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ItemCategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ItemCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categoryName = $this->faker->unique()->words(2, true);
        $categoryCode = Str::upper(Str::substr(str_replace(' ', '', $categoryName), 0, 6));

        return [
            'category_id' => Str::uuid(),
            'university_id' => University::factory(),
            'parent_category_id' => null,
            'category_code' => $categoryCode,
            'name' => $categoryName . ' Category',
            'description' => $this->faker->optional(70)->sentence(10),
            'image_url' => $this->faker->optional(30)->imageUrl(400, 300, 'technics'),
            'warranty_period_days' => $this->faker->numberBetween(0, 1095), // 0-3 years
            'depreciation_rate' => $this->faker->randomFloat(2, 0, 50),
            'depreciation_method' => $this->faker->randomElement(['straight_line', 'reducing_balance']),
            'requires_serial_number' => $this->faker->boolean(40),
            'requires_maintenance' => $this->faker->boolean(60),
            'maintenance_interval_days' => $this->faker->optional(50)->numberBetween(30, 365),
            'specification_template' => $this->faker->optional(40)->passthrough([
                'brand' => $this->faker->company(),
                'model' => $this->faker->word(),
                'specifications' => $this->faker->sentences(3),
            ]),
            'lft' => null,
            'rgt' => null,
            'depth' => 0,
            'is_active' => $this->faker->boolean(90),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the category has a parent category.
     */
    public function withParent(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'parent_category_id' => ItemCategory::factory(),
            ];
        });
    }

    /**
     * Indicate that the category requires serial numbers.
     */
    public function requiresSerialNumber(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'requires_serial_number' => true,
            ];
        });
    }

    /**
     * Indicate that the category requires maintenance.
     */
    public function requiresMaintenance(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'requires_maintenance' => true,
                'maintenance_interval_days' => $this->faker->numberBetween(30, 365),
            ];
        });
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate a high depreciation rate.
     */
    public function highDepreciation(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'depreciation_rate' => $this->faker->randomFloat(2, 30, 50),
                'depreciation_method' => 'reducing_balance',
            ];
        });
    }

    /**
     * Indicate a low depreciation rate.
     */
    public function lowDepreciation(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'depreciation_rate' => $this->faker->randomFloat(2, 5, 15),
                'depreciation_method' => 'straight_line',
            ];
        });
    }

    /**
     * For a specific university.
     */
    public function forUniversity($university): static
    {
        return $this->state(function (array $attributes) use ($university) {
            return [
                'university_id' => $university->university_id,
            ];
        });
    }

    /**
     * With specific parent category.
     */
    public function withSpecificParent($parentCategory): static
    {
        return $this->state(function (array $attributes) use ($parentCategory) {
            return [
                'parent_category_id' => $parentCategory->category_id,
                'university_id' => $parentCategory->university_id,
            ];
        });
    }

    
}