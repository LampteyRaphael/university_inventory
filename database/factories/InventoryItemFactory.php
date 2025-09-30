<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\University;
use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InventoryItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = InventoryItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $itemName = $this->faker->words(3, true);
        $unitCost = $this->faker->randomFloat(2, 10, 5000);
        $abcClassification = $this->calculateAbcClassification($unitCost);

        return [
            'item_id' => Str::uuid(),
            'university_id' => University::factory(),
            'category_id' => ItemCategory::factory(),
            'item_code' => 'ITEM' . $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $itemName,
            'description' => $this->faker->optional(80)->sentence(15),
            'specifications' => $this->faker->optional(60)->passthrough([
                'brand' => $this->faker->company(),
                'model' => $this->faker->bothify('??-####'),
                'dimensions' => $this->faker->randomElement(['10x20x30 cm', '15x25x35 cm', '20x30x40 cm']),
                'color' => $this->faker->safeColorName(),
                'material' => $this->faker->randomElement(['Plastic', 'Metal', 'Wood', 'Composite']),
                'power_requirements' => $this->faker->optional()->randomElement(['110V', '220V', 'Battery']),
            ]),
            'unit_of_measure' => $this->faker->randomElement(['Piece', 'Unit', 'Set', 'Box', 'Packet', 'Meter', 'Kilogram']),
            'unit_cost' => $unitCost,
            'current_value' => function (array $attributes) {
                // Current value is typically 70-100% of unit cost
                return $this->faker->randomFloat(2, $attributes['unit_cost'] * 0.7, $attributes['unit_cost']);
            },
            'minimum_stock_level' => $this->faker->numberBetween(1, 10),
            'maximum_stock_level' => $this->faker->optional(70)->numberBetween(50, 200),
            'reorder_point' => function (array $attributes) {
                return $attributes['minimum_stock_level'] + $this->faker->numberBetween(5, 20);
            },
            'economic_order_quantity' => $this->faker->optional(50)->numberBetween(10, 100),
            'abc_classification' => $abcClassification,
            'weight_kg' => $this->faker->optional(60)->randomFloat(3, 0.1, 50),
            'volume_cubic_m' => $this->faker->optional(50)->randomFloat(4, 0.001, 2),
            'is_hazardous' => $this->faker->boolean(15),
            'hazard_type' => function (array $attributes) {
                return $attributes['is_hazardous'] ? $this->faker->randomElement(['Flammable', 'Toxic', 'Corrosive', 'Reactive']) : null;
            },
            'handling_instructions' => function (array $attributes) {
                return $attributes['is_hazardous'] ? $this->faker->sentence(10) : null;
            },
            'storage_conditions' => $this->faker->optional(40)->randomElement(['Room Temperature', 'Refrigerated', 'Dry Place', 'Ventilated Area']),
            'shelf_life_days' => $this->faker->optional(30)->numberBetween(30, 1095),
            'expiry_date' => $this->faker->optional(20)->dateTimeBetween('now', '+2 years'),
            'barcode' => $this->faker->optional(70)->isbn13(),
            'qr_code' => $this->faker->optional(50)->uuid(),
            'rfid_tag' => $this->faker->optional(30)->uuid(),
            'image_url' => $this->faker->optional(40)->imageUrl(400, 300, 'technics', true, $itemName),
            'document_url' => $this->faker->optional(20)->url(),
            'is_active' => $this->faker->boolean(90),
            'created_by' => User::factory(),
            'updated_by' => $this->faker->optional(70)->passthrough(User::factory()),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Calculate ABC classification based on unit cost
     */
    private function calculateAbcClassification(float $unitCost): string
    {
        if ($unitCost > 1000) return 'A';
        if ($unitCost > 100) return 'B';
        return 'C';
    }

    /**
     * Indicate that the item is high value (Class A)
     */
    public function highValue(): static
    {
        return $this->state(function (array $attributes) {
            $unitCost = $this->faker->randomFloat(2, 1000, 5000);
            return [
                'unit_cost' => $unitCost,
                'current_value' => $this->faker->randomFloat(2, $unitCost * 0.7, $unitCost),
                'abc_classification' => 'A',
            ];
        });
    }

    /**
     * Indicate that the item is medium value (Class B)
     */
    public function mediumValue(): static
    {
        return $this->state(function (array $attributes) {
            $unitCost = $this->faker->randomFloat(2, 100, 999.99);
            return [
                'unit_cost' => $unitCost,
                'current_value' => $this->faker->randomFloat(2, $unitCost * 0.7, $unitCost),
                'abc_classification' => 'B',
            ];
        });
    }

    /**
     * Indicate that the item is low value (Class C)
     */
    public function lowValue(): static
    {
        return $this->state(function (array $attributes) {
            $unitCost = $this->faker->randomFloat(2, 10, 99.99);
            return [
                'unit_cost' => $unitCost,
                'current_value' => $this->faker->randomFloat(2, $unitCost * 0.7, $unitCost),
                'abc_classification' => 'C',
            ];
        });
    }

    /**
     * Indicate that the item is hazardous
     */
    public function hazardous(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_hazardous' => true,
                'hazard_type' => $this->faker->randomElement(['Flammable', 'Toxic', 'Corrosive', 'Reactive']),
                'handling_instructions' => $this->faker->sentence(10),
                'storage_conditions' => $this->faker->randomElement(['Ventilated Area', 'Safety Cabinet', 'Flammable Storage']),
            ];
        });
    }

    /**
     * Indicate that the item is inactive
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
     * Indicate that the item is expiring soon
     */
    public function expiringSoon(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'expiry_date' => $this->faker->dateTimeBetween('now', '+30 days'),
                'shelf_life_days' => $this->faker->numberBetween(30, 60),
            ];
        });
    }

    /**
     * For a specific university
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
     * For a specific category
     */
    public function forCategory($category): static
    {
        return $this->state(function (array $attributes) use ($category) {
            return [
                'category_id' => $category->category_id,
                'university_id' => $category->university_id,
            ];
        });
    }

    /**
     * Created by a specific user
     */
    public function createdBy($user): static
    {
        return $this->state(function (array $attributes) use ($user) {
            return [
                'created_by' => $user->user_id,
            ];
        });
    }
}