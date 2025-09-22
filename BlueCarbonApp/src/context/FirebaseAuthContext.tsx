import React, {createContext, useContext, useState, useEffect} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

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
  verificationId: string | null;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        await loadUserProfile(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (firebaseUser: FirebaseAuthTypes.User) => {
    try {
      // Try to load existing user profile from AsyncStorage
      const userData = await AsyncStorage.getItem('user_profile');
      if (userData) {
        const existingUser = JSON.parse(userData);
        setUser(existingUser);
        return;
      }

      // Create new user profile if none exists
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Demo User',
        phone: firebaseUser.phoneNumber || '',
        role: 'NGO_OFFICER',
        organization: 'Blue Carbon Foundation',
        coastalZone: 'Mumbai Coast',
        language: 'en',
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        kycStatus: 'PENDING',
        deviceId: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      await AsyncStorage.setItem('user_profile', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      setIsLoading(true);
      console.log(`📱 Sending OTP to ${phone}`);

      // Validate phone number format
      const phoneRegex = /^[+]?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }

      // Configure Firebase Auth for phone verification
      const confirmation = await auth().signInWithPhoneNumber(phone);
      
      // Store verification ID for later use
      setVerificationId(confirmation.verificationId);
      
      console.log('✅ OTP sent successfully');
      Alert.alert('Success', 'OTP sent to your phone number');
      
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('invalid-phone-number')) {
          errorMessage = 'Invalid phone number format';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.message.includes('quota-exceeded')) {
          errorMessage = 'SMS quota exceeded. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Verifying OTP:', otp);

      if (!verificationId) {
        throw new Error('No verification ID found. Please request OTP again.');
      }

      // Create credential with verification ID and OTP
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      
      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(credential);
      
      console.log('✅ OTP verification successful');
      Alert.alert('Success', 'Logged in successfully!');
      
      // Clear verification ID
      setVerificationId(null);
      
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('invalid-verification-code')) {
          errorMessage = 'Invalid OTP. Please check and try again.';
        } else if (error.message.includes('invalid-verification-id')) {
          errorMessage = 'OTP has expired. Please request a new one.';
        } else if (error.message.includes('session-expired')) {
          errorMessage = 'Session expired. Please request a new OTP.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('user_profile');
      setUser(null);
      setVerificationId(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = {...user, ...profileData};
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
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
        verificationId,
        sendOTP,
        verifyOTP,
        logout,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};
