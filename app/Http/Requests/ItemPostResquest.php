<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ItemPostResquest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
                'university_id' => 'required|uuid|exists:universities,university_id',
                'category_id' => 'required|uuid|exists:item_categories,category_id',
                'item_code' => 'required|string|max:50|unique:inventory_items,item_code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'specifications' => 'nullable|array',
                'unit_of_measure' => 'required|string|max:50',
                'unit_cost' => 'required|numeric|min:0',
                'current_value' => 'nullable|numeric|min:0',
                'minimum_stock_level' => 'required|integer|min:0',
                'maximum_stock_level' => 'nullable|integer|min:0',
                'reorder_point' => 'required|integer|min:0',
                'economic_order_quantity' => 'nullable|integer|min:0',
                'abc_classification' => 'required|in:A,B,C',
                'weight_kg' => 'nullable|numeric|min:0',
                'volume_cubic_m' => 'nullable|numeric|min:0',
                'is_hazardous' => 'boolean',
                'hazard_type' => 'nullable|string|max:100',
                'handling_instructions' => 'nullable|string',
                'storage_conditions' => 'nullable|string|max:255',
                'shelf_life_days' => 'nullable|integer|min:0',
                'expiry_date' => 'nullable|date',
                'barcode' => 'nullable|string|max:255|unique:inventory_items,barcode',
                'qr_code' => 'nullable|string|max:255|unique:inventory_items,qr_code',
                'rfid_tag' => 'nullable|string|max:255|unique:inventory_items,rfid_tag',
                'image_url' => 'nullable|url|max:500',
                'document_url' => 'nullable|url|max:500',
                // 'created_by' => 'required|uuid|exists:users,user_id',
        ];
    }
}
