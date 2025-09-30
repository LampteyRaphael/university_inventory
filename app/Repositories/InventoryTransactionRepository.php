<?php

namespace App\Repositories;

use App\Models\InventoryTransaction;

class InventoryTransactionRepository
{

 public function getAllTransactions($filters = [], $perPage = 500)
{
    $query = InventoryTransaction::with([
        'university:university_id,name',
        'item:item_id,item_code,name,unit_of_measure',
        'department:department_id,name',
        'sourceLocation:location_id,name',
        'destinationLocation:location_id,name',
        'performedBy:user_id,name,email',
        'approvedBy:user_id,name,email'
    ])->select([
        'transaction_id',
        'university_id',
        'item_id',
        'department_id',
        'transaction_type',
        'quantity',
        'unit_cost',
        'total_value',
        'transaction_date',
        'reference_number',
        'reference_id',
        'batch_number',
        'expiry_date',
        'source_location_id',
        'destination_location_id',
        'status',
        'performed_by',
        'approved_by',
        'created_at',
        'updated_at'
        // Exclude 'notes' for list view to improve performance
    ]);

    // Clean filters
    $cleanedFilters = array_filter($filters, function($value) {
        return $value !== '' && $value !== null && $value !== 'null' && $value !== 'undefined';
    });

    // Apply filters
    if (!empty($cleanedFilters['university_id'])) {
        $query->where('university_id', $cleanedFilters['university_id']);
    }

    if (!empty($cleanedFilters['item_id'])) {
        $query->where('item_id', $cleanedFilters['item_id']);
    }

    if (!empty($cleanedFilters['department_id'])) {
        $query->where('department_id', $cleanedFilters['department_id']);
    }

    if (!empty($cleanedFilters['transaction_type'])) {
        $query->where('transaction_type', $cleanedFilters['transaction_type']);
    }

    if (!empty($cleanedFilters['status'])) {
        $query->where('status', $cleanedFilters['status']);
    }

    if (!empty($cleanedFilters['reference_number'])) {
        $query->where('reference_number', 'like', "%{$cleanedFilters['reference_number']}%");
    }

    if (!empty($cleanedFilters['batch_number'])) {
        $query->where('batch_number', 'like', "%{$cleanedFilters['batch_number']}%");
    }

    if (!empty($cleanedFilters['performed_by'])) {
        $query->where('performed_by', $cleanedFilters['performed_by']);
    }

    // Date range filters
    if (!empty($cleanedFilters['start_date'])) {
        $query->whereDate('transaction_date', '>=', $cleanedFilters['start_date']);
    }

    if (!empty($cleanedFilters['end_date'])) {
        $query->whereDate('transaction_date', '<=', $cleanedFilters['end_date']);
    }

    // Search across multiple fields
    if (!empty($cleanedFilters['search'])) {
        $search = trim($cleanedFilters['search']);
        $query->where(function($q) use ($search) {
            $q->where('reference_number', 'like', "%{$search}%")
              ->orWhere('batch_number', 'like', "%{$search}%")
              ->orWhereHas('item', function($itemQuery) use ($search) {
                  $itemQuery->where('name', 'like', "%{$search}%")
                           ->orWhere('item_code', 'like', "%{$search}%");
              });
        });
    }

    // Quantity filters
    if (isset($cleanedFilters['min_quantity'])) {
        $query->where('quantity', '>=', (int)$cleanedFilters['min_quantity']);
    }

    if (isset($cleanedFilters['max_quantity'])) {
        $query->where('quantity', '<=', (int)$cleanedFilters['max_quantity']);
    }

    // Value filters
    if (isset($cleanedFilters['min_value'])) {
        $query->where('total_value', '>=', (float)$cleanedFilters['min_value']);
    }

    if (isset($cleanedFilters['max_value'])) {
        $query->where('total_value', '<=', (float)$cleanedFilters['max_value']);
    }

    // Order by with validation
    $allowedOrderColumns = [
        'transaction_date', 'created_at', 'quantity', 'total_value', 
        'reference_number', 'batch_number'
    ];
    
    $orderBy = in_array($cleanedFilters['order_by'] ?? '', $allowedOrderColumns) 
        ? $cleanedFilters['order_by'] 
        : 'transaction_date';
        
    $orderDirection = in_array(strtolower($cleanedFilters['order_direction'] ?? ''), ['asc', 'desc']) 
        ? $cleanedFilters['order_direction'] 
        : 'desc';

    $query->orderBy($orderBy, $orderDirection);

    return $query->paginate($perPage);
}

}