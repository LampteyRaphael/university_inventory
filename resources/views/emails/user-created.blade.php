<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created - {{ $systemName }}</title>
    <style>
        /* Base Styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
            background-size: cover;
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .welcome-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0 0 10px 0;
        }

        .welcome-subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0;
            font-weight: 400;
        }

        /* Content */
        .content {
            padding: 40px;
        }

        .greeting {
            font-size: 1.3rem;
            color: #2d3748;
            margin-bottom: 25px;
            font-weight: 600;
        }

        .intro-text {
            color: #4a5568;
            margin-bottom: 30px;
            font-size: 1.05rem;
        }

        /* Credentials Card */
        .credentials-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .credentials-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .credentials-title::before {
            content: '🔐';
            font-size: 1.4rem;
        }

        .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .credential-item:last-child {
            border-bottom: none;
        }

        .credential-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 120px;
        }

        .credential-value {
            font-weight: 700;
            color: #2d3748;
            background: #ffffff;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            flex: 1;
            margin-left: 15px;
            font-family: 'Courier New', monospace;
            font-size: 0.95rem;
        }

        /* Security Notice */
        .security-notice {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffd351;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }

        .security-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .security-content h4 {
            margin: 0 0 8px 0;
            color: #856404;
            font-size: 1.1rem;
        }

        .security-content p {
            margin: 0;
            color: #856404;
            font-size: 0.95rem;
        }

        /* Login Section */
        .login-section {
            text-align: center;
            margin: 30px 0;
        }

        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.1rem;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }

        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
        }

        .login-link {
            display: block;
            margin-top: 15px;
            color: #667eea;
            word-break: break-all;
            font-size: 0.9rem;
            text-decoration: none;
        }

        /* Role Info */
        .role-info {
            background: #e8f5e8;
            border: 1px solid #c8e6c9;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }

        .role-badge {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
        }

        /* Support Section */
        .support-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0 20px 0;
            text-align: center;
        }

        .support-title {
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 10px;
        }

        .support-contact {
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
        }

        /* Footer */
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer-text {
            color: #718096;
            font-size: 0.9rem;
            line-height: 1.5;
            margin: 0;
        }

        .copyright {
            color: #a0aec0;
            font-size: 0.85rem;
            margin-top: 15px;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .email-container {
                margin: 20px;
                border-radius: 12px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 25px;
            }
            
            .credential-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .credential-value {
                margin-left: 0;
                width: 100%;
            }
            
            .login-button {
                padding: 14px 30px;
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo">{{ $systemName }}</div>
                <h1 class="welcome-title">Welcome Aboard! 🎉</h1>
                <p class="welcome-subtitle">Your account has been successfully created</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                Hello {{ $user->first_name }}{{ $user->last_name ? ' ' . $user->last_name : '' }},
            </div>

            <!-- Introduction -->
            <p class="intro-text">
                Your account has been created in the <strong>{{ $systemName }}</strong> system 
                @if($universityName !== 'Your Organization')
                for <strong>{{ $universityName }}</strong>
                @endif
                . Below are your login credentials to access the system.
            </p>

            <!-- Credentials Card -->
            <div class="credentials-card">
                <h3 class="credentials-title">Your Login Credentials</h3>
                
                <div class="credential-item">
                    <span class="credential-label">Email Address:</span>
                    <span class="credential-value">{{ $user->email }}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">{{ $plainPassword }}</span>
                </div>
                
                @if($user->username)
                <div class="credential-item">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">{{ $user->username }}</span>
                </div>
                @endif
                
                @if($user->employee_id)
                <div class="credential-item">
                    <span class="credential-label">Employee ID:</span>
                    <span class="credential-value">{{ $user->employee_id }}</span>
                </div>
                @endif
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <div class="security-icon">⚠️</div>
                <div class="security-content">
                    <h4>Security Recommendation</h4>
                    <p>For your account security, we strongly recommend that you change your password immediately after your first login.</p>
                </div>
            </div>

            <!-- Login Section -->
            <div class="login-section">
                <a href="{{ $loginUrl }}" class="login-button">
                    🚀 Login to Your Account
                </a>
                <a href="{{ $loginUrl }}" class="login-link">
                    {{ $loginUrl }}
                </a>
            </div>

            <!-- Role Information -->
            <div class="role-info">
                <p style="margin: 0 0 15px 0; color: #2d3748; font-weight: 600;">Your assigned role:</p>
                <span class="role-badge">Staff Member</span>
            </div>

            <!-- Support Section -->
            <div class="support-section">
                <h4 class="support-title">Need Help?</h4>
                <p style="margin: 10px 0; color: #4a5568;">
                    If you encounter any issues or have questions about the system, please contact your system administrator or IT support team.
                </p>
                <p style="margin: 5px 0; color: #4a5568;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                You're receiving this email because a new account was created for you in the {{ $systemName }} system.
            </p>
            <p class="copyright">
                &copy; {{ date('Y') }} {{ $systemName }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>