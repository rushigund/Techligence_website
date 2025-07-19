// Demo mode utilities for running frontend without backend

export const isDemoMode = () => {
  // Check if we're running in demo mode (no backend available)
  return (
    import.meta.env.VITE_DEMO_MODE === "true" ||
    !import.meta.env.VITE_API_URL ||
    window.location.hostname !== "localhost"
  );
};

export const demoAuth = {
  register: async (userData: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const demoUser = {
      id: "demo-user-123",
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: "user",
    };

    localStorage.setItem("auth_token", "demo-token-123");
    localStorage.setItem("user_data", JSON.stringify(demoUser));

    return {
      data: {
        success: true,
        data: {
          user: demoUser,
          token: "demo-token-123",
        },
      },
    };
  },

  login: async (credentials: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const demoUser = {
      id: "demo-user-123",
      firstName: "Demo",
      lastName: "User",
      email: credentials.email,
      role: "user",
    };

    localStorage.setItem("auth_token", "demo-token-123");
    localStorage.setItem("user_data", JSON.stringify(demoUser));

    return {
      data: {
        success: true,
        data: {
          user: demoUser,
          token: "demo-token-123",
        },
      },
    };
  },

  logout: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    return { data: { success: true } };
  },

  getProfile: async () => {
    const userData = localStorage.getItem("user_data");
    if (!userData) throw new Error("Not authenticated");

    return {
      data: {
        success: true,
        data: JSON.parse(userData),
      },
    };
  },
};

export const demoRobots = [
  {
    _id: "robot-1",
    name: "Explorer Bot Alpha",
    model: "EX-4000",
    serialNumber: "EXP-2024-001",
    type: "4wd",
    category: "exploration",
    status: "online",
    specifications: {
      maxSpeed: 5.2,
      payload: 25,
      batteryLife: 8,
      range: 1000,
      dimensions: {
        length: 0.8,
        width: 0.6,
        height: 0.4,
        weight: 15,
      },
    },
    isActive: true,
  },
  {
    _id: "robot-2",
    name: "Industrial Guardian",
    model: "IG-5000",
    serialNumber: "IND-2024-002",
    type: "4wd",
    category: "industrial",
    status: "offline",
    specifications: {
      maxSpeed: 3.8,
      payload: 50,
      batteryLife: 12,
      range: 800,
      dimensions: {
        length: 1.2,
        width: 0.8,
        height: 0.6,
        weight: 35,
      },
    },
    isActive: true,
  },
];

export const demoAPI = {
  robots: {
    getAll: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        data: {
          success: true,
          data: demoRobots,
        },
      };
    },

    getById: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const robot = demoRobots.find((r) => r._id === id);
      if (!robot) throw new Error("Robot not found");

      return {
        data: {
          success: true,
          data: robot,
        },
      };
    },
  },

  control: {
    sendCommand: async (robotId: string, command: any) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`Demo: Sending command to robot ${robotId}:`, command);
      return {
        data: {
          success: true,
          message: "Command sent successfully (demo mode)",
        },
      };
    },
  },

  urdf: {
    upload: async (file: File) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        data: {
          success: true,
          data: {
            id: "demo-urdf-123",
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        },
      };
    },
  },
};
