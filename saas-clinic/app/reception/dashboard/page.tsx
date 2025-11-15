'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReceptionDashboard() {
  const { user, logout, clinic, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.receptionDashboard}</h1>
            <p className="text-sm text-gray-600">{clinic?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-linear-to-r from-teal-600 to-cyan-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-teal-100">Manage appointments and patient check-ins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">{t.checkinsToday}</p>
            <p className="text-3xl font-bold text-gray-900">24</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">{t.scheduledAppointments}</p>
            <p className="text-3xl font-bold text-gray-900">32</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">{t.waitingPatients}</p>
            <p className="text-3xl font-bold text-gray-900">5</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{t.quickActions}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all">
              <p className="font-medium text-gray-900">{t.newAppointment}</p>
            </button>
            <button className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all">
              <p className="font-medium text-gray-900">{t.patientCheckin}</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
