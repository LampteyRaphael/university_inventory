<?php

namespace App\Contracts;

use App\Models\User;

interface HasRoles
{
    public function isSuperAdmin();
    public function isInventoryManager();
    public function isDepartmentHead();
    public function isProcurementOfficer();
    public function isFaculty();
    public function isStaff();
    public function isStudent();
    public function isAdmin();
    public function canAccessInventory();
    public function canAccessPurchaseOrders();
    
    // Use mixed types or no return types to match your implementation
    public function hasRole($roleName);
    public function hasAnyRole(array $roles);
    public function hasPermission($permissionName);
    public function hasAnyPermission(array $permissions);
    public function canPerform($module, $action);
    public function getRoleName();
    public function getRoleSlug();
    public function getRoleLevel();
    public function hasHigherRoleThan($level);
    public function canManageUser(User $otherUser);
}