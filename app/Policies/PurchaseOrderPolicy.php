<?php

namespace App\Policies;

use App\Models\User;
use App\Models\PurchaseOrder;

class PurchaseOrderPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('purchase_orders.view');
    }

    public function view(User $user, PurchaseOrder $purchaseOrder)
    {
        return $user->hasPermissionTo('purchase_orders.view');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('purchase_orders.create');
    }

    public function update(User $user, PurchaseOrder $purchaseOrder)
    {
        return $user->hasPermissionTo('purchase_orders.edit');
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder)
    {
        return $user->hasPermissionTo('purchase_orders.delete');
    }
}