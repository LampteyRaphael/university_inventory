<?php

namespace App\Traits;

use Spatie\Permission\Traits\HasRoles;

trait HasUuidPermissions
{
    use HasRoles;

    /**
     * Get the value of the model's primary key.
     */
    public function getKey()
    {
        return $this->getAttribute($this->getKeyName());
    }

    /**
     * Get the primary key for the model.
     */
    public function getKeyName()
    {
        return 'user_id';
    }

    /**
     * Get the table associated with the model.
     */
    public function getTable()
    {
        return 'users';
    }

    /**
     * Get the morph class for the model.
     */
    public function getMorphClass()
    {
        return 'App\Models\User';
    }
}