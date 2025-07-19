import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, CheckCircle, XCircle, Camera } from "lucide-react";

interface MediaPipeStatusProps {
  isInitialized: boolean;
  error: string | null;
  isHandDetected: boolean;
  gestureType: string;
  confidence: number;
}

const MediaPipeStatus = ({
  isInitialized,
  error,
  isHandDetected,
  gestureType,
  confidence,
}: MediaPipeStatusProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized || error) {
      setIsLoading(false);
    }
  }, [isInitialized, error]);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <XCircle className="w-4 h-4 text-destructive" />;
    if (isInitialized)
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Initializing MediaPipe...";
    if (error && error.includes("MediaPipe not available"))
      return "Fallback Camera Mode";
    if (error) return "Camera Error";
    if (isInitialized) return "MediaPipe Active";
    return "Not Initialized";
  };

  const getStatusVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    if (isLoading) return "outline";
    if (error && error.includes("MediaPipe not available")) return "secondary";
    if (error) return "destructive";
    if (isInitialized) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      {/* Main Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={getStatusVariant()} className="gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>

        {isInitialized && !error && (
          <Badge variant={isHandDetected ? "default" : "outline"}>
            <Eye className="w-3 h-3 mr-1" />
            {isHandDetected ? "Hand Detected" : "No Hand"}
          </Badge>
        )}
      </div>

      {/* Error Alert */}
      {error && !error.includes("MediaPipe not available") && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Fallback Mode Alert */}
      {error && error.includes("MediaPipe not available") && (
        <Alert>
          <Camera className="h-4 w-4" />
          <AlertDescription>
            <strong>Fallback Mode:</strong> MediaPipe is not available. Using
            basic camera for preview. Some gesture recognition features may be
            limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>Loading MediaPipe...</strong> Downloading hand tracking
            models. This may take a moment on first load.
          </AlertDescription>
        </Alert>
      )}

      {/* Success with Hand Detection */}
      {isInitialized && !error && isHandDetected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Gesture:</span>
            <Badge variant="outline" className="capitalize">
              {gestureType}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Detection Confidence:</span>
            <span className="font-medium">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* MediaPipe Success Info */}
      {isInitialized && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>MediaPipe Ready:</strong> Advanced hand tracking is active.
            Move your hand in front of the camera to control the 3D robot.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MediaPipeStatus;
