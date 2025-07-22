import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import AppStatus from "@/components/AppStatus";
import {
  ArrowRight,
  Bot, // Keep Bot import if it's used elsewhere, otherwise it can be removed
  Cpu,
  Zap,
  Shield,
  Brain,
  Cog,
  Users,
  Award,
  ChevronRight,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Bot, // This is where the Bot icon is still used for features, so keep the import
      title: "Advanced Robotics",
      description:
        "Cutting-edge robotic systems with AI-powered autonomous navigation and decision making.",
    },
    {
      icon: Cpu,
      title: "Intelligent Processing",
      description:
        "High-performance computing cores optimized for real-time robotic control and machine learning.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Ultra-responsive systems with microsecond precision for critical robotic operations.",
    },
    {
      icon: Shield,
      title: "Built for Reliability",
      description:
        "Enterprise-grade reliability with 99.9% uptime and fail-safe mechanisms.",
    },
  ];

  const stats = [
    { value: "10+", label: "Robots Deployed" },
    { value: "99.9%", label: "Uptime" },
    { value: "1+", label: "Countries" },
    { value: "24/7", label: "Support" },
  ];

  const applications = [
    {
      title: "Industrial Automation",
      description: "Streamline manufacturing processes with precision robotics",
      image: "🏭",
    },
    {
      title: "Healthcare Assistance",
      description:
        "Support medical professionals with intelligent robotic aids",
      image: "🏥",
    },
    {
      title: "Logistics & Warehousing",
      description: "Optimize supply chain operations with automated systems",
      image: "📦",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:50px_50px] opacity-20" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge variant="secondary" className="mb-4">
                <Brain className="w-3 h-3 mr-1" />
                Next-Gen Robotics
              </Badge>
              <h1 className="text-4xl lg:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                The Future of
                <br />
                Intelligent Robotics
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Revolutionizing industries with advanced AI-powered robotics.
                Our cutting-edge 4WD robots deliver unprecedented precision,
                reliability, and intelligence for the modern world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/products">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Explore Products
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/controller">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 text-lg px-8"
                  >
                    <Cog className="w-5 h-5" />
                    Try Controller
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                {/* Replaced Bot icon with an image for the GIF */}
                <img
                  src="/robot.gif" // IMPORTANT: Make sure this path matches your GIF file's name and location in the public folder
                  alt="Techligence Robot in action" // Descriptive alt text for accessibility
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                />
                <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="absolute bottom-8 left-8 w-2 h-2 bg-secondary rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              Why Choose Techligence
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
              Engineering Excellence
              <br />
              <span className="text-primary">Meets Innovation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our robotics solutions combine decades of engineering expertise
              with cutting-edge AI technology to deliver unmatched performance
              and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Users className="w-3 h-3 mr-1" />
              Real-World Impact
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
              Transforming Industries
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From manufacturing floors to healthcare facilities, our robotics
              solutions are making a difference across diverse industries
              worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {applications.map((app, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{app.image}</div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {app.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {app.description}
                  </CardDescription>
                  <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                    <Link to="/about"> Learn More</Link>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-6">
            Ready to Shape the Future?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the robotics revolution. Explore our advanced 4WD robots and
            experience the next generation of intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-lg px-8"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 border-white text-primary"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* App Status Section - Development Only
      {import.meta.env.DEV && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <AppStatus />
          </div>
        </section>
      )} */}
    </div>
  );
};

export default Index;
