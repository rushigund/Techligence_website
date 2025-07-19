import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Hand,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface GestureDiagnosticsProps {
  gestureData: {
    landmarks: any[];
    isHandDetected: boolean;
    gestureType: string;
    handPosition: { x: number; y: number; z: number };
    confidence: number;
  };
  isInitialized: boolean;
  error: string | null;
}

const GestureDiagnostics: React.FC<GestureDiagnosticsProps> = ({
  gestureData,
  isInitialized,
  error,
}) => {
  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return "bg-green-100 text-green-800";
    if (confidence > 0.4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="w-5 h-5" />
          Gesture Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(isInitialized)}
            <span className="text-sm">Camera Initialized</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(!error)}
            <span className="text-sm">No Errors</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(gestureData.isHandDetected)}
            <span className="text-sm">Hand Detected</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(gestureData.confidence > 0.5)}
            <span className="text-sm">Good Confidence</span>
          </div>
        </div>

        {/* Current Gesture Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Gesture:</span>
            <Badge variant="outline" className="capitalize">
              {gestureData.gestureType}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence:</span>
            <Badge className={getConfidenceColor(gestureData.confidence)}>
              {(gestureData.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>Hand Position:</div>
            <div className="font-mono">
              X: {gestureData.handPosition.x.toFixed(3)}, Y:{" "}
              {gestureData.handPosition.y.toFixed(3)}, Z:{" "}
              {gestureData.handPosition.z.toFixed(3)}
            </div>
            <div>Landmarks: {gestureData.landmarks.length}</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tips */}
        {isInitialized && !gestureData.isHandDetected && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Hold your hand in front of the camera.
              Ensure good lighting and contrast against the background.
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Info */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div>System Performance:</div>
          <div>• Camera: {isInitialized ? "✓ Active" : "✗ Inactive"}</div>
          <div>
            • MediaPipe:{" "}
            {gestureData.landmarks.length > 0 ? "✓ Working" : "✗ Fallback mode"}
          </div>
          <div>• Detection Rate: ~10 FPS</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GestureDiagnostics;
