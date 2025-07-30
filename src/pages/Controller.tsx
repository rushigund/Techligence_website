import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { MoveRight, Bot } from "lucide-react"; // Import Bot icon
import { Badge } from "@/components/ui/badge"; // Import Badge component
import ShoppingCart from "@/components/ShoppingCart"; // Import ShoppingCart component
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { useToast } from "@/components/ui/use-toast"; // Import useToast for messages

const ControllerLandingPage = () => {
  const { isAuthenticated } = useAuth(); // Get isAuthenticated status from AuthContext
  const navigate = useNavigate(); // Initialize navigate for programmatic redirection
  const { toast } = useToast(); // Initialize toast for messages

  const handleGetStarted = () => {
    
    if (isAuthenticated) {
      // If authenticated, open the controller in a new tab
      navigate("/controller/advanced-urdf-controller");
    } else {
      // If not authenticated, show a toast message and redirect to auth page
      toast({
        title: "Authentication Required",
        description: "You need to sign in to access the controller.",
        variant: "destructive", // Use a destructive variant for error messages
      });
      navigate("/auth"); // Redirect to the authentication page
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header - Modified from Products page for Controller Landing */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center relative">
            {/* Shopping Cart Button (can be removed if not relevant for a controller landing page) */}
            

            <Badge variant="outline" className="mb-4">
              <Bot className="w-3 h-3 mr-1" />
              Revolutionize Robot Control
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              The Ultimate <span className="text-primary">3D Gesture</span> Controller
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience unparalleled precision and intuitive interaction. Our cutting-edge controller brings your robots to life with natural hand movements.
            </p>

            {/* Modified Button for conditional access */}
            <Button
              size="lg"
              className=" m-5 px-10 py-4 text-xl rounded-full bg-white text-primary hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={handleGetStarted} // Call the handler function
            >
              Get Started with the Controller
              <MoveRight className="ml-2 w-6 h-6" />
            </Button>

          </div>
          
        </div>
      </section>

      {/* Feature Section 1: Gesture Control */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Control with a Wave of Your Hand
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Our 3D Robot Controller leverages cutting-edge computer vision to interpret your hand gestures in real-time. Say goodbye to complex joysticks and clunky interfaces – command your robot naturally and intuitively.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-200">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Real-time gesture recognition
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Natural and intuitive control
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Reduces learning curve for robot operation
              </li>
            </ul>
          </div>
          <div className="relative flex justify-center items-center">
            <img
              src="img1.png" // Replace with an actual GIF/image of gesture control
              alt="Gesture Control"
              className="rounded-lg shadow-2xl object-cover w-full max-w-md md:max-w-none transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
              Intuitive
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: URDF Visualization */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 md:order-1 flex justify-center items-center">
            <img
              src="img2.png" // Replace with an actual image of URDF visualization
              alt="URDF Visualization"
              className="rounded-lg shadow-2xl object-cover w-full max-w-md md:max-w-none transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
              Dynamic
            </div>
          </div>
          <div className="text-center md:text-left order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Visualize Any Robot in 3D
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Our controller allows you to upload and visualize your robot's URDF (Unified Robot Description Format) models in a dynamic 3D environment. See your robot respond to your gestures in real-time, even before deploying to hardware.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-200">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Supports URDF and XACRO formats
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Real-time 3D model interaction
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Ideal for simulation and prototyping
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits/Use Cases Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800 dark:text-white">
            Transforming Robotics Interactions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Prototyping</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Rapidly test and refine robot movements and interactions in a simulated environment.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Education</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Provide an engaging and interactive way for students to learn about robotics.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Operation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enable more intuitive and accessible control for a wide range of robotic applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience the Future of Control?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Join the revolution in human-robot interaction. It's time to take control, literally.
          </p>
          
          {/* Modified Button for conditional access */}
          <Button
            size="lg"
            className="px-10 py-4 text-xl rounded-full bg-white text-primary hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
            onClick={handleGetStarted} // Call the handler function
          >
            Get Started with the Controller
            <MoveRight className="ml-2 w-6 h-6" />
          </Button>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-gray-300 text-center text-sm">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} Techligence Robotics. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ControllerLandingPage;
