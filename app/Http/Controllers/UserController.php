<?php

namespace App\Http\Controllers;

use App\Mail\UserCreatedNotification;
use App\Models\User;
use App\Models\University;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['university', 'department', 'roles', 'permissions'])
            ->get()
            ->map(function ($user) {
                return [
                    'user_id' => $user->user_id,
                    'university_id' => $user->university_id,
                    'department_id' => $user->department_id,
                    'employee_id' => $user->employee_id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'position' => $user->position,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at,
                    'university' => $user->university,
                    'department' => $user->department,
                    'roles' => $user->roles->map(function($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'guard_name' => $role->guard_name,
                        ];
                    }),
                    'permissions' => $user->getAllPermissions()->map(function($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'guard_name' => $permission->guard_name,
                        ];
                    }),
                ];
            });

        return Inertia::render('Management/Management', [
            'users' => $users,
            'universities' => University::select('university_id','name')->get(),
            'departments' => Department::select('department_id','name')->get(),
        ]);
    }


public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,university_id',
            'department_id' => 'nullable|exists:departments,department_id',
            'employee_id' => 'nullable|string|max:50|unique:users,employee_id',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'password' => 'required|confirmed|min:8',
        ]);

        DB::beginTransaction();

        // Generate name from first and last name
        $generatedName = trim($validated['first_name'] . ' ' . ($validated['last_name'] ?? ''));
        
        // Check if the generated name already exists
        $existingUser = User::where('name', $generatedName)->first();
        if ($existingUser) {
            return redirect()->back()
                ->withInput()
                ->with('error', "The name '$generatedName' already exists. Please use a different first name or last name combination.");
        }

        $validated['name'] = $generatedName;
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        
        // Assign default role using Spatie's role name (not ID)
        $user->assignRole('Staff'); // Use role name directly

        Log::info('Assigned role to new user', [
            'user_id' => $user->user_id,
            'role' => 'Staff'
        ]);

        // Send email notification to the user
        $this->sendUserCreationNotification($user, $request->password);

        DB::commit();
        
        return redirect()->back()->with('success', 'User created successfully and login credentials have been sent via email.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput()
            ->with('error', 'Please fix the validation errors below.');
                
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('User creation failed: ' . $e->getMessage(), [
            'request_data' => $request->all(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->back()
            ->withInput()
            ->with('error', 'Failed to create user: ' . $e->getMessage());
    }
}


/**
 * Send email notification to user with login credentials
 */
private function sendUserCreationNotification(User $user, string $plainPassword)
{
    try {
        // Get the university name
        $universityName = $user->university->name ?? 'Your Organization';
        
        // Send email using Mailable class
        Mail::send(new UserCreatedNotification($user, $plainPassword, $universityName));

        Log::info('User creation email sent successfully', [
            'user_id' => $user->user_id,
            'email' => $user->email
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to send user creation email: ' . $e->getMessage(), [
            'user_id' => $user->user_id,
            'email' => $user->email
        ]);
        
        // Don't throw the error to prevent user creation from failing
        // Just log it and continue
    }
}

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,university_id',
            'department_id' => 'nullable|exists:departments,department_id',
            'employee_id' => 'nullable|string|max:50|unique:users,employee_id,' . $user->user_id . ',user_id',
            'username' => 'nullable|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
            'email' => 'required|email|unique:users,email,' . $user->user_id . ',user_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Update name from first and last name
        $validated['name'] = trim($validated['first_name'] . ' ' . ($validated['last_name'] ?? ''));

        $user->update($validated);
        
        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->user_id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();
        
        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->user_id === Auth::user()->user_id) {
            return redirect()->back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => !$user->is_active]);
        
        return redirect()->back()->with(
            'success', 
            'User ' . ($user->is_active ? 'activated' : 'deactivated') . ' successfully.'
        );
    }
}