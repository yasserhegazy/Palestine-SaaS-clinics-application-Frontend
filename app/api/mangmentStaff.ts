import axios, { AxiosRequestConfig } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export type StaffType = {
  user_id: number;
  clinic_id?: number;
  name: string;
  email: string;
  phone: string;
  role: "Doctor" | "Secretary";
  status?: string;
  specialization?: string;
  available_days?: string;
  clinic_room?: string;
  created_at?: string;
};

const getAuthHeader = (token?: string): AxiosRequestConfig => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  },
});

export const getStaffList = async (token?: string): Promise<StaffType[]> => {
  const res = await axios.get(`${API_BASE}/manager/staff`, getAuthHeader(token));
  const payload = (res.data as any)?.data ?? res.data;
  const list = Array.isArray(payload) ? payload : payload?.members ?? [];
  // Flatten doctor details if present
  return list.map((s: any) => ({
    user_id: s.user_id,
    clinic_id: s.clinic_id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    status: s.status,
    specialization: s.doctor?.specialization ?? s.specialization,
    available_days: s.doctor?.available_days ?? s.available_days,
    clinic_room: s.doctor?.clinic_room ?? s.clinic_room,
    created_at: s.created_at,
    // keeping doctor payload in case UI needs it
    doctor: s.doctor,
  }));
};

export const updateStaff = async (staff: StaffType, token?: string): Promise<StaffType> => {
  const { user_id, ...payload } = staff;
  const res = await axios.put(`${API_BASE}/manager/staff/${user_id}`, payload, getAuthHeader(token));
  return (res.data as any)?.data ?? res.data?.user ?? res.data;
};

export const deleteStaff = async (user_id: number, token?: string): Promise<void> => {
  await axios.delete(`${API_BASE}/manager/staff/${user_id}`, getAuthHeader(token));
};
