import { useEffect, useRef, useState } from "react";
import { useFallbackGesture } from "./useFallbackGesture";

interface GestureData {
  landmarks: any[];
  isHandDetected: boolean;
  gestureType: "pinch" | "open" | "fist" | "point" | "idle";
  handPosition: { x: number; y: number; z: number };
  confidence: number;
}

// MediaPipe hand tracking implementation
export const useGestureRecognition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureData, setGestureData] = useState<GestureData>({
    landmarks: [],
    isHandDetected: false,
    gestureType: "idle",
    handPosition: { x: 0, y: 0, z: 0 },
    confidence: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  // Fallback gesture system
  const fallbackGesture = useFallbackGesture();

  // Gesture detection based on hand landmarks
  const detectGesture = (
    landmarks: any[],
  ): "pinch" | "open" | "fist" | "point" | "idle" => {
    if (!landmarks || landmarks.length === 0) return "idle";

    try {
      // Get key landmark points
      const thumb_tip = landmarks[4];
      const thumb_mcp = landmarks[2];
      const index_tip = landmarks[8];
      const index_pip = landmarks[6];
      const middle_tip = landmarks[12];
      const middle_pip = landmarks[10];
      const ring_tip = landmarks[16];
      const ring_pip = landmarks[14];
      const pinky_tip = landmarks[20];
      const pinky_pip = landmarks[18];

      // Calculate distances
      const thumb_index_distance = Math.sqrt(
        Math.pow(thumb_tip.x - index_tip.x, 2) +
          Math.pow(thumb_tip.y - index_tip.y, 2),
      );

      // Check if fingers are extended
      const thumb_extended = thumb_tip.x > thumb_mcp.x; // For right hand
      const index_extended = index_tip.y < index_pip.y;
      const middle_extended = middle_tip.y < middle_pip.y;
      const ring_extended = ring_tip.y < ring_pip.y;
      const pinky_extended = pinky_tip.y < pinky_pip.y;

      const extended_fingers = [
        thumb_extended,
        index_extended,
        middle_extended,
        ring_extended,
        pinky_extended,
      ].filter(Boolean).length;

      // Gesture classification
      if (thumb_index_distance < 0.05) {
        return "pinch"; // Thumb and index finger close together
      } else if (extended_fingers >= 4) {
        return "open"; // Most fingers extended
      } else if (extended_fingers <= 1) {
        return "fist"; // Most fingers closed
      } else if (
        index_extended &&
        !middle_extended &&
        !ring_extended &&
        !pinky_extended
      ) {
        return "point"; // Only index finger extended
      }

      return "open"; // Default to open
    } catch (err) {
      console.warn("Gesture detection error:", err);
      return "idle";
    }
  };

  // Draw hand landmarks on canvas
  const drawLandmarks = (
    landmarks: any[],
    canvasElement: HTMLCanvasElement,
  ) => {
    const ctx = canvasElement.getContext("2d");
    if (!ctx || !landmarks) return;

    ctx.save();

    // Draw connections
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // Thumb
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8], // Index
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12], // Middle
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16], // Ring
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20], // Pinky
      [0, 17], // Palm
    ];

    // Draw connections
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      if (startPoint && endPoint) {
        ctx.beginPath();
        ctx.moveTo(
          startPoint.x * canvasElement.width,
          startPoint.y * canvasElement.height,
        );
        ctx.lineTo(
          endPoint.x * canvasElement.width,
          endPoint.y * canvasElement.height,
        );
        ctx.stroke();
      }
    });

    // Draw landmarks
    ctx.fillStyle = "#FF0000";
    landmarks.forEach((landmark, index) => {
      if (landmark) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvasElement.width,
          landmark.y * canvasElement.height,
          index === 4 || index === 8 ? 6 : 4, // Larger dots for thumb and index tips
          0,
          2 * Math.PI,
        );
        ctx.fill();
      }
    });

    ctx.restore();
  };

  const initializeMediaPipe = async () => {
    try {
      console.log("🤖 Initializing MediaPipe hand tracking...");
      setIsLoading(true);
      setError(null);

      // Check camera permissions first
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (permission.state === "denied") {
            throw new Error(
              "Camera access denied. Please enable camera permissions in your browser settings.",
            );
          }
        } catch (permError) {
          console.warn("Permission query not supported:", permError);
        }
      }

      // Check if MediaPipe is available before importing
      let Hands, Camera;
      try {
        // Dynamic import to avoid SSR issues and build errors
        const handsModule = await import("@mediapipe/hands");
        const cameraModule = await import("@mediapipe/camera_utils");

        Hands = handsModule.Hands;
        Camera = cameraModule.Camera;

        if (!Hands || !Camera) {
          throw new Error("MediaPipe classes not available");
        }

        if (!videoRef.current || !canvasRef.current) {
          throw new Error("Video or canvas element not available");
        }

        const canvas = canvasRef.current;
        canvas.width = 640;
        canvas.height = 480;

        // Initialize MediaPipe Hands
        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw video frame
          if (videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          }

          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw landmarks
            drawLandmarks(landmarks, canvas);

            // Detect gesture
            const gestureType = detectGesture(landmarks);

            // Calculate hand center position
            const handCenter = landmarks.reduce(
              (acc: any, landmark: any) => ({
                x: acc.x + landmark.x,
                y: acc.y + landmark.y,
                z: acc.z + landmark.z,
              }),
              { x: 0, y: 0, z: 0 },
            );

            handCenter.x /= landmarks.length;
            handCenter.y /= landmarks.length;
            handCenter.z /= landmarks.length;

            setGestureData({
              landmarks: landmarks,
              isHandDetected: true,
              gestureType,
              handPosition: handCenter,
              confidence: 0.9,
            });

            // Draw gesture info
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(10, 10, 200, 80);
            ctx.fillStyle = "#000000";
            ctx.font = "16px Arial";
            ctx.fillText(`Gesture: ${gestureType.toUpperCase()}`, 20, 30);
            ctx.fillText(`Hands: ${results.multiHandLandmarks.length}`, 20, 50);
            ctx.fillText(`Confidence: 90%`, 20, 70);
          } else {
            setGestureData((prev) => ({
              ...prev,
              landmarks: [],
              isHandDetected: false,
              gestureType: "idle",
              confidence: 0,
            }));

            // Draw "No hand detected" message
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(10, 10, 200, 40);
            ctx.fillStyle = "#000000";
            ctx.font = "16px Arial";
            ctx.fillText("No hand detected", 20, 35);
          }
        });

        handsRef.current = hands;

        // Initialize camera with better error handling
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;

        try {
          await camera.start();
        } catch (cameraError: any) {
          console.error("Camera start error:", cameraError);

          // Handle specific camera errors
          if (cameraError.name === "NotAllowedError") {
            throw new Error(
              "Camera access denied. Please allow camera access and refresh the page.",
            );
          } else if (cameraError.name === "NotFoundError") {
            throw new Error(
              "No camera found. Please connect a camera and try again.",
            );
          } else if (cameraError.name === "NotReadableError") {
            throw new Error("Camera is already in use by another application.");
          } else {
            throw cameraError;
          }
        }

        setIsInitialized(true);
        setIsLoading(false);
        setError(null);
        console.log("✅ MediaPipe hand tracking initialized successfully");
      } catch (importError: any) {
        console.warn("MediaPipe packages not available:", importError.message);
        throw new Error(
          "MediaPipe not available - falling back to camera only",
        );
      }
    } catch (err: any) {
      console.warn(
        "MediaPipe initialization failed, using fallback:",
        err.message,
      );
      setUseFallback(true);
      setIsLoading(false);

      // Use fallback gesture system
      await fallbackGesture.initializeCamera();
    }
  };

  // Fallback camera implementation without MediaPipe
  const initializeFallbackCamera = async () => {
    try {
      console.log("🎥 Falling back to simple camera access...");

      // Wait for elements to be available
      let retries = 0;
      while ((!videoRef.current || !canvasRef.current) && retries < 10) {
        console.log(
          `⏳ Waiting for video/canvas elements... (attempt ${retries + 1})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Video or canvas elements not available after waiting");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve, reject) => {
        videoRef.current!.onloadedmetadata = resolve;
        videoRef.current!.onerror = reject;
        setTimeout(reject, 10000);
      });

      await videoRef.current.play();

      setIsInitialized(true);
      setError("MediaPipe not available. Using fallback camera mode.");
      console.log("✅ Fallback camera initialized");
    } catch (err: any) {
      console.error("Fallback camera error:", err);
      setError(`Camera error: ${err.message}`);
      setIsInitialized(false);
    }
  };

  const initializeCamera = async () => {
    try {
      if (useFallback) {
        await fallbackGesture.initializeCamera();
      } else {
        await initializeMediaPipe();
      }
    } catch (error: any) {
      console.error("Camera initialization failed:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to initialize camera";
      if (
        error.message.includes("Permission denied") ||
        error.message.includes("Camera access denied")
      ) {
        errorMessage =
          "Camera access denied. Please allow camera access in your browser settings and refresh the page.";
      } else if (error.message.includes("No camera found")) {
        errorMessage =
          "No camera found. Please connect a camera and try again.";
      } else if (error.message.includes("already in use")) {
        errorMessage = "Camera is already in use by another application.";
      } else if (
        error.message.includes("Video or canvas element not available")
      ) {
        errorMessage =
          "Camera interface not ready. Please refresh the page and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsInitialized(false);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (useFallback) {
      fallbackGesture.stopCamera();
    } else {
      try {
        // Stop MediaPipe camera
        if (cameraRef.current) {
          cameraRef.current.stop();
          cameraRef.current = null;
        }

        // Stop fallback stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }

        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        // Clear canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height,
            );
          }
        }

        handsRef.current = null;
        setIsInitialized(false);
        setGestureData({
          landmarks: [],
          isHandDetected: false,
          gestureType: "idle",
          handPosition: { x: 0, y: 0, z: 0 },
          confidence: 0,
        });

        console.log("🛑 Hand tracking stopped");
      } catch (err) {
        console.error("Error stopping hand tracking:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Use fallback data when in fallback mode
  if (useFallback) {
    return {
      videoRef: fallbackGesture.videoRef,
      canvasRef: fallbackGesture.canvasRef,
      gestureData: fallbackGesture.gestureData,
      isInitialized: fallbackGesture.isInitialized,
      isLoading: fallbackGesture.isLoading,
      error: fallbackGesture.error || "Using fallback gesture recognition",
      initializeCamera,
      stopCamera,
    };
  }

  return {
    videoRef,
    canvasRef,
    gestureData,
    isInitialized,
    isLoading,
    error,
    initializeCamera,
    stopCamera,
  };
};
