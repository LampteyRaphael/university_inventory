<?php

namespace App\Repositories;

use App\Models\InventoryTransaction;

class InventoryTransactionRepository
{

 public function getAllTransactions()
{
    $query = InventoryTransaction::with([
        'university:university_id,name',
        'item:item_id,item_code,name,unit_of_measure',
        'department:department_id,name',
        'sourceLocation:location_id,name',
        'destinationLocation:location_id,name',
        'performedBy:user_id,name,email',
        'approvedBy:user_id,name,email'
    ])->get()->map(function ($transaction){

        return [
            'transaction_id'=>$transaction->transaction_id,
            'university_id'=>$transaction->university_id,
            'item_id'=>$transaction->item_id,
            'item'=>$transaction->item?$transaction->item->name:null,
            'department_id'=>$transaction->department_id,
            'department'=>$transaction->department->name??null,
            'transaction_type'=>$transaction->transaction_type,
            'quantity'=>$transaction->quantity,
            'unit_cost'=>$transaction->unit_cost,
            'total_value'=>$transaction->total_value,
            'transaction_date'=>$transaction->transaction_date,
            'reference_number'=>$transaction->reference_number,
            'reference_id'=>$transaction->reference_id,
            'batch_number'=>$transaction->batch_number,
            'expiry_date'=>$transaction->expiry_date,
            'source_location_id'=>$transaction->source_location_id,
            'sourceLocation'=>$transaction->sourceLocation->name??null,
            'destination_location_id'=>$transaction->destination_location_id,
            'destinationLocation'=>$transaction->destinationLocation->name??null,
            'status'=>$transaction->status,
            'performedBy'=>$transaction->performedBy->name??'',
            'approvedBy'=>$transaction->approvedBy->name??'',
            'created_at'=>$transaction->created_at,
            'updated_at'=>$transaction->updated_at,
        ];

    });

    return $query;
}

}