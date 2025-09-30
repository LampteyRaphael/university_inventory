<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

class InventoryTransaction extends Model
{
    use HasFactory, Auditable;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'transaction_id';

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
        'notes',
        'source_location_id',
        'destination_location_id',
        'status',
        'performed_by',
        'approved_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transaction_date' => 'datetime',
        'expiry_date' => 'date',
        'unit_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'completed',
        'unit_cost' => 0,
        'total_value' => 0,
    ];

    /**
     * Transaction types constants
     */
    const TYPE_PURCHASE = 'purchase';
    const TYPE_SALE = 'sale';
    const TYPE_TRANSFER = 'transfer';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_RETURN = 'return';
    const TYPE_WRITE_OFF = 'write_off';
    const TYPE_CONSUMPTION = 'consumption';
    const TYPE_PRODUCTION = 'production';
    const TYPE_DONATION = 'donation';

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REVERSED = 'reversed';

    /**
     * Get the transaction types with labels
     *
     * @return array
     */
    public static function getTransactionTypes(): array
    {
        return [
            self::TYPE_PURCHASE => 'Purchase',
            self::TYPE_SALE => 'Sale',
            self::TYPE_TRANSFER => 'Transfer',
            self::TYPE_ADJUSTMENT => 'Adjustment',
            self::TYPE_RETURN => 'Return',
            self::TYPE_WRITE_OFF => 'Write Off',
            self::TYPE_CONSUMPTION => 'Consumption',
            self::TYPE_PRODUCTION => 'Production',
            self::TYPE_DONATION => 'Donation',
        ];
    }

    /**
     * Get the status options with labels
     *
     * @return array
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REVERSED => 'Reversed',
        ];
    }

    /**
     * Get the label for the transaction type
     *
     * @return string
     */
    public function getTransactionTypeLabelAttribute(): string
    {
        return self::getTransactionTypes()[$this->transaction_type] ?? $this->transaction_type;
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
            self::STATUS_PENDING => 'badge bg-warning',
            self::STATUS_COMPLETED => 'badge bg-success',
            self::STATUS_CANCELLED => 'badge bg-danger',
            self::STATUS_REVERSED => 'badge bg-info',
        ];

        return $classes[$this->status] ?? 'badge bg-secondary';
    }

    /**
     * Scope a query to only include transactions of a given type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope a query to only include transactions with a given status.
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
     * Scope a query to only include transactions for a specific item.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $itemId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForItem($query, $itemId)
    {
        return $query->where('item_id', $itemId);
    }

    /**
     * Scope a query to only include transactions for a specific department.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $departmentId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to only include transactions within a date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Calculate the total value based on quantity and unit cost
     *
     * @return float
     */
    public function calculateTotalValue(): float
    {
        return $this->quantity * $this->unit_cost;
    }

    /**
     * Check if the transaction is pending
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the transaction is completed
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the transaction is cancelled
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the transaction is reversed
     *
     * @return bool
     */
    public function isReversed(): bool
    {
        return $this->status === self::STATUS_REVERSED;
    }

    /**
     * Check if the transaction affects inventory positively (adds stock)
     *
     * @return bool
     */
    public function isInventoryIncrement(): bool
    {
        return in_array($this->transaction_type, [
            self::TYPE_PURCHASE,
            self::TYPE_RETURN,
            self::TYPE_PRODUCTION,
            self::TYPE_DONATION,
            self::TYPE_ADJUSTMENT // if positive adjustment
        ]);
    }

    /**
     * Check if the transaction affects inventory negatively (removes stock)
     *
     * @return bool
     */
    public function isInventoryDecrement(): bool
    {
        return in_array($this->transaction_type, [
            self::TYPE_SALE,
            self::TYPE_CONSUMPTION,
            self::TYPE_WRITE_OFF,
            self::TYPE_ADJUSTMENT // if negative adjustment
        ]);
    }


    // call to the backend
    protected $with = ['performedBy','approvedBy','sourceLocation','department','item'];

    /**
     * Get the university that owns the inventory transaction.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the inventory item that owns the inventory transaction.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id', 'item_id');
    }

    /**
     * Get the department that owns the inventory transaction.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }


    /**
     * Get the source location for the transaction.
     */
    public function sourceLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'source_location_id', 'location_id');
    }

    /**
     * Get the destination location for the transaction.
     */
    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id', 'location_id');
    }

    /**
     * Get the user who performed the transaction.
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by', 'id');
    }

    /**
     * Get the user who approved the transaction.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    /**
     * Get the reference model based on transaction type.
     */
    public function reference()
    {
        switch ($this->transaction_type) {
            case self::TYPE_PURCHASE:
                return $this->belongsTo(PurchaseOrder::class, 'reference_id', 'id');
            case self::TYPE_SALE:
                return $this->belongsTo(SalesOrder::class, 'reference_id', 'id');
            case self::TYPE_TRANSFER:
                return $this->belongsTo(TransferOrder::class, 'reference_id', 'id');
            default:
                return null;
        }
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($transaction) {
            // Generate UUID if not provided
            if (empty($transaction->transaction_id)) {
                $transaction->transaction_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Set performed_by to current user if not provided
            if (empty($transaction->performed_by) && Auth::check()) {
                $transaction->performed_by = Auth::id();
            }

            // Calculate total value if not provided
            if (empty($transaction->total_value) && !empty($transaction->quantity) && !empty($transaction->unit_cost)) {
                $transaction->total_value = $transaction->quantity * $transaction->unit_cost;
            }
        });

        static::updating(function ($transaction) {
            // Recalculate total value if quantity or unit cost changes
            if ($transaction->isDirty(['quantity', 'unit_cost'])) {
                $transaction->total_value = $transaction->quantity * $transaction->unit_cost;
            }
        });
    }
}