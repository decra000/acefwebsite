import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Mock token from URL params (in real app this would come from useParams)
  const token = 'mock-token';

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => {
    navigate('/login'); // This will programmatically navigate to /login
        console.log('Redirecting to login...');
      }, 2500);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

 const handleBackToLogin = () => {
    navigate('/login'); // This will programmatically navigate to /login
  };

  return (
    <div className="container">
      {/* Background decorative elements */}
      <div className="backgroundElements">
        <div className="circle1"></div>
        <div className="circle2"></div>
        <div className="circle3"></div>
      </div>

      <div className="forgotPasswordCard">
        <div className="header">
          <div className="logo">
            <Shield className="logoIcon" size={32} />
          </div>
          <h1 className="title">Reset Your Password</h1>
          <p className="subtitle">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="successContainer">
            <Check className="successIcon" size={20} />
            <p className="successMessage">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="errorContainer">
            <AlertCircle className="errorIcon" size={20} />
            <p className="errorMessage">{error}</p>
          </div>
        )}

        <div className="form">
          <div className="inputGroup">
            <label className="label" htmlFor="password">
              New Password
            </label>
            <div className="inputWrapper">
              <Lock className="inputIcon" size={20} />
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="inputGroup">
            <label className="label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="inputWrapper">
              <Lock className="inputIcon" size={20} />
              <input
                id="confirmPassword"
                className="input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            className="submitButton" 
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? (
              <div className="loadingContainer">
                <div className="spinner"></div>
                <span>Resetting Password...</span>
              </div>
            ) : (
              <div className="buttonContent">
                <Shield size={20} />
                <span>Reset Password</span>
              </div>
            )}
          </button>
        </div>

        <div className="footer">
          <button 
            onClick={handleBackToLogin}
            className="backLink"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        /* CSS Variables for theming */
        :root {
          --color-primary: #0a451c;
          --color-primary-dark: #062a11;
          --color-secondary: #facf3c;
          --color-secondary-light: #fde047;
          --color-surface: #ffffff;
          --color-text: #1f2937;
          --color-text-secondary: #6b7280;
          --color-text-muted: #9ca3af;
          --color-border: #e5e7eb;
          --color-border-hover: #d1d5db;
          --color-success: #10b981;
          --color-error: #ef4444;
          --color-white: #ffffff;
          --color-black: #000000;
        }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          position: relative;
          overflow: hidden;
        }

        .forgotPasswordCard {
          background: var(--color-surface);
          padding: 3rem 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border);
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%);
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 30px rgba(250, 207, 60, 0.3);
        }

        .logoIcon {
          color: var(--color-black);
        }

        .title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .subtitle {
          color: var(--color-text-secondary);
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 350px;
          margin-left: auto;
          margin-right: auto;
        }

        .successContainer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .successIcon {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .successMessage {
          color: var(--color-success);
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .errorContainer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .errorIcon {
          color: var(--color-error);
          flex-shrink: 0;
        }

        .errorMessage {
          color: var(--color-error);
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .inputGroup {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.875rem;
          margin: 0;
        }

        .inputWrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .inputIcon {
          position: absolute;
          left: 1rem;
          color: var(--color-text-muted);
          z-index: 2;
          pointer-events: none;
        }

        .input {
          width: 100%;
          padding: 1rem 3rem 1rem 3rem;
          border: 2px solid var(--color-border);
          border-radius: 0.75rem;
          font-size: 1rem;
          color: var(--color-text);
          background: var(--color-surface);
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
        }

        .input:focus {
          border-color: var(--color-secondary);
          box-shadow: 0 0 0 3px rgba(250, 207, 60, 0.1);
          transform: translateY(-1px);
        }

        .input:hover {
          border-color: var(--color-border-hover);
        }

        .input::placeholder {
          color: var(--color-text-muted);
        }

        .submitButton {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%);
          color: var(--color-black);
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(250, 207, 60, 0.3);
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .submitButton:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(250, 207, 60, 0.4);
        }

        .submitButton:active:not(:disabled) {
          transform: translateY(0);
        }

        .submitButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(250, 207, 60, 0.2);
        }

        .buttonContent {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loadingContainer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top: 2px solid var(--color-black);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .backLink {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .backLink:hover {
          color: var(--color-primary-dark);
          background: rgba(10, 69, 28, 0.05);
          transform: translateX(-3px);
        }

        .passwordStrength {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .strengthIndicator {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .strengthBar {
          height: 0.25rem;
          flex: 1;
          border-radius: 0.125rem;
          background: var(--color-border);
          transition: all 0.3s ease;
        }

        .strengthBar.weak {
          background: var(--color-error);
        }

        .strengthBar.medium {
          background: #f59e0b;
        }

        .strengthBar.strong {
          background: var(--color-success);
        }

        /* Background decorative elements */
        .backgroundElements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .circle1,
        .circle2,
        .circle3 {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(156, 207, 159, 0.1) 0%, rgba(156, 207, 159, 0.05) 100%);
          animation: float 6s ease-in-out infinite;
        }

        .circle1 {
          width: 180px;
          height: 180px;
          top: 15%;
          right: -5%;
          animation-delay: 0s;
        }

        .circle2 {
          width: 120px;
          height: 120px;
          bottom: 20%;
          left: -10%;
          animation-delay: 2s;
        }

        .circle3 {
          width: 90px;
          height: 90px;
          top: 50%;
          left: 10%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(120deg);
          }
          66% {
            transform: translateY(8px) rotate(240deg);
          }
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .container {
            padding: 0.75rem;
          }
          
          .forgotPasswordCard {
            padding: 2rem 1.5rem;
            border-radius: 1rem;
          }
          
          .title {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.875rem;
          }
          
          .input {
            padding: 0.875rem 2.75rem 0.875rem 2.75rem;
          }
          
          .inputIcon {
            left: 0.875rem;
          }
          
          .circle1,
          .circle2,
          .circle3 {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );

  // Helper function to calculate password strength
  function getPasswordStrength(password) {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 3);
  }
};

export default ResetPassword;