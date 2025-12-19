/**
 * API helper for clinic dashboard stats
 */

export interface ClinicStats {
  employees_count: number;
  today_appointments_count: number;
  total_patients_count: number;
  monthly_revenue: number;
  active_doctors_count: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const getClinicStats = async (token: string): Promise<ClinicStats> => {
  const response = await fetch(`${API_BASE}/manager/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    // Log the actual error for debugging
    const errorText = await response.text();
    console.error('Fetch stats failed:', response.status, errorText);
    throw new Error(`Failed to fetch clinic stats: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const payload = (json as any)?.data ?? json;

  const monthlyRevenue = payload?.monthly_revenue;

  return {
    employees_count: payload?.employees_count ?? 0,
    today_appointments_count: payload?.today_appointments_count ?? 0,
    total_patients_count: payload?.total_patients_count ?? 0,
    monthly_revenue:
      typeof monthlyRevenue === 'string'
        ? Number(monthlyRevenue)
        : monthlyRevenue ?? 0,
    active_doctors_count: payload?.active_doctors_count ?? 0,
  };
};
