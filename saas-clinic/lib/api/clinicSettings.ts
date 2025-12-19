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
  logo?: File | null;
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
  // Laravel returns { success, message, data: {...settings} }
  return (data as any)?.data ?? (data as any)?.clinic ?? data;
}

/**
 * Update clinic settings via the API route
 */
export async function updateClinicSettings(
  payload: UpdateClinicSettingsPayload
): Promise<ClinicSettings> {
  const formData = new FormData();

  if (payload.name) formData.append('name', payload.name);
  if (payload.address) formData.append('address', payload.address);
  if (payload.phone) formData.append('phone', payload.phone);
  if (payload.email) formData.append('email', payload.email);
  if (payload.subscription_plan) formData.append('subscription_plan', payload.subscription_plan);
  if (payload.status) formData.append('status', payload.status);
  if (payload.logo) formData.append('logo', payload.logo);
  
  // Debug: log what we're sending
  console.log('Sending update with:', {
    name: payload.name,
    address: payload.address,
    phone: payload.phone,
    email: payload.email,
    subscription_plan: payload.subscription_plan,
    status: payload.status,
    hasLogo: !!payload.logo,
  });

  const response = await fetch('/api/clinic/settings', {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    
    // If there are validation errors, show them
    if (error.errors) {
      const errorMessages = Object.values(error.errors).flat().join(', ');
      throw new Error(errorMessages);
    }
    
    throw new Error(error.message || 'Failed to update clinic settings');
  }

  const data = await response.json();
  console.log('Update response:', data);
  
  const payloadResponse = (data as any)?.data ?? (data as any)?.clinic ?? data;
  return payloadResponse;
}

/**
 * Fetch clinic logo URL
 */
export async function getClinicLogo(): Promise<{ logo_path: string | null; logo_url: string | null }> {
  const response = await fetch('/api/clinic/logo', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.warn('Rate limited while fetching clinic logo; using null logo to avoid UI break.');
      return { logo_path: null, logo_url: null };
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch clinic logo');
  }

  const data = await response.json();
  const payload = (data as any)?.data ?? data;
  return {
    logo_path: payload.logo_path ?? null,
    logo_url: payload.logo_url ?? null,
  };
}
