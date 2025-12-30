
export type AppointmentStatus =
  | "requested"
  | "rejected" 
  | "rescheduled"
  | "approved"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: number;
  dateTime?: string | null;
  status: string;
  notes?: string | null;

  patientName?: string | null;
  patientPhone?: string | null;
  clinicName?: string | null;

  clinicId?: number | null;
  doctorId?: number | null;
  patientId?: number | null;
}
