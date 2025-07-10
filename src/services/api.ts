import axios from "axios";
import { isDemoMode, demoAuth, demoAPI } from "@/utils/demoMode";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

// Helper function to handle API calls with demo mode fallback
const apiCall = async (
  apiFunction: () => Promise<any>,
  demoFunction: () => Promise<any>,
) => {
  if (isDemoMode()) {
    return demoFunction();
  }

  try {
    return await apiFunction();
  } catch (error: any) {
    // If backend is not available, fall back to demo mode
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      console.warn("Backend not available, using demo mode");
      return demoFunction();
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    apiCall(
      () => api.post("/auth/register", userData),
      () => demoAuth.register(userData),
    ),

  login: (credentials: { email: string; password: string }) =>
    apiCall(
      () => api.post("/auth/login", credentials),
      () => demoAuth.login(credentials),
    ),

  logout: () =>
    apiCall(
      () => api.post("/auth/logout"),
      () => demoAuth.logout(),
    ),

  getProfile: () =>
    apiCall(
      () => api.get("/auth/profile"),
      () => demoAuth.getProfile(),
    ),

  updateProfile: (data: any) =>
    apiCall(
      () => api.put("/auth/profile", data),
      async () => {
        // Update local storage in demo mode
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
        const updatedUser = { ...userData, ...data };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        return { data: { success: true, data: updatedUser } };
      },
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiCall(
      () => api.put("/auth/change-password", data),
      async () => ({
        data: {
          success: true,
          message: "Password changed successfully (demo mode)",
        },
      }),
    ),

  refreshToken: () =>
    apiCall(
      () => api.post("/auth/refresh"),
      async () => ({ data: { success: true, token: "demo-token-123" } }),
    ),
};

// Robots API
export const robotsAPI = {
  getRobots: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    search?: string;
  }) =>
    apiCall(
      () => api.get("/robots", { params }),
      () => demoAPI.robots.getAll(),
    ),

  getRobot: (robotId: string) =>
    apiCall(
      () => api.get(`/robots/${robotId}`),
      () => demoAPI.robots.getById(robotId),
    ),

  createRobot: (robotData: any) =>
    apiCall(
      () => api.post("/robots", robotData),
      async () => {
        const newRobot = {
          _id: `robot-${Date.now()}`,
          ...robotData,
          status: "offline",
          isActive: true,
        };
        return { data: { success: true, data: newRobot } };
      },
    ),

  updateRobot: (robotId: string, updates: any) =>
    apiCall(
      () => api.put(`/robots/${robotId}`, updates),
      async () => ({
        data: {
          success: true,
          message: "Robot updated successfully (demo mode)",
        },
      }),
    ),

  deleteRobot: (robotId: string) =>
    apiCall(
      () => api.delete(`/robots/${robotId}`),
      async () => ({
        data: {
          success: true,
          message: "Robot deleted successfully (demo mode)",
        },
      }),
    ),

  getRobotStatus: (robotId: string) =>
    apiCall(
      () => api.get(`/robots/${robotId}/status`),
      async () => ({
        data: {
          success: true,
          data: {
            status: "online",
            battery: 85,
            lastUpdate: new Date().toISOString(),
          },
        },
      }),
    ),

  updateRobotAccess: (robotId: string, userId: string, accessLevel: string) =>
    apiCall(
      () => api.put(`/robots/${robotId}/access`, { userId, accessLevel }),
      async () => ({
        data: {
          success: true,
          message: "Access updated successfully (demo mode)",
        },
      }),
    ),
};

// Control API
export const controlAPI = {
  sendCommand: (robotId: string, command: any) =>
    apiCall(
      () => api.post(`/control/${robotId}/command`, { command }),
      () => demoAPI.control.sendCommand(robotId, command),
    ),

  getRobotTelemetry: (robotId: string) =>
    apiCall(
      () => api.get(`/control/${robotId}/telemetry`),
      async () => ({
        data: {
          success: true,
          data: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { roll: 0, pitch: 0, yaw: 0 },
            battery: 85,
            motors: [
              { id: "motor1", speed: 0, torque: 0, temperature: 25 },
              { id: "motor2", speed: 0, torque: 0, temperature: 25 },
            ],
            sensors: {
              temperature: 22,
              humidity: 45,
              pressure: 1013,
            },
            lastUpdated: new Date().toISOString(),
          },
        },
      }),
    ),

  startSession: (robotId: string, sessionData: any) =>
    apiCall(
      () => api.post(`/control/${robotId}/session`, sessionData),
      async () => ({
        data: {
          success: true,
          data: {
            sessionId: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
          },
        },
      }),
    ),

  endSession: (robotId: string) =>
    apiCall(
      () => api.delete(`/control/${robotId}/session`),
      async () => ({
        data: {
          success: true,
          message: "Session ended successfully (demo mode)",
        },
      }),
    ),
};

// URDF API
export const urdfAPI = {
  uploadFile: (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append("urdf", file);
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    return apiCall(
      () =>
        api.post("/urdf/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      () => demoAPI.urdf.upload(file),
    );
  },

  getFiles: (params?: { page?: number; limit?: number; search?: string }) =>
    apiCall(
      () => api.get("/urdf", { params }),
      async () => ({
        data: {
          success: true,
          data: [
            {
              _id: "urdf-1",
              filename: "robot_model.urdf",
              size: 15420,
              uploadedAt: new Date().toISOString(),
              owner: "demo-user-123",
            },
          ],
        },
      }),
    ),

  getFile: (fileId: string) =>
    apiCall(
      () => api.get(`/urdf/${fileId}`),
      async () => ({
        data: {
          success: true,
          data: {
            _id: fileId,
            filename: "demo_robot.urdf",
            content: `<?xml version="1.0"?>
<robot name="demo_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
    </visual>
  </link>
</robot>`,
            size: 15420,
            uploadedAt: new Date().toISOString(),
          },
        },
      }),
    ),

  deleteFile: (fileId: string) =>
    apiCall(
      () => api.delete(`/urdf/${fileId}`),
      async () => ({
        data: {
          success: true,
          message: "URDF file deleted successfully (demo mode)",
        },
      }),
    ),

  validateFile: (fileId: string) =>
    apiCall(
      () => api.post(`/urdf/${fileId}/validate`),
      async () => ({
        data: {
          success: true,
          data: {
            valid: true,
            errors: [],
            warnings: [],
            links: 1,
            joints: 0,
          },
        },
      }),
    ),
};

// Career API
export const careerAPI = {
  // Submit job application
  submitApplication: (formData: FormData) => {
    return apiCall(
      () =>
        api.post("/career/apply", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      async () => {
        // Demo mode simulation
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
        return {
          data: {
            success: true,
            message: "Application submitted successfully! (Demo Mode)",
            data: {
              applicationId: `demo-${Date.now()}`,
              submittedAt: new Date().toISOString(),
              status: "submitted",
            },
          },
        };
      },
    );
  },

  // Get applications (admin)
  getApplications: (params = {}) =>
    apiCall(
      () => api.get("/career/applications", { params }),
      async () => ({
        data: {
          success: true,
          data: {
            applications: [],
            total: 0,
            totalPages: 0,
            currentPage: 1,
          },
        },
      }),
    ),

  // Get single application
  getApplication: (applicationId: string) =>
    apiCall(
      () => api.get(`/career/applications/${applicationId}`),
      async () => ({
        data: {
          success: true,
          data: {
            _id: applicationId,
            jobTitle: "Demo Position",
            status: "submitted",
          },
        },
      }),
    ),

  // Update application status
  updateApplicationStatus: (
    applicationId: string,
    status: string,
    notes?: string,
  ) =>
    apiCall(
      () =>
        api.put(`/career/applications/${applicationId}/status`, {
          status,
          internalNotes: notes,
        }),
      async () => ({
        data: {
          success: true,
          message: "Application status updated (demo mode)",
        },
      }),
    ),
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submitContact: (contactData: {
    name: string;
    email: string;
    company?: string;
    inquiryType: string;
    subject: string;
    message: string;
  }) =>
    apiCall(
      () => api.post("/contact/submit", contactData),
      async () => {
        // Demo mode simulation
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        return {
          data: {
            success: true,
            message:
              "Thank you for your message! We'll get back to you soon. (Demo Mode)",
            data: {
              ticketId: `demo-${Date.now()}`,
              submittedAt: new Date().toISOString(),
              assignedTo: "Demo Team",
              estimatedResponse: "2-3 business days",
            },
          },
        };
      },
    ),

  // Get contact messages (admin)
  getMessages: (params = {}) =>
    apiCall(
      () => api.get("/contact/messages", { params }),
      async () => ({
        data: {
          success: true,
          data: {
            messages: [],
            total: 0,
            totalPages: 0,
            currentPage: 1,
          },
        },
      }),
    ),

  // Get single message
  getMessage: (messageId: string) =>
    apiCall(
      () => api.get(`/contact/messages/${messageId}`),
      async () => ({
        data: {
          success: true,
          data: {
            _id: messageId,
            name: "Demo User",
            email: "demo@example.com",
            subject: "Demo Inquiry",
            status: "new",
          },
        },
      }),
    ),

  // Respond to message
  respondToMessage: (messageId: string, responseMessage: string) =>
    apiCall(
      () =>
        api.put(`/contact/messages/${messageId}/respond`, { responseMessage }),
      async () => ({
        data: {
          success: true,
          message: "Response sent successfully (demo mode)",
        },
      }),
    ),

  // Update message status
  updateMessageStatus: (messageId: string, updates: any) =>
    apiCall(
      () => api.put(`/contact/messages/${messageId}/status`, updates),
      async () => ({
        data: {
          success: true,
          message: "Message status updated (demo mode)",
        },
      }),
    ),
};

// Export demo mode status for components to use
export { isDemoMode };
