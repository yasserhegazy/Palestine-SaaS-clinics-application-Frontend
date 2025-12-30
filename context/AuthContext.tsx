'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import apiClient, { API_ENDPOINTS } from '@/lib/api';
import { 
  AuthContextType, 
  User, 
  LoginResponse
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user data from cookies on mount
  useEffect(() => {
    const loadAuthData = () => {
      const storedToken = Cookies.get('auth_token');
      const storedUser = Cookies.get('user_data');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData.user);
          setIsPlatformAdmin(userData.is_platform_admin);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // Clear invalid data
          Cookies.remove('auth_token');
          Cookies.remove('user_data');
        }
      }
      
      setIsLoading(false);
    };
    
    loadAuthData();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        login: emailOrPhone,
        password,
      });

      const payload = (response.data as LoginResponse & { data?: LoginResponse }).data ?? response.data;

      const { user: userData, token: authToken, is_platform_admin } = (payload as any) || {};

      if (!userData || !authToken) {
        throw new Error('Invalid login response from server');
      }

      // Store token and user data in cookies (7 days expiry)
      Cookies.set('auth_token', authToken, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });
      
      Cookies.set('user_data', JSON.stringify({
        user: userData,
        is_platform_admin
      }), { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });

      // Update state
      setUser(userData);
      setToken(authToken);
      setIsPlatformAdmin(is_platform_admin);

      // Role-based routing
      if (is_platform_admin) {
        router.push('/platform/dashboard');
      } else {
        switch (userData.role) {
          case 'Manager':
            router.push('/clinic/dashboard');
            break;
          case 'Doctor':
            router.push('/doctor/dashboard');
            break;
          case 'Secretary':
            router.push('/reception/dashboard');
            break;
          case 'Patient':
            router.push('/patient/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (error: unknown) {
      // Clear any existing auth data on login failure
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      setUser(null);
      setToken(null);
      setIsPlatformAdmin(false);
      
      throw error;
    }
  };

  const logout = (): void => {
    // Clear cookies
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    
    // Clear state
    setUser(null);
    setToken(null);
    setIsPlatformAdmin(false);
    
    // Redirect to login
    router.push('/login');
  };

  const checkAuth = (): boolean => {
    return !!token && !!user;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isPlatformAdmin,
    clinic: user?.clinic || null,
    role: user?.role || null,
    login,
    logout,
    checkAuth,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
