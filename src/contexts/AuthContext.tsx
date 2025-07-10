import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";
import { socketService } from "@/services/socket";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  preferences?: {
    theme: string;
    gestureSettings: {
      sensitivity: number;
      smoothing: boolean;
      detectionConfidence: number;
      trackingConfidence: number;
    };
  };
  robotAccess: Array<{
    robotId: string;
    accessLevel: string;
    grantedAt: string;
  }>;
  urdfFiles: string[];
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
  updateProfile: (data: any) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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
    localStorage.getItem("auth_token"),
  );
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user_data");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Verify token with server
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);

          // Connect to Socket.IO
          await socketService.connect(savedToken);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          // Clear invalid auth data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
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
      const { user: userData, token: authToken } = response.data.data;

      // Save to localStorage
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("user_data", JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);

      // Connect to Socket.IO
      await socketService.connect(authToken);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again.",
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
      const { user: newUser, token: authToken } = response.data.data;

      // Save to localStorage
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("user_data", JSON.stringify(newUser));

      // Update state
      setToken(authToken);
      setUser(newUser);

      // Connect to Socket.IO
      await socketService.connect(authToken);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  const logout = () => {
    // Call logout API (fire and forget)
    authAPI.logout().catch(console.error);

    // Clear local state
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);

    // Disconnect Socket.IO
    socketService.disconnect();
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data.user;

      // Update localStorage
      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Profile update failed. Please try again.",
      );
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Password change failed. Please try again.",
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
