declare module "@mediapipe/hands" {
  export class Hands {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: {
      maxNumHands?: number;
      modelComplexity?: number;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }): void;
    onResults(callback: (results: any) => void): void;
    send(input: { image: HTMLVideoElement }): Promise<void>;
  }
}

declare module "@mediapipe/camera_utils" {
  export class Camera {
    constructor(
      video: HTMLVideoElement,
      config: {
        onFrame: () => Promise<void>;
        width: number;
        height: number;
      },
    );
    start(): Promise<void>;
    stop(): void;
  }
}

declare module "@mediapipe/drawing_utils" {
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any,
    options?: any,
  ): void;

  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    options?: any,
  ): void;
}
