export type UserRole = 'Admin' | 'Manager' | 'Doctor' | 'Secretary' | 'Patient';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface Clinic {
  clinic_id: number;
  name: string;
  address: string;
  logo?: string;
}

export interface User {
  user_id: number;
  clinic_id: number | null;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  clinic?: Clinic;
}

export type LoginRequest = {
  login: string;
  password: string;
};

export interface LoginData {
  user: User;
  token: string;
  role: UserRole;
  is_platform_admin: boolean;
}

export type LoginResponse =
  | LoginData
  | {
      success?: boolean;
      message?: string;
      data?: LoginData;
    };

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  clinic: Clinic | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  isLoading: boolean;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
