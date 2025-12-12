'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import apiClient from '@/lib/api';
import { translations } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';

// Base schema for common fields
const baseStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  phone: z.string().regex(/^05[0-9]{8}$/, 'Phone must be in format: 05XXXXXXXX'),
});

// Doctor-specific schema
const doctorSchema = baseStaffSchema.extend({
  role: z.literal('Doctor'),
  specialization: z.string().min(1, 'Specialization is required').max(100),
  available_days: z.string().min(1, 'Available days is required'),
  clinic_room: z.string().min(1, 'Clinic room is required').max(50),
});

// Secretary schema
const secretarySchema = baseStaffSchema.extend({
  role: z.literal('Secretary'),
});

// Union schema
const staffSchema = z.discriminatedUnion('role', [doctorSchema, secretarySchema]);

type StaffFormData = z.infer<typeof staffSchema>;

export default function AddStaffPage() {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Doctor' | 'Secretary'>('Secretary');
  const router = useRouter();
  const { user, clinic } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'Secretary',
    },
  });

  const handleRoleChange = (role: 'Doctor' | 'Secretary') => {
    setSelectedRole(role);
    reset({ role });
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Adjust endpoint based on your backend API
      const endpoint = data.role === 'Doctor' ? '/clinic/doctors' : '/clinic/secretaries';
      
      const response = await apiClient.post(endpoint, data);

      // Success - redirect back to clinic dashboard with success message
      router.push('/clinic/dashboard?success=Staff member added successfully');
    } catch (err: unknown) {
      console.error('Staff creation error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;
        
        if (status === 422 && errorData?.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(validationErrors);
        } else if (errorData?.message) {
          setError(errorData.message);
        } else {
          setError('Failed to add staff member. Please try again.');
        }
      } else {
        setError('Network error. Please ensure the backend server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.addStaffMember}</h1>
            <p className="text-sm text-gray-600">{clinic?.name}</p>
          </div>
     
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-linear-to-r from-teal-600 to-cyan-600 px-8 py-6 text-white">
            <h2 className="text-xl font-bold">{t.staffRegistrationForm}</h2>
            <p className="text-teal-100 text-sm">{t.addNewDoctorSecretary}</p>
          </div>

          {/* Form Body */}
          <div className="px-8 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.role} <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  {...register('role')}
                  onChange={(e) => handleRoleChange(e.target.value as 'Doctor' | 'Secretary')}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900"
                >
                  <option value="Secretary">{t.secretary}</option>
                  <option value="Doctor">{t.doctor}</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={`block w-full px-4 py-3 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                    placeholder="Dr. Sarah Ahmed"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`block w-full px-4 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                    placeholder="sarah@clinic.ps"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="text"
                    {...register('phone')}
                    className={`block w-full px-4 py-3 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                    placeholder="0599123456"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Doctor-specific Fields */}
              {selectedRole === 'Doctor' && (
                <div className="space-y-5 border-t pt-6 mt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">{t.doctorInformation}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Specialization */}
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.specialization} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="specialization"
                        type="text"
                        {...register('specialization')}
                        className={`block w-full px-4 py-3 border ${
                          errors.specialization ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                        placeholder="Cardiology"
                      />
                      {errors.specialization && (
                        <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                      )}
                    </div>

                    {/* Clinic Room */}
                    <div>
                      <label htmlFor="clinic_room" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.clinicRoom} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="clinic_room"
                        type="text"
                        {...register('clinic_room')}
                        className={`block w-full px-4 py-3 border ${
                          errors.clinic_room ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                        placeholder="Room 101"
                      />
                      {errors.clinic_room && (
                        <p className="mt-1 text-sm text-red-600">{errors.clinic_room.message}</p>
                      )}
                    </div>

                    {/* Available Days */}
                    <div className="md:col-span-2">
                      <label htmlFor="available_days" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.availableDays} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="available_days"
                        type="text"
                        {...register('available_days')}
                        className={`block w-full px-4 py-3 border ${
                          errors.available_days ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900`}
                        placeholder="Monday, Wednesday, Friday"
                      />
                      {errors.available_days && (
                        <p className="mt-1 text-sm text-red-600">{errors.available_days.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {t.availableDaysExample}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-linear-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.adding}
                    </>
                  ) : (
                    <>
                      {t.add} {selectedRole === 'Doctor' ? t.doctor : t.secretary}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
