
import { Appointment, AppointmentStatus } from "@/types/appointment";

export interface ApiAppointment {
  appointment_id?: number;
  id?: number;
  clinic_id: number;
  doctor_id: number;
  patient_id: number;
  appointment_date?: string;
  date?: string;
  time?: string;
  status: string; // "Requested", "Approved", ...
  notes?: string;
  created_at?: string;
  updated_at?: string;
  patient?: {
    patient_id: number;
    user_id: number;
    user: {
      user_id: number;
      name: string;
      email: string;
      phone?: string;
    };
    name?: string;
  };
  clinic?: {
    clinic_id: number;
    id?: number;
    name: string;
  };
}

export function mapAppointmentFromApi(a: ApiAppointment): Appointment {
  const normalizedStatus = (a.status || "").toLowerCase() as AppointmentStatus;

  const dateTime =
    a.appointment_date ??
    (a.date && a.time ? `${a.date}T${a.time}` : a.date ?? undefined);

  return {
    id: a.appointment_id ?? a.id ?? 0,
    clinicId: a.clinic_id ?? a.clinic?.id ?? 0,
    doctorId: a.doctor_id,
    patientId: a.patient_id,
    dateTime,
    status: normalizedStatus,
    notes: a.notes,
    patientName:
      a.patient?.user?.name ??
      a.patient?.name ??
      (a as any)?.patient_name ??
      "Unknown",
    patientPhone:
      a.patient?.user?.phone ??
      (a as any)?.patient_phone,
    clinicName: a.clinic?.name,
  };
}
