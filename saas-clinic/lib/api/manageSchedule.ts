/**
 * API helper for managing doctor schedules
 */

export interface StaffMember {
  user_id: number;
  clinic_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  specialization?: string;
  available_days?: string; // Comma separated days e.g., "Monday,Tuesday"
  clinic_room?: string;
  start_time?: string; // "HH:mm"
  end_time?: string; // "HH:mm"
  slot_duration?: number;
}

export interface UpdateSchedulePayload {
  available_days: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  // Included required fields for update_member validation if necessary, 
  // though typically we only send what changed if the backend supports partials.
  // The backend StaffController::update_member validation requires name, email, phone.
  // We'll need to send those along with the schedule updates.
  name: string;
  email: string;
  phone: string;
}

/**
 * Fetch all staff members (doctors)
 */
export const getDoctors = async (token: string): Promise<StaffMember[]> => {
  const response = await fetch('http://127.0.0.1:8000/api/manager/staff', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch staff members');
  }

  const data = await response.json();
  // Filter only doctors
  return data.members.filter((m: StaffMember) => m.role === 'Doctor');
};

/**
 * Update a doctor's schedule
 */
export const updateDoctorSchedule = async (token: string, userId: number, payload: UpdateSchedulePayload): Promise<StaffMember> => {
  const response = await fetch(`http://127.0.0.1:8000/api/manager/staff/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update schedule');
  }

  const data = await response.json();
  return data.user;
};
