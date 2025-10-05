<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes,Auditable;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'order_id';

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
    protected $table = "purchase_orders";
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'university_id',
        'supplier_id',
        'department_id',
        'po_number',
        'order_type',
        'order_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'subtotal_amount',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'exchange_rate',
        'status',
        'payment_status',
        'notes',
        'terms_and_conditions',
        'requested_by',
        'approved_by',
        'approved_at',
        'received_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'subtotal_amount' => 0,
        'tax_amount' => 0,
        'shipping_amount' => 0,
        'discount_amount' => 0,
        'total_amount' => 0,
        'currency' => 'GHS',
        'exchange_rate' => 1,
        'status' => 'draft',
        'payment_status' => 'pending',
    ];

    /**
     * Order type constants
     */
    const TYPE_REGULAR = 'regular';
    const TYPE_EMERGENCY = 'emergency';
    const TYPE_CAPITAL = 'capital';
    const TYPE_CONSUMABLE = 'consumable';
    const TYPE_SERVICE = 'service';

    /**
     * Status constants
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_APPROVED = 'approved';
    const STATUS_ORDERED = 'ordered';
    const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    const STATUS_RECEIVED = 'received';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_CLOSED = 'closed';

    /**
     * Payment status constants
     */
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PARTIAL = 'partial';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_OVERDUE = 'overdue';

    /**
     * Currency constants
     */
    const CURRENCY_USD = 'USD';
    const CURRENCY_EUR = 'EUR';
    const CURRENCY_GBP = 'GBP';
    const CURRENCY_JPY = 'JPY';
    const CURRENCY_CAD = 'CAD';
    const CURRENCY_AUD = 'AUD';
    const CURRENCY_GHS = 'GHS';

    /**
     * Get the order types with labels
     *
     * @return array
     */
    public static function getOrderTypes(): array
    {
        return [
            self::TYPE_REGULAR => 'Regular Order',
            self::TYPE_EMERGENCY => 'Emergency Order',
            self::TYPE_CAPITAL => 'Capital Equipment',
            self::TYPE_CONSUMABLE => 'Consumables',
            self::TYPE_SERVICE => 'Services',
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
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Submitted',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_ORDERED => 'Ordered',
            self::STATUS_PARTIALLY_RECEIVED => 'Partially Received',
            self::STATUS_RECEIVED => 'Received',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_CLOSED => 'Closed',
        ];
    }

    /**
     * Get the payment status options with labels
     *
     * @return array
     */
    public static function getPaymentStatusOptions(): array
    {
        return [
            self::PAYMENT_PENDING => 'Pending',
            self::PAYMENT_PARTIAL => 'Partial Payment',
            self::PAYMENT_PAID => 'Paid',
            self::PAYMENT_OVERDUE => 'Overdue',
        ];
    }

    /**
     * Get the currency options with labels
     *
     * @return array
     */
    public static function getCurrencyOptions(): array
    {
        return [
            self::CURRENCY_USD => 'US Dollar (USD)',
            self::CURRENCY_EUR => 'Euro (EUR)',
            self::CURRENCY_GBP => 'British Pound (GBP)',
            self::CURRENCY_JPY => 'Japanese Yen (JPY)',
            self::CURRENCY_CAD => 'Canadian Dollar (CAD)',
            self::CURRENCY_AUD => 'Australian Dollar (AUD)',
            self::CURRENCY_GHS => 'Ghanaian Cedis GHS (₵)',
        ];
    }

    /**
     * Get the label for the order type
     *
     * @return string
     */
    public function getOrderTypeLabelAttribute(): string
    {
        return self::getOrderTypes()[$this->order_type] ?? $this->order_type;
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
     * Get the label for the payment status
     *
     * @return string
     */
    public function getPaymentStatusLabelAttribute(): string
    {
        return self::getPaymentStatusOptions()[$this->payment_status] ?? $this->payment_status;
    }

    /**
     * Get the CSS class for the status badge
     *
     * @return string
     */
    public function getStatusClassAttribute(): string
    {
        $classes = [
            self::STATUS_DRAFT => 'badge bg-secondary',
            self::STATUS_SUBMITTED => 'badge bg-info',
            self::STATUS_APPROVED => 'badge bg-primary',
            self::STATUS_ORDERED => 'badge bg-warning',
            self::STATUS_PARTIALLY_RECEIVED => 'badge bg-warning',
            self::STATUS_RECEIVED => 'badge bg-success',
            self::STATUS_CANCELLED => 'badge bg-danger',
            self::STATUS_CLOSED => 'badge bg-dark',
        ];

        return $classes[$this->status] ?? 'badge bg-secondary';
    }

    /**
     * Get the CSS class for the payment status badge
     *
     * @return string
     */
    public function getPaymentStatusClassAttribute(): string
    {
        $classes = [
            self::PAYMENT_PENDING => 'badge bg-secondary',
            self::PAYMENT_PARTIAL => 'badge bg-warning',
            self::PAYMENT_PAID => 'badge bg-success',
            self::PAYMENT_OVERDUE => 'badge bg-danger',
        ];

        return $classes[$this->payment_status] ?? 'badge bg-secondary';
    }

    /**
     * Check if the order is overdue (expected delivery date passed but not received)
     *
     * @return bool
     */
    public function isOverdue(): bool
    {
        if (!$this->expected_delivery_date || $this->status === self::STATUS_RECEIVED || $this->status === self::STATUS_CANCELLED) {
            return false;
        }

        return now()->greaterThan($this->expected_delivery_date);
    }

    /**
     * Check if the order can be edited
     *
     * @return bool
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_SUBMITTED]);
    }

    /**
     * Check if the order can be approved
     *
     * @return bool
     */
    public function canBeApproved(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    /**
     * Check if the order can be cancelled
     *
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return !in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_CLOSED, self::STATUS_RECEIVED]);
    }

    /**
     * Check if the order is fully received
     *
     * @return bool
     */
    public function isFullyReceived(): bool
    {
        return $this->status === self::STATUS_RECEIVED;
    }

    /**
     * Check if the order is partially received
     *
     * @return bool
     */
    public function isPartiallyReceived(): bool
    {
        return $this->status === self::STATUS_PARTIALLY_RECEIVED;
    }

    /**
     * Calculate the received percentage
     *
     * @return float
     */
    public function getReceivedPercentageAttribute(): float
    {
        $totalOrdered = $this->purchaseOrderItems->sum('quantity_ordered');
        $totalReceived = $this->purchaseOrderItems->sum('quantity_received');
        
        if ($totalOrdered <= 0) {
            return 0;
        }

        return ($totalReceived / $totalOrdered) * 100;
    }

    /**
     * Calculate the total amount in base currency
     *
     * @return float
     */
    public function getTotalAmountBaseCurrencyAttribute(): float
    {
        return $this->total_amount * $this->exchange_rate;
    }

    /**
     * Approve the purchase order
     *
     * @param  string  $approvedBy
     * @return bool
     */
    public function approve(string $approvedBy): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->status = self::STATUS_APPROVED;
        $this->approved_by = $approvedBy;
        $this->approved_at = now();

        return $this->save();
    }

    /**
     * Mark as ordered
     *
     * @return bool
     */
    public function markAsOrdered(): bool
    {
        if ($this->status !== self::STATUS_APPROVED) {
            return false;
        }

        $this->status = self::STATUS_ORDERED;
        return $this->save();
    }

    /**
     * Cancel the purchase order
     *
     * @return bool
     */
    public function cancel(): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->status = self::STATUS_CANCELLED;
        return $this->save();
    }

    /**
     * Close the purchase order
     *
     * @return bool
     */
    public function close(): bool
    {
        if ($this->status !== self::STATUS_RECEIVED) {
            return false;
        }

        $this->status = self::STATUS_CLOSED;
        return $this->save();
    }

    /**
     * Recalculate order totals from line items
     *
     * @return bool
     */
    public function recalculateTotals(): bool
    {
        $subtotal = $this->purchaseOrderItems->sum('line_total');
        
        // Calculate tax, shipping, discount (you might have more complex logic here)
        $taxAmount = $subtotal * 0.1; // Example: 10% tax
        $shippingAmount = 50; // Example: flat shipping
        $discountAmount = $subtotal * 0.05; // Example: 5% discount
        
        $total = $subtotal + $taxAmount + $shippingAmount - $discountAmount;

        $this->subtotal_amount = $subtotal;
        $this->tax_amount = $taxAmount;
        $this->shipping_amount = $shippingAmount;
        $this->discount_amount = $discountAmount;
        $this->total_amount = $total;

        return $this->save();
    }

    /**
     * Scope a query to only include orders with a specific status.
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
     * Scope a query to only include draft orders.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDraft($query)
    {
        return $query->withStatus(self::STATUS_DRAFT);
    }

    /**
     * Scope a query to only include approved orders.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->withStatus(self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include ordered orders.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOrdered($query)
    {
        return $query->withStatus(self::STATUS_ORDERED);
    }

    /**
     * Scope a query to only include received orders.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReceived($query)
    {
        return $query->withStatus(self::STATUS_RECEIVED);
    }

    /**
     * Scope a query to only include overdue orders.
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
     * Scope a query to only include orders for a specific university.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $universityId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    /**
     * Scope a query to only include orders for a specific department.
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
     * Scope a query to only include orders from a specific supplier.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $supplierId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromSupplier($query, $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    /**
     * Get the university that owns the purchase order.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the supplier that owns the purchase order.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    /**
     * Get the department that owns the purchase order.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Get the user who requested the purchase order.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by', 'user_id');
    }


    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by', 'user_id');
    }


    /**
     * Get the user who approved the purchase order.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    /**
     * Get the user who received the purchase order.
     */
    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by', 'user_id');
    }

    /**
     * Get the purchase order items for the purchase order.
     */
    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'order_id', 'order_id');
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($purchaseOrder) {
            // Generate UUID if not provided
            if (empty($purchaseOrder->order_id)) {
                $purchaseOrder->order_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Generate PO number if not provided
            if (empty($purchaseOrder->po_number)) {
                $purchaseOrder->po_number = 'PO-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            }

            // Set order date if not provided
            if (empty($purchaseOrder->order_date)) {
                $purchaseOrder->order_date = now();
            }
        });

        static::updating(function ($purchaseOrder) {
            // Update status based on received items
            if ($purchaseOrder->isDirty('status') && $purchaseOrder->status === self::STATUS_RECEIVED) {
                $purchaseOrder->actual_delivery_date = now();
            }
        });
    }
}