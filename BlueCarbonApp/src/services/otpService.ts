import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OTPData {
  otp: string;
  phone: string;
  timestamp: number;
  attempts: number;
}

const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

export class OTPService {
  private static instance: OTPService;
  
  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  async generateOTP(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phone: string): Promise<void> {
    try {
      // Validate phone number format
      const phoneRegex = /^[+]?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }

      // Generate OTP
      const otp = await this.generateOTP();
      const timestamp = Date.now();
      
      // Store OTP data
      const otpData: OTPData = {
        otp,
        phone: phone.trim(),
        timestamp,
        attempts: 0,
      };
      
      await AsyncStorage.setItem('otp_data', JSON.stringify(otpData));
      
      console.log(`📱 OTP sent to ${phone}: ${otp}`);
      
      // In production, integrate with SMS service:
      // - Twilio
      // - AWS SNS
      // - Firebase Auth
      // - Custom SMS gateway
      
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      throw error;
    }
  }

  async verifyOTP(phone: string, inputOTP: string): Promise<boolean> {
    try {
      const otpDataString = await AsyncStorage.getItem('otp_data');
      if (!otpDataString) {
        throw new Error('No OTP found. Please request a new OTP.');
      }

      const otpData: OTPData = JSON.parse(otpDataString);
      
      // Check if phone number matches
      if (otpData.phone !== phone.trim()) {
        throw new Error('Phone number mismatch. Please request a new OTP.');
      }

      // Check if OTP has expired
      const timeDiff = Date.now() - otpData.timestamp;
      if (timeDiff > OTP_EXPIRY_TIME) {
        await this.clearOTP();
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Check attempt limit
      if (otpData.attempts >= MAX_ATTEMPTS) {
        await this.clearOTP();
        throw new Error('Too many failed attempts. Please request a new OTP.');
      }

      // Verify OTP
      if (otpData.otp !== inputOTP.trim()) {
        // Increment attempt count
        otpData.attempts += 1;
        await AsyncStorage.setItem('otp_data', JSON.stringify(otpData));
        
        const remainingAttempts = MAX_ATTEMPTS - otpData.attempts;
        throw new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
      }

      // OTP is valid, clear the data
      await this.clearOTP();
      return true;
      
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw error;
    }
  }

  async clearOTP(): Promise<void> {
    try {
      await AsyncStorage.removeItem('otp_data');
    } catch (error) {
      console.error('Error clearing OTP data:', error);
    }
  }

  async getRemainingTime(): Promise<number> {
    try {
      const otpDataString = await AsyncStorage.getItem('otp_data');
      if (!otpDataString) return 0;

      const otpData: OTPData = JSON.parse(otpDataString);
      const timeDiff = Date.now() - otpData.timestamp;
      const remaining = OTP_EXPIRY_TIME - timeDiff;
      
      return Math.max(0, remaining);
    } catch (error) {
      console.error('Error getting remaining time:', error);
      return 0;
    }
  }

  async getRemainingAttempts(): Promise<number> {
    try {
      const otpDataString = await AsyncStorage.getItem('otp_data');
      if (!otpDataString) return MAX_ATTEMPTS;

      const otpData: OTPData = JSON.parse(otpDataString);
      return Math.max(0, MAX_ATTEMPTS - otpData.attempts);
    } catch (error) {
      console.error('Error getting remaining attempts:', error);
      return MAX_ATTEMPTS;
    }
  }
}

export default OTPService.getInstance();
