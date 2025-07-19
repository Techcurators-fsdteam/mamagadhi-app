'use client';

import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  AuthError
} from 'firebase/auth';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

type AuthMethod = 'email' | 'phone';
type AuthStep = 'input' | 'otp';

export default function LoginPopup({ isOpen, onClose, onSwitchToSignup }: LoginPopupProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<AuthStep>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationId, setVerificationId] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen && authMethod === 'phone' && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
      setRecaptchaVerifier(verifier);
    }
  }, [isOpen, authMethod, recaptchaVerifier]);

  if (!isOpen) return null;

  const isValidPhone = (phone: string) => {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Don't need to manually check Supabase here - the AuthProvider will handle it
      onClose();
    } catch (error: unknown) {
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (authError.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(authError.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isValidPhone(phone)) {
        throw new Error('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
      }

      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setStep('otp');
      setResendCooldown(30);
    } catch (error: unknown) {
      console.error('Send OTP error:', error);
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found') {
        setError('No account found with this phone number. Please sign up first.');
      } else {
        setError(authError.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      onClose();
    } catch (error: unknown) {
      const authError = error as AuthError;
      if (authError.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP code. Please try again.');
      } else if (authError.code === 'auth/code-expired') {
        setError('OTP code has expired. Please request a new one.');
      } else {
        setError(authError.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown === 0) {
      setError('');
      setLoading(true);
      
      try {
        if (!recaptchaVerifier) {
          throw new Error('reCAPTCHA not initialized');
        }
        const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
        setVerificationId(confirmationResult.verificationId);
        setResendCooldown(30);
      } catch (error: unknown) {
        const authError = error as AuthError;
        setError(authError.message || 'Failed to resend OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setStep('input');
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
    setError('');
    setVerificationId('');
  };

  const switchAuthMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-[#4AAAFF] to-white/70 rounded-2xl p-8 w-full max-w-md mx-4 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Mamagadhi
          </h1>
          <div className="w-16 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex bg-white/20 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => switchAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'email'
                ? 'bg-white text-[#4AAAFF] shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => switchAuthMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'phone'
                ? 'bg-white text-[#4AAAFF] shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {authMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#35a4c9] focus:ring-[#35a4c9]"
                />
                <span className="ml-2 text-sm text-white">Remember me</span>
              </label>
              <a href="#" className="text-sm text-white hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="text-red-200 text-sm bg-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4aaaff] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <>
            {step === 'input' ? (
              <form onSubmit={handleSendPhoneOTP} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                    placeholder="Enter phone (+1234567890)"
                  />
                  <p className="text-xs text-white/80 mt-1">
                    Use E.164 format (e.g., +1234567890)
                  </p>
                </div>

                {error && (
                  <div className="text-red-200 text-sm bg-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4aaaff] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-white mb-2">
                    Enter 6-Digit SMS Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  <p className="text-xs text-white/80 mt-1">
                    SMS sent to {phone}
                  </p>
                </div>

                {error && (
                  <div className="text-red-200 text-sm bg-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#4aaaff] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className="text-white text-sm hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-white text-sm hover:underline"
                  >
                    Change number
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/50"></div>
          <span className="px-4 text-sm text-white">OR</span>
          <div className="flex-1 border-t border-white/50"></div>
        </div>

        <div className="text-center">
          <p className="text-sm text-white">
            Don&apos;t have an account?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="text-white font-medium hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Hidden reCAPTCHA container */}
        {authMethod === 'phone' && <div id="recaptcha-container"></div>}
      </div>
    </div>
  );
}