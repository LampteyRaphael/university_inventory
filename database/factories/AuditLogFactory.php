<?php

namespace Database\Factories;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition()
    {
        return [
            'audit_id' => (string) \Illuminate\Support\Str::uuid(),
            'university_id' => (string) \Illuminate\Support\Str::uuid(),
            'table_name' => $this->faker->randomElement(['users', 'departments', 'inventory_items', 'maintenance_records']),
            'record_id' => (string) \Illuminate\Support\Str::uuid(),
            'action' => $this->faker->randomElement(['CREATE', 'UPDATE', 'DELETE']),
            'old_values' => $this->faker->randomElement([null, ['name' => 'Old Name', 'email' => 'old@example.com']]),
            'new_values' => $this->faker->randomElement([null, ['name' => 'New Name', 'email' => 'new@example.com']]),
            'url' => $this->faker->url(),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'user_id' => $this->faker->randomElement([(string) \Illuminate\Support\Str::uuid(), null]),
            'performed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function createAction()
    {
        return $this->state([
            'action' => 'CREATE',
            'old_values' => null,
            'new_values' => ['name' => 'New Record', 'status' => 'active'],
        ]);
    }

    public function updateAction()
    {
        return $this->state([
            'action' => 'UPDATE',
            'old_values' => ['name' => 'Old Name', 'status' => 'inactive'],
            'new_values' => ['name' => 'New Name', 'status' => 'active'],
        ]);
    }

    public function deleteAction()
    {
        return $this->state([
            'action' => 'DELETE',
            'old_values' => ['name' => 'Deleted Record', 'status' => 'active'],
            'new_values' => null,
        ]);
    }

    public function systemAction()
    {
        return $this->state([
            'user_id' => null,
        ]);
    }

    public function forTable(string $tableName)
    {
        return $this->state([
            'table_name' => $tableName,
        ]);
    }

    public function recent()
    {
        return $this->state([
            'performed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }
}