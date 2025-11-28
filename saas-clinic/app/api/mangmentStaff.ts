import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

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
  const res = await axios.get(`${API_BASE}/clinic/staff`, getAuthHeader(token));
  console.log("API Response:", res.data); 
  return res.data?.members || [];
};

export const updateStaff = async (staff: StaffType, token?: string): Promise<StaffType> => {
  const { user_id, ...payload } = staff;
  const res = await axios.put(`${API_BASE}/clinic/staff/${user_id}`, payload, getAuthHeader(token));
  return res.data?.user;
};


export const deleteStaff = async (user_id: number, token?: string): Promise<void> => {
  await axios.delete(`${API_BASE}/clinic/staff/${user_id}`, getAuthHeader(token));
};
