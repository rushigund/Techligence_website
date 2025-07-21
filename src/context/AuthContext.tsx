// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "engineer" | "admin";
  isActive: boolean;
  lastLogin?: string;
  preferences?: {
    theme: "light" | "dark" | "system";
  };
  cart: Array<{
    productId: number;
    name: string;
    price: string;
    priceValue: number;
    image?: string;
    specifications: {
      speed?: string;
      payload?: string;
      range?: string;
      battery?: string;
    };
    quantity: number;
  }>;
  favorites: number[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem("auth_token");
      
      if (savedToken) {
        try {
          setToken(savedToken);
          
          // Verify token with server and get current user data
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            throw new Error("Profile fetch failed");
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          // Clear invalid auth data
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        localStorage.setItem("auth_token", authToken);
        setToken(authToken);
        setUser(userData);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message ||
        "Login failed. Please try again."
      );
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data;

        localStorage.setItem("auth_token", authToken);
        setToken(authToken);
        setUser(newUser);
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again."
      );
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
      } else {
        throw new Error(response.data.message || "Profile update failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Profile update failed. Please try again."
      );
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      const response = await authAPI.changePassword({ 
        currentPassword, 
        newPassword 
      });
      if (!response.data.success) {
        throw new Error(response.data.message || "Password change failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Password change failed. Please try again."
      );
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;