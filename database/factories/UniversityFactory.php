<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\University;

class UniversityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $ghanaianUniversities = [
            'University of Ghana',
            'Kwame Nkrumah University of Science and Technology',
            'University of Cape Coast',
            'University of Education, Winneba',
            'University of Professional Studies',
            'Ghana Institute of Management and Public Administration',
            'University of Health and Allied Sciences',
            'University for Development Studies',
            'University of Mines and Technology',
            'Ghana Communication Technology University',
            'Koforidua Technical University',
            'Takoradi Technical University',
            'Kumasi Technical University',
            'Accra Technical University',
            'Ho Technical University',
            'Sunyani Technical University',
            'Tamale Technical University',
            'Cape Coast Technical University',
            'Bolgatanga Technical University',
            'Wa Technical University'
        ];

        $name = $this->faker->unique()->randomElement($ghanaianUniversities);
        
        // Generate unique code from university name
        $code = $this->generateGhanaianUniversityCode($name);
        
        $ghanaianCities = [
            'Accra', 'Kumasi', 'Cape Coast', 'Tamale', 'Takoradi', 'Sunyani', 
            'Ho', 'Koforidua', 'Wa', 'Bolgatanga', 'Techiman', 'Nkawkaw',
            'Tema', 'Ashaiman', 'Madina', 'Dansoman', 'East Legon', 'Osu'
        ];

        $ghanaianRegions = [
            'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 
            'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
            'Ahafo', 'Bono', 'Bono East', 'Oti', 'North East', 'Savannah'
        ];

        $city = $this->faker->randomElement($ghanaianCities);
        $region = $this->faker->randomElement($ghanaianRegions);

        // Generate Ghanaian-style contact numbers
        $contactNumber = $this->generateGhanaianPhoneNumber();

        // Generate email from university domain
        $emailDomain = $this->generateUniversityDomain($name);
        $email = 'info@' . $emailDomain;

        return [
            'university_id' => Str::uuid(),
            'name' => $name,
            'code' => $code,
            'address' => $this->faker->streetAddress() . ', ' . $city,
            'city' => $city,
            'state' => $region,
            'country' => 'Ghana',
            'postal_code' => 'GA' . $this->faker->numberBetween(100, 999),
            'contact_number' => $contactNumber,
            'email' => $email,
            'website' => 'https://www.' . $emailDomain,
            'established_date' => $this->faker->dateTimeBetween('-70 years', '-10 years')->format('Y-m-d'),
            'logo_url' => $this->faker->imageUrl(200, 200, 'university', true, $name),
            'settings' => json_encode([
                'timezone' => 'Africa/Accra',
                'language' => 'en',
                'academic_year_start' => 'August',
                'academic_year_end' => 'July',
                'max_students_per_department' => $this->faker->numberBetween(100, 2000),
                'allow_student_registration' => $this->faker->boolean(80),
                'auto_approve_courses' => $this->faker->boolean(60),
                'ghananian_education_system' => true,
                'natioanal_accreditation_board' => true,
            ]),
            'is_active' => true, // Most Ghanaian universities are active
            'created_at' => $this->faker->dateTimeBetween('-10 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Generate Ghanaian university code
     */
    private function generateGhanaianUniversityCode(string $name): string
    {
        $abbreviations = [
            'University of Ghana' => 'UG',
            'Kwame Nkrumah University of Science and Technology' => 'KNUST',
            'University of Cape Coast' => 'UCC',
            'University of Education, Winneba' => 'UEW',
            'University of Professional Studies' => 'UPSA',
            'Ghana Institute of Management and Public Administration' => 'GIMPA',
            'University of Health and Allied Sciences' => 'UHAS',
            'University for Development Studies' => 'UDS',
            'University of Mines and Technology' => 'UMaT',
            'Ghana Communication Technology University' => 'GCTU',
            'Koforidua Technical University' => 'KTU',
            'Takoradi Technical University' => 'TTU',
            'Kumasi Technical University' => 'KsTU',
            'Accra Technical University' => 'ATU',
            'Ho Technical University' => 'HTU',
            'Sunyani Technical University' => 'STU',
            'Tamale Technical University' => 'TaTU',
            'Cape Coast Technical University' => 'CCTU',
            'Bolgatanga Technical University' => 'BTU',
            'Wa Technical University' => 'WTU'
        ];

        return $abbreviations[$name] ?? Str::upper(Str::substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 6));
    }

    /**
     * Generate Ghanaian phone number
     */
    private function generateGhanaianPhoneNumber(): string
    {
        $prefixes = ['020', '024', '025', '026', '027', '028', '029', '030', '050', '054', '055', '056', '057'];
        $prefix = $this->faker->randomElement($prefixes);
        $number = $this->faker->numberBetween(1000000, 9999999);
        
        return '+233 ' . $prefix . ' ' . chunk_split($number, 3, ' ');
    }

    /**
     * Generate university domain
     */
    private function generateUniversityDomain(string $name): string
    {
        $domains = [
            'University of Ghana' => 'ug.edu.gh',
            'Kwame Nkrumah University of Science and Technology' => 'knust.edu.gh',
            'University of Cape Coast' => 'ucc.edu.gh',
            'University of Education, Winneba' => 'uew.edu.gh',
            'University of Professional Studies' => 'upsa.edu.gh',
            'Ghana Institute of Management and Public Administration' => 'gimpa.edu.gh',
            'University of Health and Allied Sciences' => 'uhas.edu.gh',
            'University for Development Studies' => 'uds.edu.gh',
            'University of Mines and Technology' => 'umat.edu.gh',
            'Ghana Communication Technology University' => 'gctu.edu.gh',
            'Koforidua Technical University' => 'ktu.edu.gh',
            'Takoradi Technical University' => 'ttu.edu.gh',
            'Kumasi Technical University' => 'kstu.edu.gh',
            'Accra Technical University' => 'atu.edu.gh',
            'Ho Technical University' => 'htu.edu.gh',
            'Sunyani Technical University' => 'stu.edu.gh',
            'Tamale Technical University' => 'tatu.edu.gh',
            'Cape Coast Technical University' => 'cctu.edu.gh',
            'Bolgatanga Technical University' => 'btu.edu.gh',
            'Wa Technical University' => 'wtu.edu.gh'
        ];

        return $domains[$name] ?? Str::slug(Str::words($name, 2, '')) . '.edu.gh';
    }

    /**
     * Indicate that the university is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the university is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate a public university
     */
    public function public(): static
    {
        $publicUniversities = [
            'University of Ghana',
            'Kwame Nkrumah University of Science and Technology',
            'University of Cape Coast',
            'University of Education, Winneba',
            'University of Health and Allied Sciences',
            'University for Development Studies',
            'University of Mines and Technology'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($publicUniversities),
            'settings' => json_encode([
                'timezone' => 'Africa/Accra',
                'language' => 'en',
                'academic_year_start' => 'August',
                'academic_year_end' => 'July',
                'government_funded' => true,
                'tuition_fees' => 'subsidized',
            ]),
        ]);
    }

    /**
     * Indicate a technical university
     */
    public function technical(): static
    {
        $techUniversities = [
            'Koforidua Technical University',
            'Takoradi Technical University',
            'Kumasi Technical University',
            'Accra Technical University',
            'Ho Technical University',
            'Sunyani Technical University',
            'Tamale Technical University',
            'Cape Coast Technical University',
            'Bolgatanga Technical University',
            'Wa Technical University'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($techUniversities),
            'settings' => json_encode([
                'timezone' => 'Africa/Accra',
                'language' => 'en',
                'academic_focus' => 'technical_education',
                'practical_training' => true,
                'industrial_attachment' => true,
            ]),
        ]);
    }

    /**
     * Indicate a university in a specific Ghanaian region
     */
    public function region(string $region): static
    {
        $regionCities = [
            'Greater Accra' => ['Accra', 'Tema', 'Madina', 'Dansoman'],
            'Ashanti' => ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong'],
            'Western' => ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim'],
            'Central' => ['Cape Coast', 'Winneba', 'Elmina', 'Saltpond'],
            'Eastern' => ['Koforidua', 'Nsawam', 'Suhum', 'Akosombo'],
            'Northern' => ['Tamale', 'Yendi', 'Savelugu', 'Walewale'],
            'Volta' => ['Ho', 'Hohoe', 'Keta', 'Aflao'],
            'Upper East' => ['Bolgatanga', 'Navrongo', 'Bawku'],
            'Upper West' => ['Wa', 'Tumu', 'Lawra'],
            'Bono' => ['Sunyani', 'Berekum', 'Dormaa'],
        ];

        $city = $regionCities[$region] ? $this->faker->randomElement($regionCities[$region]) : $this->faker->city();

        return $this->state(fn (array $attributes) => [
            'state' => $region,
            'city' => $city,
        ]);
    }

    /**
     * Indicate an ancient Ghanaian university (established before 2000)
     */
    public function ancient(): static
    {
        $oldUniversities = [
            'University of Ghana',
            'Kwame Nkrumah University of Science and Technology',
            'University of Cape Coast',
            'University of Education, Winneba'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($oldUniversities),
            'established_date' => $this->faker->dateTimeBetween('-70 years', '-23 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Indicate a modern Ghanaian university (established after 2000)
     */
    public function modern(): static
    {
        $newUniversities = [
            'University of Health and Allied Sciences',
            'University for Development Studies',
            'University of Professional Studies',
            'Ghana Communication Technology University'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($newUniversities),
            'established_date' => $this->faker->dateTimeBetween('-22 years', '-5 years')->format('Y-m-d'),
        ]);
    }
}