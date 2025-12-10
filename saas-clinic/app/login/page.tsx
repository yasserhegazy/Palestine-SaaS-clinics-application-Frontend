'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

// Validation schema - accepts email or phone
const loginSchema = z.object({
  login: z.string().min(3, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user } = useAuth();
  const { language, isRTL } = useLanguage();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case 'Admin':
          router.push('/platform/dashboard');
          break;
        case 'Manager':
          router.push('/clinic/dashboard');
          break;
        case 'Doctor':
          router.push('/doctor/dashboard');
          break;
        case 'Secretary':
          router.push('/reception/dashboard');
          break;
        case 'Patient':
          router.push('/patient/dashboard');
          break;
        default:
          router.push('/clinic/dashboard');
      }
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      await login(data.login, data.password);
      // Navigation is handled in AuthContext based on role
    } catch (err: unknown) {
      // Don't log to console - error is displayed in UI
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string; error?: string } } };
        const status = axiosError.response?.status;
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
        
        if (status === 502 || status === 500) {
          setError('Server error. Please check your backend configuration and try again.');
        } else if (status === 422) {
          setError('Validation error: ' + (errorMessage || 'Invalid input data'));
        } else if (errorMessage) {
          setError(errorMessage);
        } else {
          setError(`Login failed (HTTP ${status}). Please check your credentials.`);
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const networkError = err as { message?: string };
        setError(networkError.message || 'Network error. Please ensure the backend server is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="w-full max-w-md relative">
        {/* Theme & Language Toggle */}
        <div className="absolute top-0 right-0 mb-4 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden mt-16 transition-colors duration-300">
          {/* Header with Healthcare Colors */}
          <div className="bg-linear-to-r from-teal-600 to-cyan-600 px-8 py-10 text-white text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-400 via-cyan-400 to-teal-500"></div>
            
            {/* Logo/Icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
            <p className="text-teal-100 text-sm">{t.subtitle}</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.welcome}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.signInPrompt}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email or Phone Field */}
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.emailOrPhone || (language === 'en' ? 'Email or Phone' : 'البريد الإلكتروني أو رقم الهاتف')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="login"
                    type="text"
                    {...register('login')}
                    className={`block w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-3 border ${
                      errors.login ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900 dark:text-white dark:bg-slate-700`}
                    placeholder={language === 'en' ? 'admin@platform.com or 0599123456' : 'admin@platform.com أو 0599123456'}
                  />
                </div>
                {errors.login && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.login.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-3 border ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900 dark:text-white dark:bg-slate-700`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 dark:border-slate-600 rounded focus:ring-teal-500 dark:bg-slate-700"
                  />
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-700 dark:text-gray-300`}>{t.rememberMe}</span>
                </label>
                <a href="#" className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                  {t.forgotPassword}
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'en' ? 'Signing in...' : 'جارٍ تسجيل الدخول...'}
                  </>
                ) : (
                  <>
                    {t.login}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-700 px-8 py-4 text-center border-t dark:border-slate-600 transition-colors">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t.dontHaveAccount}{' '}
              <a href="/join-us" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                {t.registerClinic}
              </a>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-500">
              {t.copyright}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 shadow-md transition-colors">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm">
            {t.demoCredentials}
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>{t.admin}</strong> admin@platform.com</p>
            <p><strong>{t.manager}</strong> manager@clinic.ps</p>
            <p><strong>{t.doctorLabel}</strong> doctor@clinic.ps</p>
          </div>
        </div>
      </div>
    </div>
  );
}
