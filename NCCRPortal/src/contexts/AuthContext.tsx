import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VERIFIER' | 'ANALYST';
  permissions: string[];
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nccr_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('nccr_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call with demo credentials
      if (email === 'admin@nccr.gov.in' && password === 'admin123') {
        const demoUser: User = {
          id: 'nccr_admin_001',
          email: 'admin@nccr.gov.in',
          name: 'NCCR Administrator',
          role: 'ADMIN',
          permissions: ['VIEW_ALL', 'APPROVE_PROJECTS', 'MANAGE_USERS', 'MINT_CREDITS', 'VIEW_ANALYTICS'],
          lastLogin: new Date().toISOString(),
        };
        
        setUser(demoUser);
        localStorage.setItem('nccr_user', JSON.stringify(demoUser));
        return true;
      } else if (email === 'verifier@nccr.gov.in' && password === 'verify123') {
        const demoUser: User = {
          id: 'nccr_verifier_001',
          email: 'verifier@nccr.gov.in',
          name: 'MRV Verifier',
          role: 'VERIFIER',
          permissions: ['VIEW_PROJECTS', 'VERIFY_SUBMISSIONS', 'REQUEST_DATA'],
          lastLogin: new Date().toISOString(),
        };
        
        setUser(demoUser);
        localStorage.setItem('nccr_user', JSON.stringify(demoUser));
        return true;
      } else if (email === 'analyst@nccr.gov.in' && password === 'analyze123') {
        const demoUser: User = {
          id: 'nccr_analyst_001',
          email: 'analyst@nccr.gov.in',
          name: 'Data Analyst',
          role: 'ANALYST',
          permissions: ['VIEW_ANALYTICS', 'GENERATE_REPORTS', 'VIEW_PROJECTS'],
          lastLogin: new Date().toISOString(),
        };
        
        setUser(demoUser);
        localStorage.setItem('nccr_user', JSON.stringify(demoUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nccr_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
