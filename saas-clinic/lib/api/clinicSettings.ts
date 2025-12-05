/**
 * API helper for clinic settings
 * Calls the Next.js API routes in /app/api/clinic/settings
 */

export type ClinicSettings = {
  clinic_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_path?: string;
  logo_url?: string;
  subscription_plan: 'Basic' | 'Standard' | 'Premium';
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
};

export type UpdateClinicSettingsPayload = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  subscription_plan?: 'Basic' | 'Standard' | 'Premium';
  status?: 'Active' | 'Inactive';
};

/**
 * Fetch clinic settings from the API route
 */
export async function getClinicSettings(): Promise<ClinicSettings> {
  const response = await fetch('/api/clinic/settings', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch clinic settings');
  }

  const data = await response.json();
  return data.clinic;
}

/**
 * Update clinic settings via the API route
 */
export async function updateClinicSettings(
  payload: UpdateClinicSettingsPayload
): Promise<ClinicSettings> {
  const response = await fetch('/api/clinic/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update clinic settings');
  }

  const data = await response.json();
  return data.clinic;
}
