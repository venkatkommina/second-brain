import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/signin', { email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await api.post('/signup', { email, password });
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};