'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';
import { AuthStorage } from '@/lib/secure-storage';
import { APIResponse } from '@/types/response';
import type { 
  LoginRequest, 
  SendOTPRequest, 
  VerifyOTPRequest, 
  AuthData, 
  SendOTPData,
  AuthErrorData 
} from '@/types/auth';

type AuthMethod = 'password' | 'otp';

export default function SuperUserLogin() {
  const router = useRouter();
  
  // Auth method toggle
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle password-based login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const requestData: LoginRequest = {
        email,
        password,
      };

      const response = await axios.post<APIResponse<AuthData>>(
        API_ENDPOINTS.auth.login, 
        requestData
      );

      if (response.data.code === 201 && response.data.data) {
        const authData = response.data.data;
        
        // Store auth session securely
        AuthStorage.setSession({
          token: authData.token,
          expiresIn: authData.exp,
          isAdmin: authData.is_admin,
          adminIndex: authData.admin_auth_index,
        });
        
        // Redirect to admin dashboard
        router.push('/superuser');
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<AuthErrorData>>;
      if (axiosError.response?.data) {
        setError(axiosError.response.data.data?.message || 'Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const requestData: SendOTPRequest = { email };

      const response = await axios.post<APIResponse<SendOTPData>>(
        API_ENDPOINTS.auth.sendOTP, 
        requestData
      );

      if (response.data.code === 201) {
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<AuthErrorData>>;
      if (axiosError.response?.data) {
        setError(axiosError.response.data.data?.message || 'Failed to send OTP');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP-based login
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const requestData: VerifyOTPRequest = {
        email,
        otp,
      };

      const response = await axios.post<APIResponse<AuthData>>(
        API_ENDPOINTS.auth.verifyOTP, 
        requestData
      );

      if (response.data.code === 201 && response.data.data) {
        const authData = response.data.data;
        
        // Store auth session securely
        AuthStorage.setSession({
          token: authData.token,
          expiresIn: authData.exp,
          isAdmin: authData.is_admin,
          adminIndex: authData.admin_auth_index,
        });
        
        // Redirect to admin dashboard
        router.push('/superuser');
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<AuthErrorData>>;
      if (axiosError.response?.data) {
        setError(axiosError.response.data.data?.message || 'Invalid OTP');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Superuser Login
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Access the admin panel
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setError('');
                setOtpSent(false);
                setOtp('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setError('');
                setPassword('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'otp'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              OTP
            </button>
          </div>

          {/* Password Login Form */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email-password"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:text-white transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:text-white transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in with Password'
                )}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {authMethod === 'otp' && (
            <form onSubmit={handleOTPLogin} className="space-y-4">
              <div>
                <label htmlFor="email-otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    id="email-otp"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="admin@example.com"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={isLoading || !email}
                      className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all whitespace-nowrap"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={countdown > 0 || isLoading}
                      className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all whitespace-nowrap"
                    >
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
                    </button>
                  )}
                </div>
                {otpSent && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    OTP sent to your email. Please check your inbox.
                  </p>
                )}
              </div>

              {otpSent && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:text-white text-center text-2xl tracking-widest font-mono transition-all"
                    placeholder="000000"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {otpSent && (
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign in'
                  )}
                </button>
              )}
            </form>
          )}
        </div>

        {/* Back to Family Tree */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← Back to Family Tree
          </button>
        </div>
      </div>
    </div>
  );
}
