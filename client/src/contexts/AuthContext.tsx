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
  loginWithToken: (token: string) => Promise<void>;
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
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Auto-login if token exists (only on initial load)
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || isInitialized) return;

      setIsLoading(true);
      try {
        // Use the /me endpoint to verify token and get user info
        const response = await api.get("/me");
        setUser({
          id: response.data.id,
          email: response.data.email,
        });
      } catch {
        // Token is invalid, clear it
        logout();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    verifyToken();
  }, [token, isInitialized]);
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

      // Get user info from /me endpoint
      const userResponse = await api.get("/me");
      setUser({
        id: userResponse.data.id,
        email: userResponse.data.email,
      });
      setIsInitialized(true); // Mark as initialized to prevent useEffect call
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      let errorMessage = "Login failed";

      if (axiosError.response?.status === 403) {
        errorMessage = "Invalid email or password";
      } else if (axiosError.response?.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (newToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);

      // Get user info from /me endpoint
      const userResponse = await api.get("/me");
      setUser({
        id: userResponse.data.id,
        email: userResponse.data.email,
      });
      setIsInitialized(true); // Mark as initialized to prevent useEffect call
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      let errorMessage = "Token authentication failed";

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setError(errorMessage);
      logout(); // Clear invalid token
      throw new Error(errorMessage);
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
      let errorMessage = "Signup failed";

      if (axiosError.response?.status === 409) {
        errorMessage = "An account with this email already exists";
      } else if (axiosError.response?.status === 400) {
        errorMessage =
          axiosError.response.data?.message ||
          "Invalid email or password format";
      } else if (axiosError.response?.status === 429) {
        errorMessage = "Too many signup attempts. Please try again later.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsInitialized(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        loginWithToken,
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
