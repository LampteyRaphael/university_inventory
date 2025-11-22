<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserCreatedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $plainPassword;
    public $loginUrl;
    public $universityName;
    public $systemName;

    public function __construct(User $user, string $plainPassword, string $universityName)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
        $this->loginUrl = url('/login');
        $this->universityName = $universityName;
        $this->systemName = config('app.name', 'Inventory Management System');
    }

    public function build()
    {
        return $this->to($this->user->email) // Add this line to set the recipient
                   ->subject('Your Account Has Been Created - ' . $this->systemName)
                   ->view('emails.user-created')
                   ->with([
                       'user' => $this->user,
                       'plainPassword' => $this->plainPassword,
                       'loginUrl' => $this->loginUrl,
                       'universityName' => $this->universityName,
                       'systemName' => $this->systemName,
                   ]);
    }
}