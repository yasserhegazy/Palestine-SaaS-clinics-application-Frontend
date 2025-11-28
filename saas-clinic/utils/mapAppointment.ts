
import { Appointment, AppointmentStatus } from "@/types/appointment";

export interface ApiAppointment {
  appointment_id: number;
  clinic_id: number;
  doctor_id: number;
  patient_id: number;
  appointment_date: string;
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
  };
  clinic?: {
    clinic_id: number;
    name: string;
  };
}

export function mapAppointmentFromApi(a: ApiAppointment): Appointment {
  const normalizedStatus = (a.status || "").toLowerCase() as AppointmentStatus;

  return {
    id: a.appointment_id,
    clinicId: a.clinic_id,
    doctorId: a.doctor_id,
    patientId: a.patient_id,
    dateTime: a.appointment_date,
    status: normalizedStatus,
    notes: a.notes,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    patientName: a.patient?.user?.name ?? "Unknown",
    patientPhone: a.patient?.user?.phone,
    clinicName: a.clinic?.name,
  };
}
