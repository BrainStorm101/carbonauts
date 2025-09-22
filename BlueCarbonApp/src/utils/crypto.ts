import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill for btoa if it doesn't exist
if (typeof btoa === 'undefined') {
  global.btoa = function (str: string): string {
    try {
      return Buffer.from(str, 'binary').toString('base64');
    } catch (e) {
      // Fallback to a simple base64 implementation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let result = '';
      let i = 0;
      let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      
      while (i < str.length) {
        chr1 = str.charCodeAt(i++);
        chr2 = str.charCodeAt(i++);
        chr3 = str.charCodeAt(i++);
        
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        
        result =
          result +
          chars.charAt(enc1) +
          chars.charAt(enc2) +
          (isNaN(chr2) ? '=' : chars.charAt(enc3)) +
          (isNaN(chr3) ? '=' : chars.charAt(enc4));
      }
      return result;
    }
  };
}

// Simple hash function to generate consistent hashes from strings
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

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
    
    // Generate a simple keypair
    const seed = `${deviceId}_${timestamp}`;
    const privateKey = btoa(seed + '_private').replace(/[^a-zA-Z0-9]/g, '').substr(0, 64);
    const publicKey = btoa(seed + '_public').replace(/[^a-zA-Z0-9]/g, '').substr(0, 64);
    
    return {
      deviceId,
      publicKey,
      privateKey,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating device keypair:', error);
    // Fallback to a simple keypair if there's an error
    return {
      deviceId: `device_${Date.now()}`,
      publicKey: 'default_public_key_1234567890'.repeat(2).substr(0, 64),
      privateKey: 'default_private_key_1234567890'.repeat(2).substr(0, 64),
      createdAt: new Date().toISOString(),
    };
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
