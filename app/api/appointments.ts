import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  clinic_room?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

/**
 * Get all doctors in the clinic
 */
export async function getAllDoctors(token: string): Promise<Doctor[]> {
  const config: AxiosRequestConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };
  
  const response = await axios.get(`${API_BASE}/clinic/doctors`, config);
  return response.data.data || [];
}

/**
 * Get available time slots for a doctor on a specific date
 */
export async function getAvailableTimeSlots(
  token: string,
  doctorId: number,
  date: string
): Promise<TimeSlot[]> {
  try {
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${token}` },
      params: { date },
    };
    
    console.log('Fetching time slots:', { doctorId, date, url: `${API_BASE}/clinic/doctors/${doctorId}/time-slots` });
    
    const response = await axios.get(
      `${API_BASE}/clinic/doctors/${doctorId}/time-slots`,
      config
    );
    
    console.log('Time slots response:', response.data);
    const payload = (response.data as any)?.data ?? response.data;
    return payload?.available_slots || [];
  } catch (error: any) {
    console.error('Error fetching time slots:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      doctorId,
      date
    });
    throw error;
  }
}
