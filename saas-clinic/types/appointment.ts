
export type AppointmentStatus =
  | "requested"
  | "rejected" 
  | "rescheduled"
  | "approved"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: number;
  clinicId: number;
  doctorId: number;
  patientId: number;
  dateTime: string; // ISO from backend (appointment_date)
  status: AppointmentStatus; // normalized to lowercase
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // derived / nested fields
  patientName: string;
  patientPhone?: string;
  clinicName?: string;
}
