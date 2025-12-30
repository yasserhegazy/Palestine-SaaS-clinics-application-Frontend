import axios, { AxiosRequestConfig } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export type Visit = {
  date: string;
  clinic: string;
  diagnosis: string;
  doctor: string;
};

/**
 * Fetch medical history for a specific patient (used by doctors/clinic staff)
 * @param patientId - The ID of the patient
 * @param token - Authentication token
 * @returns Array of Visit objects
 */
export async function getPatientMedicalHistory(
  patientId: number,
  token: string
): Promise<Visit[]> {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(
      `${API_BASE}/clinic/patients/${patientId}/history`,
      config
    );

    const payload = (response.data as any)?.data ?? response.data;
    const medicalHistory = Array.isArray(payload?.medical_history)
      ? payload.medical_history
      : Array.isArray(payload?.history)
      ? payload.history
      : Array.isArray(payload?.medicalHistory)
      ? payload.medicalHistory
      : Array.isArray(payload)
      ? payload
      : [];
    
    // Transform backend data to Visit format
    return medicalHistory.map((record: any) => ({
      date: record.visit_date || record.date || record.created_at?.split('T')[0] || 'N/A',
      clinic: record.clinic_name || record.clinic || 'Clinic',
      diagnosis: record.diagnosis || record.notes || 'No diagnosis recorded',
      doctor: record.doctor_name || record.doctor || 'Unknown Doctor',
    }));
  } catch (error) {
    console.error('Error fetching patient medical history:', error);
    return [];
  }
}

/**
 * Fetch medical history for the currently authenticated patient
 * @param token - Authentication token
 * @returns Array of Visit objects
 */
export async function getMyMedicalHistory(token: string): Promise<Visit[]> {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  };

  try {
    const response = await axios.get(`${API_BASE}/patient/medical-history`, config);

    if (response.status >= 400) {
      console.error("Failed to fetch my medical history:", response.status, response.data);
      return [];
    }

    const payload = (response.data as any)?.data ?? response.data;
    const history = Array.isArray(payload?.medical_history)
      ? payload.medical_history
      : Array.isArray(payload)
      ? payload
      : [];

    return history.map((record: any) => ({
      date: record.visit_date || record.date || record.created_at?.split("T")[0] || "N/A",
      clinic: record.clinic_name || record.clinic || "Clinic",
      diagnosis: record.diagnosis || record.notes || "No diagnosis recorded",
      doctor: record.doctor_name || record.doctor || "Unknown Doctor",
    }));
  } catch (error) {
    console.error("Error fetching my medical history:", error);
    return [];
  }
}
