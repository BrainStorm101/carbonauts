import AsyncStorage from '@react-native-async-storage/async-storage';
// import DeviceInfo from 'react-native-device-info';
// import CryptoJS from 'react-native-crypto-js';

interface DeviceKeypair {
  deviceId: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

export const generateDeviceKeypair = async (): Promise<DeviceKeypair> => {
  try {
    // Generate a simple device ID using timestamp and random values
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now().toString();
    
    // Generate a simple keypair using basic crypto (in production, use proper cryptographic libraries)
    const seed = `${deviceId}_${timestamp}`;
    const privateKey = btoa(seed + '_private').replace(/[^a-zA-Z0-9]/g, '').substr(0, 64);
    const publicKey = btoa(privateKey + '_public').replace(/[^a-zA-Z0-9]/g, '').substr(0, 64);
    
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
    // Simple signature using base64 encoding (in production, use proper HMAC)
    const signature = btoa(`${dataString}_${keypair.privateKey}`).substr(0, 32);
    
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
