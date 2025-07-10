// ROS Bridge service for robot communication
interface ROSMessage {
  op: string;
  topic?: string;
  type?: string;
  msg?: any;
  service?: string;
  args?: any;
  id?: string;
}

interface TwistMessage {
  linear: { x: number; y: number; z: number };
  angular: { x: number; y: number; z: number };
}

interface JointStateMessage {
  header: {
    stamp: { sec: number; nanosec: number };
    frame_id: string;
  };
  name: string[];
  position: number[];
  velocity: number[];
  effort: number[];
}

export class ROSBridge extends EventTarget {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageId = 0;

  constructor(private url: string = "ws://localhost:9090") {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ Connected to ROS bridge");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.dispatchEvent(new CustomEvent("connected"));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing ROS message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("🔌 Disconnected from ROS bridge");
          this.isConnected = false;
          this.dispatchEvent(new CustomEvent("disconnected"));
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("❌ ROS bridge error:", error);
          this.dispatchEvent(new CustomEvent("error", { detail: error }));
          reject(error);
        };

        // Timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private attemptReconnect(): void {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.isConnected
    ) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectInterval);
    }
  }

  private handleMessage(message: ROSMessage): void {
    switch (message.op) {
      case "publish":
        this.dispatchEvent(
          new CustomEvent("message", {
            detail: { topic: message.topic, message: message.msg },
          }),
        );
        break;
      case "service_response":
        this.dispatchEvent(
          new CustomEvent("serviceResponse", {
            detail: { id: message.id, result: message.msg },
          }),
        );
        break;
      default:
        console.log("Unknown ROS message:", message);
    }
  }

  // Subscribe to a topic
  subscribe(topic: string, messageType: string): void {
    if (!this.isConnected || !this.ws) {
      console.error("Not connected to ROS bridge");
      return;
    }

    const message: ROSMessage = {
      op: "subscribe",
      topic,
      type: messageType,
    };

    this.ws.send(JSON.stringify(message));
    console.log(`📡 Subscribed to ${topic}`);
  }

  // Unsubscribe from a topic
  unsubscribe(topic: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: ROSMessage = {
      op: "unsubscribe",
      topic,
    };

    this.ws.send(JSON.stringify(message));
    console.log(`🔇 Unsubscribed from ${topic}`);
  }

  // Publish a message
  publish(topic: string, messageType: string, message: any): void {
    if (!this.isConnected || !this.ws) {
      console.error("Not connected to ROS bridge");
      return;
    }

    const rosMessage: ROSMessage = {
      op: "publish",
      topic,
      type: messageType,
      msg: message,
    };

    this.ws.send(JSON.stringify(rosMessage));
  }

  // Publish twist message for robot movement
  publishTwist(topic: string, linear: any, angular: any): void {
    const twistMessage: TwistMessage = {
      linear: {
        x: linear.x || 0,
        y: linear.y || 0,
        z: linear.z || 0,
      },
      angular: {
        x: angular.x || 0,
        y: angular.y || 0,
        z: angular.z || 0,
      },
    };

    this.publish(topic, "geometry_msgs/Twist", twistMessage);
  }

  // Call a service
  callService(serviceName: string, serviceType: string, args: any): string {
    if (!this.isConnected || !this.ws) {
      throw new Error("Not connected to ROS bridge");
    }

    const id = `service_${++this.messageId}`;
    const message: ROSMessage = {
      op: "call_service",
      service: serviceName,
      type: serviceType,
      args,
      id,
    };

    this.ws.send(JSON.stringify(message));
    return id;
  }

  // Advertise a topic
  advertise(topic: string, messageType: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: ROSMessage = {
      op: "advertise",
      topic,
      type: messageType,
    };

    this.ws.send(JSON.stringify(message));
    console.log(`📢 Advertising ${topic}`);
  }

  // Unadvertise a topic
  unadvertise(topic: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: ROSMessage = {
      op: "unadvertise",
      topic,
    };

    this.ws.send(JSON.stringify(message));
    console.log(`🔇 Unadvertising ${topic}`);
  }

  // Convert gesture to robot commands
  gestureToTwist(gestureData: {
    gestureType: string;
    handPosition: { x: number; y: number; z: number };
    confidence: number;
  }): TwistMessage {
    const { gestureType, handPosition } = gestureData;

    let linear = { x: 0, y: 0, z: 0 };
    let angular = { x: 0, y: 0, z: 0 };

    switch (gestureType) {
      case "open":
        // Move forward/backward based on hand Y position
        linear.x = (0.5 - handPosition.y) * 2; // -1 to 1
        // Turn robot based on hand X position
        angular.z = (handPosition.x - 0.5) * 2; // -1 to 1
        break;

      case "pinch":
        // Rotate in place
        angular.z = Math.sin(Date.now() / 1000) * 0.5;
        break;

      case "fist":
        // Stop robot
        linear = { x: 0, y: 0, z: 0 };
        angular = { x: 0, y: 0, z: 0 };
        break;

      case "point":
        // Move forward slowly
        linear.x = 0.5;
        break;

      default:
        // Idle - no movement
        linear = { x: 0, y: 0, z: 0 };
        angular = { x: 0, y: 0, z: 0 };
    }

    return { linear, angular };
  }

  // Get connection status
  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const rosBridge = new ROSBridge();
export default rosBridge;
