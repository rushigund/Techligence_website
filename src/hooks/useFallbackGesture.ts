import { useRef, useState, useCallback } from "react";

interface FallbackGestureData {
  landmarks: any[];
  isHandDetected: boolean;
  gestureType: "pinch" | "open" | "fist" | "point" | "idle";
  handPosition: { x: number; y: number; z: number };
  confidence: number;
}

export const useFallbackGesture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureData, setGestureData] = useState<FallbackGestureData>({
    landmarks: [],
    isHandDetected: false,
    gestureType: "idle",
    handPosition: { x: 0, y: 0, z: 0 },
    confidence: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Simple motion detection fallback
  const initializeFallbackGesture = useCallback(async () => {
    try {
      console.log("🎥 Initializing fallback gesture recognition...");
      setError(null);

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

      // Check camera permissions
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

      try {
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
          setTimeout(() => reject(new Error("Video loading timeout")), 10000);
        });

        await videoRef.current.play();
      } catch (streamError: any) {
        console.error("Stream setup error:", streamError);

        // Handle specific camera errors with user-friendly messages
        if (streamError.name === "NotAllowedError") {
          throw new Error(
            "Camera access denied. Please allow camera access and refresh the page.",
          );
        } else if (streamError.name === "NotFoundError") {
          throw new Error(
            "No camera found. Please connect a camera and try again.",
          );
        } else if (streamError.name === "NotReadableError") {
          throw new Error("Camera is already in use by another application.");
        } else if (streamError.message === "Video loading timeout") {
          throw new Error("Camera initialization timed out. Please try again.");
        } else {
          throw streamError;
        }
      }

      // Start simple gesture simulation
      startGestureSimulation();

      setIsInitialized(true);
      setError(null);
      console.log("✅ Fallback gesture recognition initialized");
    } catch (err: any) {
      console.error("Fallback gesture error:", err);

      // Provide user-friendly error messages
      let errorMessage = "Failed to initialize camera";
      if (
        err.message.includes("Permission denied") ||
        err.message.includes("Camera access denied")
      ) {
        errorMessage =
          "Camera access denied. Please allow camera access in your browser settings and refresh the page.";
      } else if (err.message.includes("No camera found")) {
        errorMessage =
          "No camera found. Please connect a camera and try again.";
      } else if (err.message.includes("already in use")) {
        errorMessage = "Camera is already in use by another application.";
      } else if (
        err.message.includes("Video or canvas element not available")
      ) {
        errorMessage =
          "Camera interface not ready. Please refresh the page and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsInitialized(false);
    }
  }, []);

  const startGestureSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 480;

    let gestureIndex = 0;
    const gestures: Array<"open" | "pinch" | "fist" | "point"> = [
      "open",
      "pinch",
      "fist",
      "point",
    ];

    const animate = () => {
      if (!videoRef.current || !canvas) return;

      try {
        // Draw video frame
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Simulate hand detection
        const time = Date.now();
        const centerX = 320 + Math.sin(time / 1000) * 100;
        const centerY = 240 + Math.cos(time / 1500) * 80;

        // Draw simulated hand indicator
        ctx.strokeStyle = "#00ff00";
        ctx.fillStyle = "#00ff0040";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        // Change gesture every 3 seconds
        if (Math.floor(time / 3000) !== gestureIndex) {
          gestureIndex = Math.floor(time / 3000) % gestures.length;
        }

        const currentGesture = gestures[gestureIndex];

        // Draw gesture label
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(centerX - 60, centerY - 80, 120, 30);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(currentGesture.toUpperCase(), centerX, centerY - 60);

        // Update gesture data
        setGestureData({
          landmarks: [],
          isHandDetected: true,
          gestureType: currentGesture,
          handPosition: {
            x: centerX / canvas.width,
            y: centerY / canvas.height,
            z: 0,
          },
          confidence: 0.8,
        });

        // Draw instructions
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(10, 10, 300, 60);
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText("🤖 Fallback Mode: Simulated Gestures", 20, 30);
        ctx.fillText("Gesture changes every 3 seconds", 20, 50);

        animationRef.current = requestAnimationFrame(animate);
      } catch (err) {
        console.warn("Animation error:", err);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const stopGesture = useCallback(() => {
    try {
      // Stop animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Stop video stream
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

      setIsInitialized(false);
      setGestureData({
        landmarks: [],
        isHandDetected: false,
        gestureType: "idle",
        handPosition: { x: 0, y: 0, z: 0 },
        confidence: 0,
      });

      console.log("🛑 Fallback gesture stopped");
    } catch (err) {
      console.error("Error stopping fallback gesture:", err);
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    gestureData,
    isInitialized,
    isLoading: false, // Fallback doesn't have loading state
    error,
    initializeCamera: initializeFallbackGesture,
    stopCamera: stopGesture,
  };
};
