import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme'; // Import your theme hook
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import styles from '../styles/AuthPages.module.css';
import { API_URL } from '../config';

const ForgotPassword = () => {
  const { theme, colors } = useTheme(); // Use your theme system
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    const apiUrl = API_URL;

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON, got:', text);
        throw new Error('Server error: unexpected response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setStatus('Password reset link sent! Please check your email.');
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className={styles.container}>
      <div className={styles.forgotPasswordCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Mail size={32} className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>
            {isSubmitted ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p className={styles.subtitle}>
            {isSubmitted 
              ? `We've sent a password reset link to ${email}`
              : 'No worries! Enter your email address and we\'ll send you a link to reset your password.'
            }
          </p>
        </div>

        {/* Success Message */}
        {status && !error && (
          <div className={styles.successContainer}>
            <CheckCircle size={20} className={styles.successIcon} />
            <p className={styles.successMessage}>{status}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorContainer}>
            <AlertCircle size={20} className={styles.errorIcon} />
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading || !email}
            >
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className={styles.buttonContent}>
                  <Send size={20} />
                  <span>Send Reset Link</span>
                </div>
              )}
            </button>
          </form>
        ) : (
          <div className={styles.successActions}>
            <p className={styles.instructionText}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <button
              className={styles.resendButton}
              onClick={() => {
                setIsSubmitted(false);
                setStatus('');
                setError('');
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      <div className={styles.backgroundElements}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>
    </div>
  );
};

export default ForgotPassword;