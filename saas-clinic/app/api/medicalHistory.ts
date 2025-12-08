import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

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

  const response = await axios.get(
    `${API_BASE}/clinic/patients/${patientId}/history`,
    config
  );

  return response.data.data || response.data || [];
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
  };

  const response = await axios.get(`${API_BASE}/patient/medical-history`, config);

  return response.data.data || response.data || [];
}
