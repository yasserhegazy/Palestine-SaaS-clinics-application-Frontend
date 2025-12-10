'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';
import { useRoleGuard } from '@/lib/roleGuard';
import DashboardHero from '@/components/DashboardHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getDoctors, updateDoctorSchedule, type StaffMember, type UpdateSchedulePayload } from '@/lib/api/manageSchedule';
import { toast } from 'react-hot-toast';

export default function ManageSchedulePage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  // Role Guard
  useRoleGuard(['Manager']);

  // State
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotDuration, setSlotDuration] = useState<number>(30);

  const dayNames: Record<string, { en: string; ar: string }> = {
    'Monday': { en: 'Monday', ar: 'الاثنين' },
    'Tuesday': { en: 'Tuesday', ar: 'الثلاثاء' },
    'Wednesday': { en: 'Wednesday', ar: 'الأربعاء' },
    'Thursday': { en: 'Thursday', ar: 'الخميس' },
    'Friday': { en: 'Friday', ar: 'الجمعة' },
    'Saturday': { en: 'Saturday', ar: 'السبت' },
    'Sunday': { en: 'Sunday', ar: 'الأحد' },
  };

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getDoctors(token);
        setDoctors(data);
        if (data.length > 0) {
          selectDoctor(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        toast.error(language === 'ar' ? 'فشل في جلب قائمة الأطباء' : 'Failed to fetch doctors list');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchDoctors();
    }
  }, [isAuthenticated, token, language]);

  const selectDoctor = (doctor: StaffMember) => {
    setSelectedDoctor(doctor);
    setAvailableDays(doctor.available_days ? doctor.available_days.split(',') : []);
    setStartTime(doctor.start_time || '09:00');
    setEndTime(doctor.end_time || '17:00');
    setSlotDuration(doctor.slot_duration || 30);
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !token) return;

    try {
      setSaving(true);

      const payload: UpdateSchedulePayload = {
        name: selectedDoctor.name,
        email: selectedDoctor.email,
        phone: selectedDoctor.phone,
        available_days: availableDays.join(','),
        start_time: startTime,
        end_time: endTime,
        slot_duration: slotDuration
      };

      const updatedDoctor = await updateDoctorSchedule(token, selectedDoctor.user_id, payload);

      // Update local state
      setDoctors(prev => prev.map(d => d.user_id === updatedDoctor.user_id ? updatedDoctor : d));
      setSelectedDoctor(updatedDoctor); // Update selected to formatted one from backend

      toast.success(language === 'ar' ? 'تم تحديث الجدول بنجاح' : 'Schedule updated successfully');
    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error updating schedule'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        <DashboardHero
          title={t.manageSchedule || (language === 'ar' ? 'جدول الدوام' : 'Manage Schedule')}
          subtitle={language === 'ar' ? 'تحديد أوقات عمل الأطباء' : 'Configure doctor working hours'}
          description={language === 'ar'
            ? 'قم باختيار الطبيب وتحديد أيام وساعات العمل ومدة الموعد.'
            : 'Select a doctor to configure their working days, hours and appointment duration.'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Doctor List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {language === 'ar' ? 'الأطباء' : 'Doctors'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {doctors.map(doctor => (
                <button
                  key={doctor.user_id}
                  onClick={() => selectDoctor(doctor)}
                  className={`w-full text-left p-4 hover:bg-teal-50 transition-colors flex flex-col gap-1 ${selectedDoctor?.user_id === doctor.user_id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                    }`}
                >
                  <span className="font-medium text-gray-900">{doctor.name}</span>
                  <span className="text-xs text-gray-500">{doctor.specialization}</span>
                </button>
              ))}
              {doctors.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  {language === 'ar' ? 'لا يوجد أطباء' : 'No doctors found'}
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Schedule Form */}
          <div className="lg:col-span-3">
            {selectedDoctor ? (
              <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {selectedDoctor.status}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Working Days */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {language === 'ar' ? 'أيام العمل' : 'Working Days'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map(day => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${availableDays.includes(day)
                            ? 'bg-teal-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {dayNames[day][language] || day}
                      </button>
                    ))}
                  </div>
                  {availableDays.length === 0 && (
                    <p className="text-sm text-amber-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {language === 'ar' ? 'يجب اختيار يوم واحد على الأقل' : 'Please select at least one working day'}
                    </p>
                  )}
                </div>

                {/* Working Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {language === 'ar' ? 'وقت البدء' : 'Start Time'}
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {language === 'ar' ? 'وقت الانتهاء' : 'End Time'}
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {language === 'ar' ? 'مدة الموعد' : 'Appointment Content'}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'المدة (دقائق)' : 'Duration (minutes)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="5"
                          max="120"
                          step="5"
                          value={slotDuration}
                          onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                          min
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {language === 'ar'
                          ? `يولد حوالي ${Math.floor((60 / (slotDuration || 30)))} موعد في الساعة`
                          : `Generates approx. ${Math.floor((60 / (slotDuration || 30)))} slots per hour`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving || availableDays.length === 0}
                    className={`px-6 py-2 bg-teal-600 text-white rounded-lg font-medium shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${(saving || availableDays.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {saving
                      ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                      : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                  </button>
                </div>

              </form>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {language === 'ar' ? 'لم يتم اختيار طبيب' : 'No Doctor Selected'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {language === 'ar' ? 'يرجى اختيار طبيب من القائمة لتعديل جدوله' : 'Please select a doctor from the list to configure their schedule.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
