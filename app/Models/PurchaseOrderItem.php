<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasFactory,Auditable;
   
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'order_item_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_item_id',
        'order_id',
        'item_id',
        'quantity_ordered',
        'quantity_received',
        'quantity_cancelled',
        'unit_price',
        'tax_rate',
        'discount_rate',
        'line_total',
        'expected_delivery_date',
        'actual_delivery_date',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_received' => 'integer',
        'quantity_cancelled' => 'integer',
        'unit_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'line_total' => 'decimal:2',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'quantity_received' => 0,
        'quantity_cancelled' => 0,
        'tax_rate' => 0,
        'discount_rate' => 0,
        'status' => 'ordered',
    ];

    /**
     * Status constants
     */
    const STATUS_ORDERED = 'ordered';
    const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    const STATUS_RECEIVED = 'received';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the status options with labels
     *
     * @return array
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_ORDERED => 'Ordered',
            self::STATUS_PARTIALLY_RECEIVED => 'Partially Received',
            self::STATUS_RECEIVED => 'Received',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
    }

    /**
     * Get the label for the status
     *
     * @return string
     */
    public function getStatusLabelAttribute(): string
    {
        return self::getStatusOptions()[$this->status] ?? $this->status;
    }

    /**
     * Get the CSS class for the status badge
     *
     * @return string
     */
    public function getStatusClassAttribute(): string
    {
        $classes = [
            self::STATUS_ORDERED => 'badge bg-secondary',
            self::STATUS_PARTIALLY_RECEIVED => 'badge bg-warning',
            self::STATUS_RECEIVED => 'badge bg-success',
            self::STATUS_CANCELLED => 'badge bg-danger',
        ];

        return $classes[$this->status] ?? 'badge bg-secondary';
    }

    /**
     * Calculate the quantity pending (ordered - received - cancelled)
     *
     * @return int
     */
    public function getQuantityPendingAttribute(): int
    {
        return $this->quantity_ordered - $this->quantity_received - $this->quantity_cancelled;
    }

    /**
     * Calculate the completion percentage
     *
     * @return float
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->quantity_ordered <= 0) {
            return 0;
        }

        $completed = $this->quantity_received + $this->quantity_cancelled;
        return ($completed / $this->quantity_ordered) * 100;
    }

    /**
     * Check if the item is fully received
     *
     * @return bool
     */
    public function isFullyReceived(): bool
    {
        return $this->quantity_received >= $this->quantity_ordered;
    }

    /**
     * Check if the item is partially received
     *
     * @return bool
     */
    public function isPartiallyReceived(): bool
    {
        return $this->quantity_received > 0 && $this->quantity_received < $this->quantity_ordered;
    }

    /**
     * Check if the item is pending (not received or cancelled)
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->quantity_received === 0 && $this->quantity_cancelled === 0;
    }

    /**
     * Check if the item is cancelled
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->quantity_cancelled > 0;
    }

    /**
     * Check if the item is overdue (expected delivery date passed but not fully received)
     *
     * @return bool
     */
    public function isOverdue(): bool
    {
        if (!$this->expected_delivery_date || $this->isFullyReceived() || $this->isCancelled()) {
            return false;
        }

        return now()->greaterThan($this->expected_delivery_date);
    }

    /**
     * Calculate the net unit price (after discount and before tax)
     *
     * @return float
     */
    public function getNetUnitPriceAttribute(): float
    {
        return $this->unit_price * (1 - ($this->discount_rate / 100));
    }

    /**
     * Calculate the tax amount for this line item
     *
     * @return float
     */
    public function getTaxAmountAttribute(): float
    {
        $netTotal = $this->quantity_ordered * $this->net_unit_price;
        return $netTotal * ($this->tax_rate / 100);
    }

    /**
     * Calculate the total amount including tax
     *
     * @return float
     */
    public function getTotalAmountAttribute(): float
    {
        return $this->line_total + $this->tax_amount;
    }

    /**
     * Receive a quantity of this item
     *
     * @param  int  $quantity
     * @param  string|null  $notes
     * @return bool
     */
    public function receiveQuantity(int $quantity, ?string $notes = null): bool
    {
        $availableToReceive = $this->quantity_ordered - $this->quantity_received - $this->quantity_cancelled;
        
        if ($quantity <= 0 || $quantity > $availableToReceive) {
            return false;
        }

        $this->quantity_received += $quantity;
        
        // Update status based on new quantities
        if ($this->quantity_received >= $this->quantity_ordered) {
            $this->status = self::STATUS_RECEIVED;
            $this->actual_delivery_date = now();
        } elseif ($this->quantity_received > 0) {
            $this->status = self::STATUS_PARTIALLY_RECEIVED;
        }

        if ($notes) {
            $this->notes = ($this->notes ? $this->notes . "\n" : '') . 
                          now()->format('Y-m-d H:i') . ": Received {$quantity} units. " . $notes;
        }

        return $this->save();
    }

    /**
     * Cancel a quantity of this item
     *
     * @param  int  $quantity
     * @param  string|null  $notes
     * @return bool
     */
    public function cancelQuantity(int $quantity, ?string $notes = null): bool
    {
        $availableToCancel = $this->quantity_ordered - $this->quantity_received - $this->quantity_cancelled;
        
        if ($quantity <= 0 || $quantity > $availableToCancel) {
            return false;
        }

        $this->quantity_cancelled += $quantity;
        
        // Update status if all items are cancelled
        if ($this->quantity_cancelled >= $this->quantity_ordered) {
            $this->status = self::STATUS_CANCELLED;
        }

        if ($notes) {
            $this->notes = ($this->notes ? $this->notes . "\n" : '') . 
                          now()->format('Y-m-d H:i') . ": Cancelled {$quantity} units. " . $notes;
        }

        return $this->save();
    }

    /**
     * Calculate and update the line total
     *
     * @return bool
     */
    public function updateLineTotal(): bool
    {
        $netUnitPrice = $this->unit_price * (1 - ($this->discount_rate / 100));
        $this->line_total = $this->quantity_ordered * $netUnitPrice;
        
        return $this->save();
    }

    /**
     * Scope a query to only include items with a specific status.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include ordered items.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOrdered($query)
    {
        return $query->withStatus(self::STATUS_ORDERED);
    }

    /**
     * Scope a query to only include partially received items.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePartiallyReceived($query)
    {
        return $query->withStatus(self::STATUS_PARTIALLY_RECEIVED);
    }

    /**
     * Scope a query to only include received items.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReceived($query)
    {
        return $query->withStatus(self::STATUS_RECEIVED);
    }

     public function order()
    {
        return $this->belongsTo(PurchaseOrder::class, 'order_id', 'order_id');
    }
    
    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id', 'item_id');
    }

    /**
     * Scope a query to only include cancelled items.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCancelled($query)
    {
        return $query->withStatus(self::STATUS_CANCELLED);
    }

    /**
     * Scope a query to only include overdue items.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
                    ->where(function ($q) {
                        $q->where('status', self::STATUS_ORDERED)
                          ->orWhere('status', self::STATUS_PARTIALLY_RECEIVED);
                    });
    }

    /**
     * Scope a query to only include items pending receipt.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePendingReceipt($query)
    {
        return $query->where(function ($q) {
            $q->where('status', self::STATUS_ORDERED)
              ->orWhere('status', self::STATUS_PARTIALLY_RECEIVED);
        });
    }

    /**
     * Get the purchase order that owns the order item.
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'order_id', 'order_id');
    }

    
    /**
     * Get the inventory item that owns the order item.
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id', 'item_id');
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($orderItem) {
            // Generate UUID if not provided
            if (empty($orderItem->order_item_id)) {
                $orderItem->order_item_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Calculate line total if not provided
            if (empty($orderItem->line_total)) {
                $netUnitPrice = $orderItem->unit_price * (1 - ($orderItem->discount_rate / 100));
                $orderItem->line_total = $orderItem->quantity_ordered * $netUnitPrice;
            }
        });

        static::updating(function ($orderItem) {
            // Recalculate line total if unit price, discount rate, or quantity changes
            if ($orderItem->isDirty(['unit_price', 'discount_rate', 'quantity_ordered'])) {
                $netUnitPrice = $orderItem->unit_price * (1 - ($orderItem->discount_rate / 100));
                $orderItem->line_total = $orderItem->quantity_ordered * $netUnitPrice;
            }

            // Update status based on quantity changes
            if ($orderItem->isDirty(['quantity_received', 'quantity_cancelled'])) {
                $totalProcessed = $orderItem->quantity_received + $orderItem->quantity_cancelled;
                
                if ($totalProcessed >= $orderItem->quantity_ordered) {
                    if ($orderItem->quantity_cancelled >= $orderItem->quantity_ordered) {
                        $orderItem->status = self::STATUS_CANCELLED;
                    } else {
                        $orderItem->status = self::STATUS_RECEIVED;
                        if (empty($orderItem->actual_delivery_date)) {
                            $orderItem->actual_delivery_date = now();
                        }
                    }
                } elseif ($orderItem->quantity_received > 0) {
                    $orderItem->status = self::STATUS_PARTIALLY_RECEIVED;
                } else {
                    $orderItem->status = self::STATUS_ORDERED;
                }
            }
        });
    }
}