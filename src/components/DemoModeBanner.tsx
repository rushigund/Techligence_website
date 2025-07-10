import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Zap } from "lucide-react";
import { isDemoMode } from "@/services/api";

const DemoModeBanner = () => {
  if (!isDemoMode()) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 mb-6">
      <Zap className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Demo Mode Active</strong> - You're viewing a demonstration
          version with simulated data. All features are functional but no real
          robots will be controlled.
        </div>
        <Badge variant="secondary" className="ml-4">
          <Info className="w-3 h-3 mr-1" />
          Demo
        </Badge>
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeBanner;
