import AsyncStorage from '@react-native-async-storage/async-storage';
import {getKeypair} from '../utils/crypto';

interface BlockchainConfig {
  gatewayUrl: string;
  channelName: string;
  chaincodeName: string;
}

class BlockchainService {
  private config: BlockchainConfig = {
    gatewayUrl: 'http://localhost:7051',
    channelName: 'mychannel',
    chaincodeName: 'bluecarbon',
  };

  async createProject(project: any): Promise<void> {
    try {
      // Store locally for offline support
      await this.storeOfflineData('projects', project);
      
      // Try to sync to blockchain
      if (await this.isOnline()) {
        await this.invokeChaincode('CreateProject', [
          project.id,
          project.name,
          JSON.stringify(project.location),
          JSON.stringify({
            area: project.area,
            unit: project.areaUnit,
            vegetationType: project.vegetationType,
          }),
          project.saplingsPlanted.toString(),
          project.createdBy,
        ]);
      }
    } catch (error) {
      console.error('Blockchain service error:', error);
      // Continue with offline storage even if blockchain fails
    }
  }

  async createSubmission(submission: any): Promise<void> {
    try {
      // Store locally for offline support
      await this.storeOfflineData('submissions', submission);
      
      // Try to sync to blockchain
      if (await this.isOnline()) {
        const keypair = await getKeypair();
        const signature = await this.signData(submission, keypair.privateKey);
        
        await this.invokeChaincode('CreateSubmission', [
          submission.id,
          submission.farmerId,
          submission.projectId,
          submission.plantType,
          submission.numberOfSamples.toString(),
          JSON.stringify(submission.imageHashes),
          JSON.stringify(submission.gpsCoordinates),
          signature,
        ]);
      }
    } catch (error) {
      console.error('Blockchain service error:', error);
    }
  }

  async getProjectsByUser(userId: string): Promise<any[]> {
    try {
      if (await this.isOnline()) {
        return await this.queryChaincode('QueryProjectsByUser', [userId]);
      } else {
        return await this.getOfflineData('projects', userId);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      return await this.getOfflineData('projects', userId);
    }
  }

  async getSubmissionsByUser(userId: string): Promise<any[]> {
    try {
      if (await this.isOnline()) {
        return await this.queryChaincode('QuerySubmissionsByFarmer', [userId]);
      } else {
        return await this.getOfflineData('submissions', userId);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return await this.getOfflineData('submissions', userId);
    }
  }

  async getCreditsByUser(userId: string): Promise<any[]> {
    try {
      if (await this.isOnline()) {
        return await this.queryChaincode('QueryCreditsByUser', [userId]);
      } else {
        return await this.getOfflineData('credits', userId);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      return await this.getOfflineData('credits', userId);
    }
  }

  async syncOfflineData(): Promise<void> {
    try {
      if (!(await this.isOnline())) {
        throw new Error('No internet connection');
      }

      // Sync projects
      const offlineProjects = await AsyncStorage.getItem('offline_projects');
      if (offlineProjects) {
        const projects = JSON.parse(offlineProjects);
        for (const project of projects) {
          await this.createProject(project);
        }
        await AsyncStorage.removeItem('offline_projects');
      }

      // Sync submissions
      const offlineSubmissions = await AsyncStorage.getItem('offline_submissions');
      if (offlineSubmissions) {
        const submissions = JSON.parse(offlineSubmissions);
        for (const submission of submissions) {
          await this.createSubmission(submission);
        }
        await AsyncStorage.removeItem('offline_submissions');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
  }

  private async storeOfflineData(type: string, data: any): Promise<void> {
    try {
      const key = `offline_${type}`;
      const existing = await AsyncStorage.getItem(key);
      const items = existing ? JSON.parse(existing) : [];
      items.push(data);
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  private async getOfflineData(type: string, userId?: string): Promise<any[]> {
    try {
      const key = `offline_${type}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];
      
      const items = JSON.parse(data);
      return userId ? items.filter((item: any) => 
        item.createdBy === userId || item.farmerId === userId || item.ownerId === userId
      ) : items;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  }

  private async isOnline(): Promise<boolean> {
    try {
      // Simple connectivity check
      const response = await fetch(this.config.gatewayUrl, {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async invokeChaincode(functionName: string, args: string[]): Promise<any> {
    // Simulate blockchain invocation
    console.log(`Invoking ${functionName} with args:`, args);
    
    // In real implementation, this would connect to Fabric Gateway
    return new Promise((resolve) => {
      setTimeout(() => resolve({}), 1000);
    });
  }

  private async queryChaincode(functionName: string, args: string[]): Promise<any> {
    // Simulate blockchain query
    console.log(`Querying ${functionName} with args:`, args);
    
    // In real implementation, this would connect to Fabric Gateway
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1000);
    });
  }

  private async signData(data: any, privateKey: string): Promise<string> {
    // Simulate data signing with device private key
    const dataString = JSON.stringify(data);
    return `signature_${Buffer.from(dataString).toString('base64').slice(0, 20)}`;
  }
}

export const blockchainService = new BlockchainService();
