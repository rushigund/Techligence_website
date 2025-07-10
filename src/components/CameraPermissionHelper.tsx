import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  AlertCircle,
  RefreshCw,
  Settings,
  Info,
  CheckCircle,
} from "lucide-react";

interface CameraPermissionHelperProps {
  error: string | null;
  onRetry: () => void;
  isLoading: boolean;
}

const CameraPermissionHelper: React.FC<CameraPermissionHelperProps> = ({
  error,
  onRetry,
  isLoading,
}) => {
  const isPermissionError =
    error?.includes("denied") || error?.includes("Permission");
  const isCameraNotFound = error?.includes("No camera found");
  const isCameraInUse = error?.includes("already in use");

  const getInstructions = () => {
    if (isPermissionError) {
      return {
        title: "Camera Access Required",
        icon: Camera,
        steps: [
          "Click the camera icon in your browser's address bar",
          "Select 'Allow' for camera access",
          "If no icon appears, check your browser settings",
          "Refresh the page and try again",
        ],
        browserSpecific: {
          Chrome:
            "Look for the camera icon next to the URL. Click it and select 'Allow'.",
          Firefox: "Click the shield icon and enable camera permissions.",
          Safari:
            "Go to Safari > Preferences > Websites > Camera and allow access.",
          Edge: "Click the camera icon in the address bar and select 'Allow'.",
        },
      };
    }

    if (isCameraNotFound) {
      return {
        title: "Camera Not Found",
        icon: AlertCircle,
        steps: [
          "Make sure your camera is connected properly",
          "Check if other applications are using the camera",
          "Try refreshing the page",
          "Restart your browser if the issue persists",
        ],
      };
    }

    if (isCameraInUse) {
      return {
        title: "Camera Already in Use",
        icon: Settings,
        steps: [
          "Close other applications that might be using the camera",
          "Close other browser tabs with camera access",
          "Restart your browser",
          "Try again after closing conflicting applications",
        ],
      };
    }

    return {
      title: "Camera Setup Issue",
      icon: AlertCircle,
      steps: [
        "Check if your camera is working properly",
        "Try refreshing the page",
        "Make sure you have camera permissions enabled",
        "Contact support if the issue persists",
      ],
    };
  };

  if (!error) return null;

  const instructions = getInstructions();

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <instructions.icon className="w-5 h-5" />
          {instructions.title}
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {error}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Fix Steps:</strong>
          </AlertDescription>
        </Alert>

        <ol className="list-decimal list-inside space-y-2 text-sm">
          {instructions.steps.map((step, index) => (
            <li key={index} className="text-muted-foreground">
              {step}
            </li>
          ))}
        </ol>

        {instructions.browserSpecific && (
          <div className="mt-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Browser-Specific Instructions:
            </h4>
            <div className="space-y-2 text-sm">
              {Object.entries(instructions.browserSpecific).map(
                ([browser, instruction]) => (
                  <div key={browser} className="bg-background p-2 rounded">
                    <strong>{browser}:</strong> {instruction}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={onRetry}
            disabled={isLoading}
            className="gap-2 flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Try Again
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </Button>
        </div>

        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> The robot controller can still work without
            camera access, but gesture recognition will not be available. You
            can use manual controls instead.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CameraPermissionHelper;
