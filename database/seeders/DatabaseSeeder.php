<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            UniversitySeeder::class, // Make sure this runs first
            DepartmentSeeder::class,
            // ... other seeders
        ]);

        // $this->call([
        //     UniversitiesSeeder::class,
        // ]);
        // $this->call([
        //  UniversitiesSeeder::class,
        // ]);

        // $this->call([
        //   StockLevelsSeeder::class,
        // ]);

        // $this->call([
        //  UniversitiesSeeder::class,
        //  DepartmentsSeeder::class,
        // ]);


        // $this->call([
        //  UniversitiesSeeder::class,
        //  DepartmentsSeeder::class,
        //  ItemCategoriesSeeder::class,
        // ]);


        // $this->call([
        //  UniversitiesSeeder::class,
        //  DepartmentsSeeder::class,
        //  ItemCategoriesSeeder::class,
        //  InventoryItemsSeeder::class,
        // ]);
        
        // $this->call(SuppliersTableSeeder::class);

        // $this->call(LocationsTableSeeder::class);

    }
}
