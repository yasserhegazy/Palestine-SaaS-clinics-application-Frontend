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

export const getClinicStats = async (token: string): Promise<ClinicStats> => {
  const response = await fetch('http://127.0.0.1:8000/api/manager/dashboard/stats', {
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

  return await response.json();
};
