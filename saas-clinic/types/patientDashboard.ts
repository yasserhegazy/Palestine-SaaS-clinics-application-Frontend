// types/patientDashboard.ts

export interface DashboardStats {
  upcoming_appointments: number;
  medical_records: number;
    prescriptions: number; 

}

export interface Prescription {
  name: string;
  active: boolean;
  doctor: string;
  issuedAt: string;
}

export interface PatientDashboardData {
  stats: DashboardStats;
  recent_prescriptions: Prescription[];
}

export interface ClinicShort {
  name: string;
}

export interface DoctorUserShort {
  name: string;
}

export interface DoctorShort {
  user: DoctorUserShort;
}

export interface UpcomingAppointment {
  appointment_date: string;
  status: string;
  clinic?: ClinicShort;
  doctor?: DoctorShort;
}
