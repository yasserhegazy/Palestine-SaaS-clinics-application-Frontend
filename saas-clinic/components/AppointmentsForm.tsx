"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getAllDoctors, getAvailableTimeSlots, type Doctor, type TimeSlot } from "@/app/api/appointments";

export interface AppointmentFormData {
  specialty: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

interface AppointmentFormProps {
  onSubmit?: (data: AppointmentFormData) => void;
  onClear?: () => void;
}

export default function AppointmentForm({
  onSubmit,
  onClear,
}: AppointmentFormProps) {
  const { language } = useLanguage();
  const { token } = useAuth();

  // All doctors and derived data
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  // Form state
  const [specialty, setSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

  // Loading states
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load all doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;
      
      setLoadingDoctors(true);
      setError(null);
      try {
        const doctors = await getAllDoctors(token);
        setAllDoctors(doctors);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError(language === "ar" ? "فشل تحميل الأطباء" : "Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [token, language]);

  // 2. Extract unique specialties when doctors are loaded
  useEffect(() => {
    if (allDoctors.length > 0) {
      const uniqueSpecialties = Array.from(
        new Set(allDoctors.map(d => d.specialization).filter(Boolean))
      ).sort();
      setSpecialties(uniqueSpecialties);
    }
  }, [allDoctors]);

  // 3. Filter doctors when specialty changes
  useEffect(() => {
    if (specialty) {
      const filtered = allDoctors.filter(d => d.specialization === specialty);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
    setSelectedDoctor(null);
    setAppointmentDate("");
    setAppointmentTime("");
    setAvailableSlots([]);
  }, [specialty, allDoctors]);

  // 4. Load time slots when doctor and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      // Validate date format (YYYY-MM-DD) and ensure year is reasonable (e.g. > 1900)
      const isValidDate = (dateString: string) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const year = parseInt(dateString.split('-')[0]);
        return year > 1900 && year < 2100;
      };

      if (!selectedDoctor || !appointmentDate || !isValidDate(appointmentDate) || !token) {
        setAvailableSlots([]);
        setAppointmentTime("");
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await getAvailableTimeSlots(token, selectedDoctor.id, appointmentDate);
        setAvailableSlots(slots);
        setAppointmentTime(""); // Reset time when slots change
      } catch (err) {
        console.error("Failed to fetch time slots:", err);
        setAvailableSlots([]);
        setError(language === "ar" ? "فشل تحميل الأوقات المتاحة" : "Failed to load available times");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDoctor, appointmentDate, token, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;

    onSubmit?.({
      specialty,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      appointmentDate,
      appointmentTime,
      notes,
    });
  };

  const handleClear = () => {
    setSpecialty("");
    setSelectedDoctor(null);
    setAppointmentDate("");
    setAppointmentTime("");
    setNotes("");
    setFilteredDoctors([]);
    setAvailableSlots([]);
    setError(null);
    onClear?.();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Specialty and Doctor - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specialty Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {language === "ar" ? "التخصص" : "Specialty"}
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={loadingDoctors}
          >
            <option value="" className="text-gray-500">
              {loadingDoctors
                ? (language === "ar" ? "جاري التحميل..." : "Loading...")
                : (language === "ar" ? "اختر التخصص" : "Select Specialty")}
            </option>
            {specialties.map((spec) => (
              <option key={spec} value={spec} className="text-gray-900 py-2">
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {language === "ar" ? "الطبيب" : "Doctor"}
          </label>
          <select
            value={selectedDoctor?.id || ""}
            onChange={(e) => {
              const doctor = filteredDoctors.find(d => d.id === Number(e.target.value));
              setSelectedDoctor(doctor || null);
            }}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={!specialty || filteredDoctors.length === 0}
          >
            <option value="" className="text-gray-500">
              {!specialty
                ? (language === "ar" ? "اختر التخصص أولاً" : "Select specialty first")
                : filteredDoctors.length === 0
                ? (language === "ar" ? "لا يوجد أطباء" : "No doctors available")
                : (language === "ar" ? "اختر الطبيب" : "Select Doctor")}
            </option>
            {filteredDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id} className="text-gray-900 py-2">
                {doctor.name} {doctor.clinic_room ? `- ${doctor.clinic_room}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Time - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {language === "ar" ? "تاريخ الموعد" : "Appointment Date"}
          </label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={today}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={!selectedDoctor}
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {language === "ar" ? "وقت الموعد" : "Appointment Time"}
          </label>
          <select
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={!appointmentDate || loadingSlots}
          >
            <option value="" className="text-gray-500">
              {!appointmentDate
                ? (language === "ar" ? "اختر التاريخ أولاً" : "Select date first")
                : loadingSlots
                ? (language === "ar" ? "جاري التحميل..." : "Loading...")
                : availableSlots.length === 0
                ? (language === "ar" ? "لا توجد أوقات متاحة" : "No available times")
                : (language === "ar" ? "اختر الوقت" : "Select Time")}
            </option>
            {availableSlots.map((slot, index) => (
              <option key={`${slot.start}-${slot.end}-${index}`} value={slot.start} className="text-gray-900 py-2">
                {slot.start} - {slot.end}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes - Full width */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={language === "ar" ? "أي ملاحظات إضافية" : "Any additional notes"}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white"
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-base font-medium"
        >
          {language === "ar" ? "مسح" : "Clear"}
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loadingDoctors || loadingSlots}
        >
          {language === "ar" ? "حفظ الموعد" : "Save Appointment"}
        </button>
      </div>
    </form>
  );
}
