import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";
import { AxiosError } from "axios";

type User = {
  email: string;
  id: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-login if token exists
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        // You can add an endpoint to verify the token and get user info
        // For now, we'll just assume the token is valid
        setUser({ email: "user@example.com", id: "1" }); // Replace with actual user data
      } catch {
        logout();
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post("/signin", {
        email,
        password,
      });
      
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      
      // Set user info (you might need to fetch user details separately)
      setUser({ email, id: "1" }); // Replace with actual user data
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post("/signup", {
        email,
        password,
      });
      
      // Auto login after signup
      await login(email, password);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
