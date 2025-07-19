import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const AppStatus = () => {
  const [status, setStatus] = useState({
    react: true,
    router: false,
    api: false,
    demo: false,
  });

  useEffect(() => {
    // Check router
    setStatus((prev) => ({
      ...prev,
      router: !!window.location.pathname,
    }));

    // Check demo mode
    const isDemo = import.meta.env.VITE_DEMO_MODE === "true";
    setStatus((prev) => ({
      ...prev,
      demo: isDemo,
    }));

    // Test API
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => {
        setStatus((prev) => ({ ...prev, api: true }));
      })
      .catch(() => {
        setStatus((prev) => ({ ...prev, api: false }));
      });
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          App Status Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">React App:</span>
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Running
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">React Router:</span>
          <Badge variant={status.router ? "default" : "destructive"}>
            {status.router ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {status.router ? "Active" : "Error"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Backend API:</span>
          <Badge variant={status.api ? "default" : "secondary"}>
            {status.api ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <Info className="w-3 h-3 mr-1" />
            )}
            {status.api ? "Connected" : "Demo Mode"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Demo Mode:</span>
          <Badge variant={status.demo ? "secondary" : "outline"}>
            <Info className="w-3 h-3 mr-1" />
            {status.demo ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <div className="pt-3 text-xs text-muted-foreground">
          <div>URL: {window.location.href}</div>
          <div>Port: {window.location.port || "default"}</div>
          <div>Environment: {import.meta.env.MODE}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppStatus;
