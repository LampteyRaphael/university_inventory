<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
// LocationFactory.php
use App\Models\Location;
use App\Models\University;
use App\Models\Department;
use Illuminate\Support\Str;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition()
    {
        return [
            'location_id' => $this->faker->uuid(),
            'university_id' => University::factory(),  // auto-create related university
            'department_id' => Department::factory(),  // auto-create related department
            'location_code' => strtoupper(Str::random(6)),
            'name' => $this->faker->word(),
            'building' => $this->faker->company(),
            'floor' => $this->faker->randomElement(['1', '2', '3', 'Ground']),
            'room_number' => $this->faker->bothify('Room-###'),
            'aisle' => 'A' . $this->faker->numberBetween(1, 10),
            'shelf' => 'S' . $this->faker->numberBetween(1, 20),
            'bin' => 'B' . $this->faker->numberBetween(1, 50),
            'capacity' => $this->faker->randomFloat(2, 50, 1000),
            'current_utilization' => $this->faker->randomFloat(2, 0, 500),
            'location_type' => $this->faker->randomElement(['storage', 'office', 'lab', 'classroom']),
            'is_secured' => $this->faker->boolean(),
            'is_climate_controlled' => $this->faker->boolean(),
            'temperature_min' => $this->faker->randomFloat(2, 15, 20),
            'temperature_max' => $this->faker->randomFloat(2, 21, 30),
            'humidity_min' => $this->faker->randomFloat(2, 30, 40),
            'humidity_max' => $this->faker->randomFloat(2, 41, 60),
            'is_active' => true,
            'managed_by' => null,
        ];
    }
}
