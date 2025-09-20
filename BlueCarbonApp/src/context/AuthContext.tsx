import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateDeviceKeypair, storeKeypair} from '../utils/crypto';
import { Alert, Platform } from 'react-native';

// Polyfill for btoa in React Native
if (typeof btoa === 'undefined') {
  global.btoa = function(str: string) {
    try {
      return Buffer.from(str, 'binary').toString('base64');
    } catch (err) {
      // If Buffer is not available (in some React Native environments)
      return str;
    }
  };
}

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;  // Added email field
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
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
      console.log('🔍 Checking authentication status...');
      const userData = await AsyncStorage.getItem('user');
      console.log('📱 Retrieved user data from storage:', userData ? 'exists' : 'not found');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('👤 Parsed user data:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('🔐 No user found - not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed sendOTP as we're using email/password now

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login with:', { email });
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty email and password
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create a demo user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'Demo User',
        phone: '1234567890',
        email: email,
        role: 'NGO_OFFICER',
        organization: 'Demo Organization',
        coastalZone: 'Demo Coastal Zone',
        language: 'en',
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        kycStatus: 'PENDING',
        deviceId: `device_${Date.now()}`,
      };
      
      // Save user to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // Update user state to trigger re-render and navigation
      setUser(newUser);
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('❌ Login Error', errorMessage);
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

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    // Removed sendOTP as we're using email/password now
  }), [user, isLoading, login, logout, updateProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
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
