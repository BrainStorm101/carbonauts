import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateDeviceKeypair, storeKeypair} from '../utils/crypto';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'NGO_OFFICER' | 'COMMUNITY_HEAD' | 'COASTAL_PANCHAYAT';
  organization: string;
  coastalZone: string;
  language: string;
  walletAddress: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  deviceId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    // Simulate OTP sending
    console.log(`Sending OTP to ${phone}`);
    // In real implementation, call your OTP service
  };

  const login = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      
      // Simulate OTP verification
      if (otp !== '123456') {
        throw new Error('Invalid OTP');
      }

      // Generate device keypair on first login
      const keypair = await generateDeviceKeypair();
      await storeKeypair(keypair);

      // Create user object (in real app, fetch from backend)
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: '',
        phone,
        role: 'NGO_OFFICER',
        organization: '',
        coastalZone: '',
        language: 'en',
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        kycStatus: 'PENDING',
        deviceId: keypair.deviceId,
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = {...user, ...profileData};
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        sendOTP,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
