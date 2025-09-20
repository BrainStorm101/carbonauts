import React, {createContext, useContext, useState} from 'react';
import {blockchainService} from '../services/blockchainService';

interface Project {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  area: number;
  areaUnit: 'acres' | 'hectares';
  vegetationType: 'MANGROVE' | 'SEAGRASS' | 'SALTMARSHES' | 'OTHERS';
  saplingsPlanted: number;
  plantationDate: string;
  expectedSurvivalRate: number;
  droneDataHash?: string;
  photoHashes: string[];
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}

interface Submission {
  id: string;
  projectId: string;
  farmerId: string;
  plantType: string;
  numberOfSamples: number;
  imageHashes: string[];
  gpsCoordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceSignature: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewComments?: string;
}

interface CarbonCredit {
  id: string;
  submissionId: string;
  creditsAmount: number;
  pricePerCredit: number;
  status: 'AVAILABLE' | 'FOR_SALE' | 'SOLD' | 'RETIRED';
  ownerId: string;
  mintedAt: string;
}

interface BlockchainContextType {
  projects: Project[];
  submissions: Submission[];
  carbonCredits: CarbonCredit[];
  isLoading: boolean;
  createProject: (projectData: Omit<Project, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  submitFieldData: (submissionData: Omit<Submission, 'id' | 'status' | 'submittedAt'>) => Promise<string>;
  getProjectsByUser: (userId: string) => Promise<Project[]>;
  getSubmissionsByUser: (userId: string) => Promise<Submission[]>;
  getCreditsByUser: (userId: string) => Promise<CarbonCredit[]>;
  syncOfflineData: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createProject = async (projectData: Omit<Project, 'id' | 'status' | 'createdAt'>): Promise<string> => {
    try {
      setIsLoading(true);
      
      const projectId = `proj_${Date.now()}`;
      const newProject: Project = {
        ...projectData,
        id: projectId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      // Store locally first (offline support)
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);

      // Sync to blockchain and NCCR portal
      await blockchainService.createProject(newProject);
      console.log('✅ Project synced to blockchain and NCCR portal');
      
      return projectId;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitFieldData = async (submissionData: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Promise<string> => {
    try {
      setIsLoading(true);
      
      const submissionId = `sub_${Date.now()}`;
      const newSubmission: Submission = {
        ...submissionData,
        id: submissionId,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      // Store locally first (offline support)
      const updatedSubmissions = [...submissions, newSubmission];
      setSubmissions(updatedSubmissions);

      // Sync to blockchain and NCCR portal
      await blockchainService.createSubmission(newSubmission);
      console.log('✅ Submission synced to blockchain and NCCR portal');
      
      return submissionId;
    } catch (error) {
      console.error('Error submitting field data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectsByUser = async (userId: string): Promise<Project[]> => {
    try {
      setIsLoading(true);
      const userProjects = await blockchainService.getProjectsByUser(userId);
      const localProjects = projects.filter(p => p.createdBy === userId);
      const allProjects = [...userProjects, ...localProjects];
      setProjects(userProjects);
      return userProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return projects.filter(p => p.createdBy === userId);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionsByUser = async (userId: string): Promise<Submission[]> => {
    try {
      setIsLoading(true);
      const userSubmissions = await blockchainService.getSubmissionsByUser(userId);
      const localSubmissions = submissions.filter(s => s.farmerId === userId);
      const allSubmissions = [...userSubmissions, ...localSubmissions];
      setSubmissions(userSubmissions);
      return userSubmissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return submissions.filter(s => s.farmerId === userId);
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditsByUser = async (userId: string): Promise<CarbonCredit[]> => {
    try {
      setIsLoading(true);
      const userCredits = await blockchainService.getCreditsByUser(userId);
      const localCredits = carbonCredits.filter(c => c.ownerId === userId);
      const allCredits = [...userCredits, ...localCredits];
      setCarbonCredits(userCredits);
      return userCredits;
    } catch (error) {
      console.error('Error fetching credits:', error);
      return carbonCredits.filter(c => c.ownerId === userId);
    } finally {
      setIsLoading(false);
    }
  };

  const syncOfflineData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await blockchainService.syncOfflineData();
      console.log('✅ Offline data synced to blockchain and NCCR portal');
      // Refresh all data after sync
      // Implementation depends on current user
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        projects,
        submissions,
        carbonCredits,
        isLoading,
        createProject,
        submitFieldData,
        getProjectsByUser,
        getSubmissionsByUser,
        getCreditsByUser,
        syncOfflineData,
      }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
};
