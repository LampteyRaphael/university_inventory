<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\University;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing universities
        University::query()->delete();

        // Create major public universities
        $majorUniversities = [
            [
                'name' => 'University of Ghana',
                'code' => 'UG',
                'city' => 'Accra',
                'region' => 'Greater Accra',
                'established' => '1948-08-11'
            ],
            [
                'name' => 'Kwame Nkrumah University of Science and Technology',
                'code' => 'KNUST',
                'city' => 'Kumasi',
                'region' => 'Ashanti',
                'established' => '1952-01-22'
            ],
            [
                'name' => 'University of Cape Coast',
                'code' => 'UCC',
                'city' => 'Cape Coast',
                'region' => 'Central',
                'established' => '1962-10-01'
            ],
            [
                'name' => 'University of Education, Winneba',
                'code' => 'UEW',
                'city' => 'Winneba',
                'region' => 'Central',
                'established' => '1992-09-01'
            ],
        ];

        foreach ($majorUniversities as $uni) {
            University::factory()
                ->active()
                ->public()
                ->create([
                    'name' => $uni['name'],
                    'code' => $uni['code'],
                    'city' => $uni['city'],
                    'state' => $uni['region'],
                    'established_date' => $uni['established'],
                ]);
        }

        // Create technical universities
        $technicalUniversities = [
            ['name' => 'Accra Technical University', 'code' => 'ATU', 'city' => 'Accra', 'region' => 'Greater Accra'],
            ['name' => 'Kumasi Technical University', 'code' => 'KsTU', 'city' => 'Kumasi', 'region' => 'Ashanti'],
            ['name' => 'Takoradi Technical University', 'code' => 'TTU', 'city' => 'Takoradi', 'region' => 'Western'],
            ['name' => 'Koforidua Technical University', 'code' => 'KTU', 'city' => 'Koforidua', 'region' => 'Eastern'],
            ['name' => 'Ho Technical University', 'code' => 'HTU', 'city' => 'Ho', 'region' => 'Volta'],
        ];

        foreach ($technicalUniversities as $tech) {
            University::factory()
                ->active()
                ->technical()
                ->create([
                    'name' => $tech['name'],
                    'code' => $tech['code'],
                    'city' => $tech['city'],
                    'state' => $tech['region'],
                ]);
        }

        // Create other specialized universities
        $specializedUniversities = [
            ['name' => 'University of Professional Studies', 'code' => 'UPSA', 'city' => 'Accra', 'region' => 'Greater Accra'],
            ['name' => 'Ghana Institute of Management and Public Administration', 'code' => 'GIMPA', 'city' => 'Accra', 'region' => 'Greater Accra'],
            ['name' => 'University of Health and Allied Sciences', 'code' => 'UHAS', 'city' => 'Ho', 'region' => 'Volta'],
            ['name' => 'University for Development Studies', 'code' => 'UDS', 'city' => 'Tamale', 'region' => 'Northern'],
            ['name' => 'University of Mines and Technology', 'code' => 'UMaT', 'city' => 'Tarkwa', 'region' => 'Western'],
        ];

        foreach ($specializedUniversities as $special) {
            University::factory()
                ->active()
                ->create([
                    'name' => $special['name'],
                    'code' => $special['code'],
                    'city' => $special['city'],
                    'state' => $special['region'],
                ]);
        }

        // Create remaining technical universities
        $remainingTech = [
            ['name' => 'Sunyani Technical University', 'code' => 'STU', 'city' => 'Sunyani', 'region' => 'Bono'],
            ['name' => 'Tamale Technical University', 'code' => 'TaTU', 'city' => 'Tamale', 'region' => 'Northern'],
            ['name' => 'Cape Coast Technical University', 'code' => 'CCTU', 'city' => 'Cape Coast', 'region' => 'Central'],
            ['name' => 'Bolgatanga Technical University', 'code' => 'BTU', 'city' => 'Bolgatanga', 'region' => 'Upper East'],
            ['name' => 'Wa Technical University', 'code' => 'WTU', 'city' => 'Wa', 'region' => 'Upper West'],
        ];

        foreach ($remainingTech as $tech) {
            University::factory()
                ->active()
                ->technical()
                ->create([
                    'name' => $tech['name'],
                    'code' => $tech['code'],
                    'city' => $tech['city'],
                    'state' => $tech['region'],
                ]);
        }

        $this->command->info('Successfully seeded ' . University::count() . ' Ghanaian universities.');
        
        // Display created universities
        $universities = University::all(['name', 'code', 'city', 'state']);
        $this->command->info("\nCreated Universities:");
        foreach ($universities as $uni) {
            $this->command->info("- {$uni->name} ({$uni->code}) - {$uni->city}, {$uni->state}");
        }
    }
}