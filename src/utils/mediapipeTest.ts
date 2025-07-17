// Simple test to check MediaPipe availability
export const testMediaPipeAvailability = async (): Promise<{
  available: boolean;
  error?: string;
}> => {
  try {
    // Try to dynamically import MediaPipe
    const { Hands } = await import("@mediapipe/hands");
    const { Camera } = await import("@mediapipe/camera_utils");

    // Test if we can create instances
    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    if (hands) {
      console.log("✅ MediaPipe is available and working");
      return { available: true };
    }

    return { available: false, error: "Failed to create MediaPipe instance" };
  } catch (error: any) {
    console.warn("⚠️ MediaPipe not available:", error.message);
    return { available: false, error: error.message };
  }
};

// Test camera availability
export const testCameraAvailability = async (): Promise<{
  available: boolean;
  error?: string;
}> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: "user",
      },
    });

    // Stop the stream immediately after test
    stream.getTracks().forEach((track) => track.stop());

    console.log("✅ Camera is available");
    return { available: true };
  } catch (error: any) {
    console.warn("⚠️ Camera not available:", error.message);
    return { available: false, error: error.message };
  }
};
