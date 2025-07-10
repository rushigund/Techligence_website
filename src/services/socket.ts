import { io, Socket } from "socket.io-client";

export interface GestureData {
  landmarks: any[];
  isHandDetected: boolean;
  gestureType: "pinch" | "open" | "fist" | "point" | "idle";
  handPosition: { x: number; y: number; z: number };
  confidence: number;
}

export interface RobotStatus {
  robotId: string;
  status: string;
  isAvailable: boolean;
  healthScore: number;
  currentSession?: any;
  telemetry?: any;
  communication?: any;
  lastUpdated: string;
}

export interface RobotMessage {
  robotId: string;
  messageType: string;
  data: any;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    const serverUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    return new Promise<void>((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket not initialized"));

      this.socket.on("connect", () => {
        console.log("✅ Connected to server");
        this.isConnected = true;
        resolve();
      });

      this.socket.on("disconnect", () => {
        console.log("🔌 Disconnected from server");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
        this.emit("error", error);
      });

      // Robot-specific events
      this.socket.on("robotControlStarted", (data) => {
        console.log("🤖 Robot control started:", data);
        this.emit("robotControlStarted", data);
      });

      this.socket.on("robotControlEnded", (data) => {
        console.log("🛑 Robot control ended:", data);
        this.emit("robotControlEnded", data);
      });

      this.socket.on("robotStatusChanged", (data) => {
        console.log("📊 Robot status changed:", data);
        this.emit("robotStatusChanged", data);
      });

      this.socket.on("robotMessage", (data: RobotMessage) => {
        this.emit("robotMessage", data);
      });

      this.socket.on("robotTelemetry", (data) => {
        this.emit("robotTelemetry", data);
      });

      this.socket.on("robotGestureUpdate", (data) => {
        this.emit("robotGestureUpdate", data);
      });

      this.socket.on("robotManualUpdate", (data) => {
        this.emit("robotManualUpdate", data);
      });

      this.socket.on("commandAcknowledged", (data) => {
        this.emit("commandAcknowledged", data);
      });

      this.socket.on("emergencyStopExecuted", (data) => {
        console.log("🚨 Emergency stop executed:", data);
        this.emit("emergencyStopExecuted", data);
      });

      this.socket.on("robotEmergencyStop", (data) => {
        console.log("🚨 Robot emergency stop:", data);
        this.emit("robotEmergencyStop", data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Event handling
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Robot control methods
  startRobotControl(robotId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("startRobotControl", { robotId });
  }

  endRobotControl(robotId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("endRobotControl", { robotId });
  }

  sendGestureControl(robotId: string, gestureData: GestureData) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("gestureControl", { robotId, gestureData });
  }

  sendManualControl(robotId: string, command: { linear: any; angular: any }) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("manualControl", { robotId, command });
  }

  subscribeRobotMonitoring(robotId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("subscribeRobotMonitoring", { robotId });
  }

  emergencyStop(robotId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("emergencyStop", { robotId });
  }

  // Getters
  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
