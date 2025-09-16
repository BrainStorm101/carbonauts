import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'react-native-crypto-js';

interface DeviceKeypair {
  deviceId: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

export const generateDeviceKeypair = async (): Promise<DeviceKeypair> => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const timestamp = Date.now().toString();
    
    // Generate a simple keypair (in production, use proper cryptographic libraries)
    const seed = `${deviceId}_${timestamp}`;
    const privateKey = CryptoJS.SHA256(seed).toString();
    const publicKey = CryptoJS.SHA256(privateKey + 'public').toString();
    
    return {
      deviceId,
      publicKey,
      privateKey,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating device keypair:', error);
    throw error;
  }
};

export const storeKeypair = async (keypair: DeviceKeypair): Promise<void> => {
  try {
    await AsyncStorage.setItem('device_keypair', JSON.stringify(keypair));
  } catch (error) {
    console.error('Error storing keypair:', error);
    throw error;
  }
};

export const getKeypair = async (): Promise<DeviceKeypair | null> => {
  try {
    const keypairData = await AsyncStorage.getItem('device_keypair');
    return keypairData ? JSON.parse(keypairData) : null;
  } catch (error) {
    console.error('Error getting keypair:', error);
    return null;
  }
};

export const signData = async (data: any): Promise<string> => {
  try {
    const keypair = await getKeypair();
    if (!keypair) {
      throw new Error('No device keypair found');
    }
    
    const dataString = JSON.stringify(data);
    const signature = CryptoJS.HmacSHA256(dataString, keypair.privateKey).toString();
    
    return signature;
  } catch (error) {
    console.error('Error signing data:', error);
    throw error;
  }
};

export const verifySignature = async (data: any, signature: string, publicKey: string): Promise<boolean> => {
  try {
    const dataString = JSON.stringify(data);
    // In production, implement proper signature verification
    return signature.length > 0 && publicKey.length > 0;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};
