'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import apiClient from '@/lib/api';
import Cookies from 'js-cookie';

// Validation schema matching backend requirements
const registrationSchema = z.object({
  clinic: z.object({
    name: z.string().min(1, 'Clinic name is required').max(100),
    speciality: z.string().max(100).optional(),
    address: z.string().min(1, 'Address is required').max(255),
    phone: z.string().min(1, 'Phone is required').max(20),
    email: z.string().email('Invalid email address').max(100),
    subscription_plan: z.enum(['Basic', 'Standard', 'Premium'], {
      errorMap: () => ({ message: 'Please select a subscription plan' }),
    }),
  }),
  manager: z.object({
    name: z.string().min(1, 'Manager name is required').max(100),
    email: z.string().email('Invalid email address').max(100),
    phone: z.string().min(1, 'Phone is required').max(20),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Password confirmation is required'),
  }),
}).refine((data) => data.manager.password === data.manager.password_confirmation, {
  message: "Passwords don't match",
  path: ['manager', 'password_confirmation'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function JoinUsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match(/^image\/(jpeg|png|jpg|gif|svg\+xml)$/)) {
        setError('Logo must be an image (JPEG, PNG, JPG, GIF, or SVG)');
        return;
      }
      if (file.size > 2048 * 1024) {
        setError('Logo size must not exceed 2MB');
        return;
      }
      
      setLogoFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add clinic data
      formData.append('clinic[name]', data.clinic.name);
      if (data.clinic.speciality) {
        formData.append('clinic[speciality]', data.clinic.speciality);
      }
      formData.append('clinic[address]', data.clinic.address);
      formData.append('clinic[phone]', data.clinic.phone);
      formData.append('clinic[email]', data.clinic.email);
      formData.append('clinic[subscription_plan]', data.clinic.subscription_plan);
      
      // Add manager data
      formData.append('manager[name]', data.manager.name);
      formData.append('manager[email]', data.manager.email);
      formData.append('manager[phone]', data.manager.phone);
      formData.append('manager[password]', data.manager.password);
      formData.append('manager[password_confirmation]', data.manager.password_confirmation);
      
      // Add logo if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await apiClient.post('/register/clinic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store token and user data
      if (response.data.token) {
        Cookies.set('auth_token', response.data.token, { expires: 7 });
        Cookies.set('user_data', JSON.stringify(response.data.manager), { expires: 7 });
      }

      // Redirect to clinic dashboard
      router.push('/clinic/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string; error?: string; errors?: Record<string, string[]> } } };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;
        
        if (status === 422 && errorData?.errors) {
          // Validation errors
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(validationErrors);
        } else if (errorData?.message) {
          setError(errorData.message);
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Registration failed (HTTP ${status}). Please check your information.`);
        }
      } else {
        setError('Network error. Please ensure the backend server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRTL = language === 'ar';

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 via-white to-cyan-50 p-4 py-12"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="w-full max-w-4xl relative">
        {/* Language Toggle */}
        <div className="absolute top-0 right-0 mb-4">
          <LanguageSwitcher />
        </div>

        {/* Registration Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mt-16">
          {/* Header */}
          <div className="bg-linear-to-r from-teal-600 to-cyan-600 px-8 py-10 text-white text-center relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-400 via-cyan-400 to-teal-500"></div>
            
            {/* Logo/Icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{t.joinTitle}</h1>
            <p className="text-teal-100 text-sm">{t.joinSubtitle}</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Clinic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                  {t.clinicInfo}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Clinic Name */}
                  <div>
                    <label htmlFor="clinic.name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.clinicName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="clinic.name"
                      type="text"
                      {...register('clinic.name')}
                      className={`block w-full px-4 py-3 border ${
                        errors.clinic?.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="Al-Shifa Medical Center"
                    />
                    {errors.clinic?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.clinic.name.message}</p>
                    )}
                  </div>

                  {/* Speciality */}
                  <div>
                    <label htmlFor="clinic.speciality" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.speciality}
                    </label>
                    <input
                      id="clinic.speciality"
                      type="text"
                      {...register('clinic.speciality')}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900"
                      placeholder="General Medicine"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="clinic.address" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="clinic.address"
                      type="text"
                      {...register('clinic.address')}
                      className={`block w-full px-4 py-3 border ${
                        errors.clinic?.address ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="123 Main St, Gaza"
                    />
                    {errors.clinic?.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.clinic.address.message}</p>
                    )}
                  </div>

                  {/* Clinic Phone */}
                  <div>
                    <label htmlFor="clinic.phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.clinicPhone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="clinic.phone"
                      type="text"
                      {...register('clinic.phone')}
                      className={`block w-full px-4 py-3 border ${
                        errors.clinic?.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="+970-XXX-XXXXXX"
                    />
                    {errors.clinic?.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.clinic.phone.message}</p>
                    )}
                  </div>

                  {/* Clinic Email */}
                  <div>
                    <label htmlFor="clinic.email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.clinicEmail} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="clinic.email"
                      type="email"
                      {...register('clinic.email')}
                      className={`block w-full px-4 py-3 border ${
                        errors.clinic?.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="info@alshifa.ps"
                    />
                    {errors.clinic?.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.clinic.email.message}</p>
                    )}
                  </div>

                  {/* Subscription Plan */}
                  <div>
                    <label htmlFor="clinic.subscription_plan" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.subscriptionPlan} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="clinic.subscription_plan"
                      {...register('clinic.subscription_plan')}
                      className={`block w-full px-4 py-3 border ${
                        errors.clinic?.subscription_plan ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                    >
                      <option value="">{t.selectPlan}</option>
                      <option value="Basic">{t.basic}</option>
                      <option value="Standard">{t.standard}</option>
                      <option value="Premium">{t.premium}</option>
                    </select>
                    {errors.clinic?.subscription_plan && (
                      <p className="mt-1 text-sm text-red-600">{errors.clinic.subscription_plan.message}</p>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.logo}
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max 2MB (JPEG, PNG, JPG, GIF, SVG)</p>
                    {logoPreview && (
                      <div className="mt-2">
                        <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manager Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-cyan-500">
                  {t.managerInfo}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Manager Name */}
                  <div>
                    <label htmlFor="manager.name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.managerName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="manager.name"
                      type="text"
                      {...register('manager.name')}
                      className={`block w-full px-4 py-3 border ${
                        errors.manager?.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="Dr. Ahmad Hassan"
                    />
                    {errors.manager?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager.name.message}</p>
                    )}
                  </div>

                  {/* Manager Email */}
                  <div>
                    <label htmlFor="manager.email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.managerEmail} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="manager.email"
                      type="email"
                      {...register('manager.email')}
                      className={`block w-full px-4 py-3 border ${
                        errors.manager?.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="ahmad@alshifa.ps"
                    />
                    {errors.manager?.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager.email.message}</p>
                    )}
                  </div>

                  {/* Manager Phone */}
                  <div>
                    <label htmlFor="manager.phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.managerPhone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="manager.phone"
                      type="text"
                      {...register('manager.phone')}
                      className={`block w-full px-4 py-3 border ${
                        errors.manager?.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="+970-XXX-XXXXXX"
                    />
                    {errors.manager?.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager.phone.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="manager.password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.password} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="manager.password"
                      type="password"
                      {...register('manager.password')}
                      className={`block w-full px-4 py-3 border ${
                        errors.manager?.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="••••••••"
                    />
                    {errors.manager?.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="md:col-span-2">
                    <label htmlFor="manager.password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.confirmPassword} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="manager.password_confirmation"
                      type="password"
                      {...register('manager.password_confirmation')}
                      className={`block w-full px-4 py-3 border ${
                        errors.manager?.password_confirmation ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                      placeholder="••••••••"
                    />
                    {errors.manager?.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager.password_confirmation.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
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
                    {t.registering}
                  </>
                ) : (
                  <>
                    {t.register}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t">
            <p className="text-sm text-gray-600">
              {t.alreadyHaveAccount}{' '}
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                {t.loginHere}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
