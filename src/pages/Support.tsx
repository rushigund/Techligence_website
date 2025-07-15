import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  FileText,
  Download,
} from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help with your Techligence robotics solutions. Our expert team
            is here to assist you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Get in touch with our technical support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">support@techligence.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">24/7 Support Available</span>
              </div>
              <Button className="w-full mt-4">Open Support Ticket</Button>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documentation
              </CardTitle>
              <CardDescription>
                Browse our comprehensive guides and tutorials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Badge variant="outline">Getting Started</Badge>
                <Badge variant="outline">API Reference</Badge>
                <Badge variant="outline">Hardware Setup</Badge>
                <Badge variant="outline">Troubleshooting</Badge>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Browse Docs
              </Button>
            </CardContent>
          </Card>

          {/* Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Downloads
              </CardTitle>
              <CardDescription>
                Software, drivers, and firmware updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Latest Downloads:</div>
                <div className="text-sm text-muted-foreground">
                  • Robot Control Software v2.1
                </div>
                <div className="text-sm text-muted-foreground">
                  • Firmware Update v1.8.3
                </div>
                <div className="text-sm text-muted-foreground">
                  • USB Drivers Package
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Downloads
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    How do I calibrate my robot?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Follow the calibration wizard in the R.T. Controller
                    interface. Ensure all sensors are clean and the robot is on
                    a flat surface.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Camera permissions not working?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure to allow camera access in your browser settings.
                    Refresh the page after granting permissions.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    How to upload URDF files?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the R.T. Controller and use the file upload
                    section. Supported formats include .urdf and .xacro files.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    ML Tools not responding?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure you have a stable internet connection. ML processing
                    requires good bandwidth for optimal performance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
