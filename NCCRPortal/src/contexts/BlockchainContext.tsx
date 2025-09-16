import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  carbonCreditsEarned: number;
  droneDataHash?: string;
  photoHashes: string[];
}

interface Submission {
  id: string;
  projectId: string;
  submittedBy: string;
  plantType: string;
  numberOfSamples: number;
  growthRate: number;
  healthScore: number;
  biomassData: number;
  carbonSequestration: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  carbonCreditsEarned: number;
  dataHash: string;
  photoHashes: string[];
}

interface CarbonCredit {
  id: string;
  projectId: string;
  submissionId?: string;
  creditsAmount: number;
  pricePerCredit: number;
  status: 'PENDING' | 'AVAILABLE' | 'TRANSFERRED' | 'RETIRED';
  issuedAt: string;
  issuedBy: string;
  ownerId: string;
  verifiedBy: string;
  serialNumber: string;
}

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'NGO_OFFICER' | 'COMMUNITY_HEAD' | 'COASTAL_PANCHAYAT';
  walletAddress: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  registeredAt: string;
  location?: {
    state: string;
    district: string;
    village: string;
  };
}

interface BlockchainContextType {
  projects: Project[];
  submissions: Submission[];
  carbonCredits: CarbonCredit[];
  users: User[];
  loading: boolean;
  
  // Project methods
  getAllProjects: () => Promise<void>;
  approveProject: (projectId: string, reviewNotes?: string) => Promise<void>;
  rejectProject: (projectId: string, reviewNotes: string) => Promise<void>;
  
  // Submission methods
  getAllSubmissions: () => Promise<void>;
  approveSubmission: (submissionId: string, creditsAmount: number, reviewNotes?: string) => Promise<void>;
  rejectSubmission: (submissionId: string, reviewNotes: string) => Promise<void>;
  requestAdditionalData: (submissionId: string, requestNotes: string) => Promise<void>;
  
  // Carbon Credit methods
  getAllCarbonCredits: () => Promise<void>;
  mintCarbonCredits: (projectId: string, creditsAmount: number, pricePerCredit: number) => Promise<void>;
  transferCredits: (creditId: string, toAddress: string) => Promise<void>;
  
  // User methods
  getAllUsers: () => Promise<void>;
  approveKYC: (userId: string) => Promise<void>;
  rejectKYC: (userId: string, reason: string) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getAllProjects(),
        getAllSubmissions(),
        getAllCarbonCredits(),
        getAllUsers(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllProjects = async () => {
    try {
      // Simulate API call with demo data
      const demoProjects: Project[] = [
        {
          id: 'proj_001',
          name: 'Sundarbans Mangrove Restoration',
          location: {
            latitude: 21.9497,
            longitude: 88.9468,
            address: 'Sundarbans, West Bengal',
          },
          area: 25.5,
          areaUnit: 'hectares',
          vegetationType: 'MANGROVE',
          saplingsPlanted: 5000,
          plantationDate: '2024-01-15',
          expectedSurvivalRate: 85,
          status: 'PENDING',
          createdBy: 'user_ngo_001',
          createdAt: '2024-01-15T10:30:00Z',
          carbonCreditsEarned: 0,
          photoHashes: ['photo_hash_001', 'photo_hash_002'],
          droneDataHash: 'drone_hash_001',
        },
        {
          id: 'proj_002',
          name: 'Kerala Backwater Seagrass Conservation',
          location: {
            latitude: 9.9312,
            longitude: 76.2673,
            address: 'Kochi, Kerala',
          },
          area: 15.2,
          areaUnit: 'hectares',
          vegetationType: 'SEAGRASS',
          saplingsPlanted: 3000,
          plantationDate: '2024-02-01',
          expectedSurvivalRate: 90,
          status: 'APPROVED',
          createdBy: 'user_community_001',
          createdAt: '2024-02-01T14:20:00Z',
          reviewedBy: 'nccr_verifier_001',
          reviewedAt: '2024-02-05T09:15:00Z',
          reviewNotes: 'Excellent project documentation and location selection.',
          carbonCreditsEarned: 120,
          photoHashes: ['photo_hash_003', 'photo_hash_004'],
        },
        {
          id: 'proj_003',
          name: 'Tamil Nadu Salt Marsh Restoration',
          location: {
            latitude: 11.1271,
            longitude: 79.8378,
            address: 'Puducherry Coast',
          },
          area: 8.7,
          areaUnit: 'hectares',
          vegetationType: 'SALTMARSHES',
          saplingsPlanted: 2000,
          plantationDate: '2024-01-20',
          expectedSurvivalRate: 80,
          status: 'REJECTED',
          createdBy: 'user_panchayat_001',
          createdAt: '2024-01-20T11:45:00Z',
          reviewedBy: 'nccr_verifier_001',
          reviewedAt: '2024-01-25T16:30:00Z',
          reviewNotes: 'Insufficient baseline data and unclear methodology. Please provide more detailed environmental impact assessment.',
          carbonCreditsEarned: 0,
          photoHashes: ['photo_hash_005'],
        },
      ];
      setProjects(demoProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const getAllSubmissions = async () => {
    try {
      const demoSubmissions: Submission[] = [
        {
          id: 'sub_001',
          projectId: 'proj_002',
          submittedBy: 'user_community_001',
          plantType: 'SEAGRASS',
          numberOfSamples: 50,
          growthRate: 92,
          healthScore: 88,
          biomassData: 15.6,
          carbonSequestration: 8.2,
          status: 'UNDER_REVIEW',
          submittedAt: '2024-03-01T10:00:00Z',
          carbonCreditsEarned: 0,
          dataHash: 'data_hash_001',
          photoHashes: ['photo_hash_006', 'photo_hash_007'],
        },
        {
          id: 'sub_002',
          projectId: 'proj_002',
          submittedBy: 'user_community_001',
          plantType: 'SEAGRASS',
          numberOfSamples: 45,
          growthRate: 87,
          healthScore: 85,
          biomassData: 14.2,
          carbonSequestration: 7.8,
          status: 'APPROVED',
          submittedAt: '2024-02-15T14:30:00Z',
          reviewedBy: 'nccr_verifier_001',
          reviewedAt: '2024-02-20T11:20:00Z',
          reviewNotes: 'Good growth rate and health indicators. Credits approved.',
          carbonCreditsEarned: 78,
          dataHash: 'data_hash_002',
          photoHashes: ['photo_hash_008', 'photo_hash_009'],
        },
      ];
      setSubmissions(demoSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const getAllCarbonCredits = async () => {
    try {
      const demoCredits: CarbonCredit[] = [
        {
          id: 'credit_001',
          projectId: 'proj_002',
          submissionId: 'sub_002',
          creditsAmount: 78,
          pricePerCredit: 25.50,
          status: 'AVAILABLE',
          issuedAt: '2024-02-20T12:00:00Z',
          issuedBy: 'nccr_admin_001',
          ownerId: 'user_community_001',
          verifiedBy: 'nccr_verifier_001',
          serialNumber: 'BC-2024-001-078',
        },
        {
          id: 'credit_002',
          projectId: 'proj_002',
          creditsAmount: 42,
          pricePerCredit: 25.50,
          status: 'AVAILABLE',
          issuedAt: '2024-02-05T15:30:00Z',
          issuedBy: 'nccr_admin_001',
          ownerId: 'user_community_001',
          verifiedBy: 'nccr_verifier_001',
          serialNumber: 'BC-2024-001-042',
        },
      ];
      setCarbonCredits(demoCredits);
    } catch (error) {
      console.error('Error fetching carbon credits:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const demoUsers: User[] = [
        {
          id: 'user_ngo_001',
          name: 'Rajesh Kumar',
          phoneNumber: '+91-9876543210',
          role: 'NGO_OFFICER',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          kycStatus: 'VERIFIED',
          registeredAt: '2024-01-10T08:00:00Z',
          location: {
            state: 'West Bengal',
            district: 'South 24 Parganas',
            village: 'Gosaba',
          },
        },
        {
          id: 'user_community_001',
          name: 'Priya Nair',
          phoneNumber: '+91-9876543211',
          role: 'COMMUNITY_HEAD',
          walletAddress: '0x2345678901bcdef12345678901bcdef123456789',
          kycStatus: 'VERIFIED',
          registeredAt: '2024-01-12T10:30:00Z',
          location: {
            state: 'Kerala',
            district: 'Ernakulam',
            village: 'Kumbakonam',
          },
        },
        {
          id: 'user_panchayat_001',
          name: 'Suresh Reddy',
          phoneNumber: '+91-9876543212',
          role: 'COASTAL_PANCHAYAT',
          walletAddress: '0x3456789012cdef123456789012cdef1234567890',
          kycStatus: 'PENDING',
          registeredAt: '2024-01-18T12:15:00Z',
          location: {
            state: 'Tamil Nadu',
            district: 'Puducherry',
            village: 'Marakkanam',
          },
        },
      ];
      setUsers(demoUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const approveProject = async (projectId: string, reviewNotes?: string) => {
    try {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status: 'APPROVED',
              reviewedBy: 'nccr_verifier_001',
              reviewedAt: new Date().toISOString(),
              reviewNotes: reviewNotes || 'Project approved for carbon credit generation.',
            }
          : project
      ));
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const rejectProject = async (projectId: string, reviewNotes: string) => {
    try {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status: 'REJECTED',
              reviewedBy: 'nccr_verifier_001',
              reviewedAt: new Date().toISOString(),
              reviewNotes,
            }
          : project
      ));
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const approveSubmission = async (submissionId: string, creditsAmount: number, reviewNotes?: string) => {
    try {
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: 'APPROVED',
              reviewedBy: 'nccr_verifier_001',
              reviewedAt: new Date().toISOString(),
              reviewNotes: reviewNotes || 'Submission approved and credits awarded.',
              carbonCreditsEarned: creditsAmount,
            }
          : submission
      ));
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const rejectSubmission = async (submissionId: string, reviewNotes: string) => {
    try {
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: 'REJECTED',
              reviewedBy: 'nccr_verifier_001',
              reviewedAt: new Date().toISOString(),
              reviewNotes,
            }
          : submission
      ));
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  const requestAdditionalData = async (submissionId: string, requestNotes: string) => {
    try {
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: 'PENDING',
              reviewNotes: `Additional data requested: ${requestNotes}`,
            }
          : submission
      ));
    } catch (error) {
      console.error('Error requesting additional data:', error);
    }
  };

  const mintCarbonCredits = async (projectId: string, creditsAmount: number, pricePerCredit: number) => {
    try {
      const newCredit: CarbonCredit = {
        id: `credit_${Date.now()}`,
        projectId,
        creditsAmount,
        pricePerCredit,
        status: 'AVAILABLE',
        issuedAt: new Date().toISOString(),
        issuedBy: 'nccr_admin_001',
        ownerId: projects.find(p => p.id === projectId)?.createdBy || '',
        verifiedBy: 'nccr_verifier_001',
        serialNumber: `BC-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      };
      setCarbonCredits(prev => [...prev, newCredit]);
    } catch (error) {
      console.error('Error minting carbon credits:', error);
    }
  };

  const transferCredits = async (creditId: string, toAddress: string) => {
    try {
      setCarbonCredits(prev => prev.map(credit => 
        credit.id === creditId 
          ? { ...credit, status: 'TRANSFERRED', ownerId: toAddress }
          : credit
      ));
    } catch (error) {
      console.error('Error transferring credits:', error);
    }
  };

  const approveKYC = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, kycStatus: 'VERIFIED' }
          : user
      ));
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const rejectKYC = async (userId: string, reason: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, kycStatus: 'REJECTED' }
          : user
      ));
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  const value: BlockchainContextType = {
    projects,
    submissions,
    carbonCredits,
    users,
    loading,
    getAllProjects,
    approveProject,
    rejectProject,
    getAllSubmissions,
    approveSubmission,
    rejectSubmission,
    requestAdditionalData,
    getAllCarbonCredits,
    mintCarbonCredits,
    transferCredits,
    getAllUsers,
    approveKYC,
    rejectKYC,
  };

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
};
