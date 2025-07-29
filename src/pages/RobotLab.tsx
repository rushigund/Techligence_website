import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Settings,
  Eye,
  Brain,
  Users,
  Activity,
  Smile,
  Search,
  Menu,
  Pin,
  PinOff,
  ChevronRight,
  Play,
  Upload,
  Beaker,
} from "lucide-react";

// Individual tool components
const RTController = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Settings className="h-8 w-8 text-orange-500" />
        <h2 className="text-3xl font-bold">R.T. Controller</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Control robots with hand gestures and URDF uploads
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Robot Control Interface</CardTitle>
        <CardDescription>
          Integrated environment for robot control and URDF model visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            This is a preview of the R.T. Controller interface. Click below to
            access the full controller.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <a href="/controller">Open Full Controller</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const FaceRecognition = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Eye className="h-8 w-8 text-blue-500" />
        <h2 className="text-3xl font-bold">Face Recognition</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        AI-powered facial recognition and analysis
      </p>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Analyze faces in uploaded images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Upload an image for analysis
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Live Camera</CardTitle>
          <CardDescription>Real-time face recognition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Camera feed will appear here
              </p>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const DepthEstimation = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Brain className="h-8 w-8 text-purple-500" />
        <h2 className="text-3xl font-bold">Depth Estimation</h2>
      </div>
      <Badge variant="secondary" className="mb-4">
        Beta
      </Badge>
      <p className="text-muted-foreground mb-6">
        3D depth perception and spatial analysis
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Monocular Depth Estimation</CardTitle>
        <CardDescription>
          Estimate depth from single camera input using advanced neural networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Input Image</p>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Depth Map</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image for Depth Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AgeEstimation = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Users className="h-8 w-8 text-green-500" />
        <h2 className="text-3xl font-bold">Age Estimation</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Automated age detection and classification
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Age Detection Interface</CardTitle>
        <CardDescription>
          Upload images or use live camera to estimate age ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Age estimation tool is ready for deployment
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ActivityEstimation = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Activity className="h-8 w-8 text-red-500" />
        <h2 className="text-3xl font-bold">Activity Estimation</h2>
      </div>
      <Badge variant="outline" className="mb-4">
        Coming Soon
      </Badge>
      <p className="text-muted-foreground mb-6">
        Real-time activity and behavior recognition
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Human Activity Recognition</CardTitle>
        <CardDescription>
          Detect and classify human activities in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            This tool is currently under development
          </p>
          <p className="text-sm text-muted-foreground">
            Expected features: Pose estimation, Activity classification,
            Movement tracking
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EmotionDetection = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Smile className="h-8 w-8 text-yellow-500" />
        <h2 className="text-3xl font-bold">Emotion Detection</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Emotional state analysis and recognition
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Emotion Analysis</CardTitle>
        <CardDescription>
          Detect and analyze emotional expressions in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Smile className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Camera feed</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Detected Emotions</h4>
            <div className="space-y-2">
              {[
                "Happy",
                "Sad",
                "Angry",
                "Surprised",
                "Fearful",
                "Disgusted",
                "Neutral",
              ].map((emotion) => (
                <div
                  key={emotion}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm">{emotion}</span>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-0"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ObjectDetection = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Search className="h-8 w-8 text-cyan-500" />
        <h2 className="text-3xl font-bold">Object Detection</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Advanced object identification and tracking
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Object Detection Interface</CardTitle>
        <CardDescription>
          Detect and classify objects in images and video streams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
            <Search className="h-12 w-12 text-muted-foreground" />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">80+ Object Classes</Badge>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Detection Results</h4>
            <div className="text-sm text-muted-foreground">
              Objects detected will appear here with confidence scores and
              bounding boxes
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Detection
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const RobotLab = () => {
  const [selectedTool, setSelectedTool] = useState("rt-controller");
  const [sidebarFixed, setSidebarFixed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const tools = [
    {
      id: "rt-controller",
      name: "R.T. Controller",
      icon: Settings,
      component: RTController,
      category: "Robot Control",
    },
    {
      id: "face-recognition",
      name: "Face Recognition",
      icon: Eye,
      component: FaceRecognition,
      category: "ML Tools",
    },
    {
      id: "depth-estimation",
      name: "Depth Estimation",
      icon: Brain,
      component: DepthEstimation,
      category: "ML Tools",
    },
    {
      id: "age-estimation",
      name: "Age Estimation",
      icon: Users,
      component: AgeEstimation,
      category: "ML Tools",
    },
    {
      id: "activity-estimation",
      name: "Activity Estimation",
      icon: Activity,
      component: ActivityEstimation,
      category: "ML Tools",
    },
    {
      id: "emotion-detection",
      name: "Emotion Detection",
      icon: Smile,
      component: EmotionDetection,
      category: "ML Tools",
    },
    {
      id: "object-detection",
      name: "Object Detection",
      icon: Search,
      component: ObjectDetection,
      category: "ML Tools",
    },
  ];

  const selectedToolData = tools.find((tool) => tool.id === selectedTool);
  const SelectedToolComponent = selectedToolData?.component || RTController;

  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  const sidebarExpanded = sidebarFixed || sidebarHovered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur border-r transition-all duration-300 z-40",
            sidebarExpanded ? "w-64" : "w-16",
          )}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {sidebarExpanded && (
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Robot Lab</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarFixed(!sidebarFixed)}
                className="ml-auto"
              >
                {sidebarFixed ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-2 space-y-1">
            {categories.map((category) => (
              <div key={category}>
                {sidebarExpanded && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </div>
                )}
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Button
                        key={tool.id}
                        variant={selectedTool === tool.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3",
                          !sidebarExpanded && "px-3",
                          selectedTool === tool.id &&
                            "bg-orange-500 hover:bg-orange-600",
                        )}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {sidebarExpanded && (
                          <>
                            <span className="truncate">{tool.name}</span>
                            <ChevronRight className="h-3 w-3 ml-auto" />
                          </>
                        )}
                      </Button>
                    );
                  })}
                {sidebarExpanded &&
                  category !== categories[categories.length - 1] && (
                    <Separator className="my-2" />
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarExpanded ? "ml-64" : "ml-16",
          )}
        >
          {/* Header */}
          <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarFixed(!sidebarFixed)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Robot Lab
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced robotics and machine learning tools
                  </p>
                </div>
              </div>
              <Badge variant="outline">{selectedToolData?.category}</Badge>
            </div>
          </div>

          {/* Tool Content */}
          <div className="p-6">
            <SelectedToolComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotLab;
