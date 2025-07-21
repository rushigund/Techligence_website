import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import {
  Eye,
  Brain,
  Users,
  Activity,
  Smile,
  Search,
  ArrowLeft,
  Play,
  Upload,
} from "lucide-react";

const MLTools = () => {
  const { tool } = useParams();

  const toolsConfig = {
    "face-recognition": {
      title: "Face Recognition",
      description: "AI-powered facial recognition and analysis",
      icon: Eye,
      status: "Available",
      features: [
        "Real-time face detection",
        "Multi-face recognition",
        "Facial landmark detection",
        "Age and gender estimation",
      ],
    },
    "depth-estimation": {
      title: "Depth Estimation",
      description: "3D depth perception and spatial analysis",
      icon: Brain,
      status: "Beta",
      features: [
        "Monocular depth estimation",
        "3D point cloud generation",
        "Distance measurement",
        "Obstacle detection",
      ],
    },
    "age-estimation": {
      title: "Age Estimation",
      description: "Automated age detection and classification",
      icon: Users,
      status: "Available",
      features: [
        "Age range prediction",
        "Demographic analysis",
        "Real-time processing",
        "Batch image analysis",
      ],
    },
    "activity-estimation": {
      title: "Activity Estimation",
      description: "Real-time activity and behavior recognition",
      icon: Activity,
      status: "Coming Soon",
      features: [
        "Human pose estimation",
        "Activity classification",
        "Movement tracking",
        "Behavior analysis",
      ],
    },
    emotion: {
      title: "Emotion Detection",
      description: "Emotional state analysis and recognition",
      icon: Smile,
      status: "Available",
      features: [
        "7 basic emotions",
        "Confidence scoring",
        "Real-time analysis",
        "Expression tracking",
      ],
    },
    "object-detection": {
      title: "Object Detection",
      description: "Advanced object identification and tracking",
      icon: Search,
      status: "Available",
      features: [
        "80+ object classes",
        "Bounding box detection",
        "Real-time processing",
        "Custom model support",
      ],
    },
  };

  const currentTool = tool
    ? toolsConfig[tool as keyof typeof toolsConfig]
    : null;

  if (!currentTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ML Tools
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Advanced machine learning tools for robotics applications
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(toolsConfig).map(([key, tool]) => {
                const IconComponent = tool.icon;
                return (
                  <Card key={key} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={
                          tool.status === "Available"
                            ? "default"
                            : tool.status === "Beta"
                              ? "secondary"
                              : "outline"
                        }
                        className="mb-4"
                      >
                        {tool.status}
                      </Badge>
                      <Link to={`/ml-tools/${key}`}>
                        <Button className="w-full">Explore Tool</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = currentTool.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/ml-tools"
          className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ML Tools
        </Link>

        {/* Tool Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconComponent className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {currentTool.title}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            {currentTool.description}
          </p>
          <Badge
            variant={
              currentTool.status === "Available"
                ? "default"
                : currentTool.status === "Beta"
                  ? "secondary"
                  : "outline"
            }
            className="text-sm"
          >
            {currentTool.status}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tool Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Interface</CardTitle>
              <CardDescription>
                Upload or capture media to analyze with {currentTool.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Upload an image or start camera capture
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
              {currentTool.status === "Coming Soon" && (
                <div className="text-center text-muted-foreground">
                  <p>This tool is currently under development.</p>
                  <p>Check back soon for updates!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Key capabilities of {currentTool.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentTool.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technical Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technical Information</CardTitle>
            <CardDescription>
              Learn more about how {currentTool.title} works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Model Architecture</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced neural network models optimized for real-time
                  performance and accuracy.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Designed for edge deployment with low latency and high
                  throughput capabilities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Integration</h4>
                <p className="text-sm text-muted-foreground">
                  RESTful API endpoints available for seamless integration with
                  your robotics applications.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  All processing can be done locally to ensure data privacy and
                  security compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MLTools;