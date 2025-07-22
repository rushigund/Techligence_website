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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import ShoppingCartComponent from "@/components/ShoppingCart"; // Renamed to avoid conflict

import {
  Bot,
  Cpu,
  Battery,
  Gauge,
  Shield,
  Camera,
  ArrowRight,
  Star,
  Zap,
  CheckCircle,
  Filter,
  ShoppingCartIcon,
  Heart,
  Share2,
  Truck,
//  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { addItem } = useCartStore();

  // Helper to format prices for display in INR
  const formatINRPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const addToCart = (robot: any) => {
    addItem({
      id: robot.id,
      name: robot.name,
      price: robot.price, // Now robot.price is already a number (INR)
      priceValue: robot.price, // priceValue directly uses the INR number
      image: robot.image,
      specifications: robot.specs,
    });
    toast.success(`${robot.name} added to cart!`);
  };

  const toggleFavorite = (robotId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(robotId)) {
        newFavorites.delete(robotId);
        toast.info("Removed from favorites");
      } else {
        newFavorites.add(robotId);
        toast.success("Added to favorites!");
      }
      return newFavorites;
    });
  };

  // Robot data with prices in INR (approx. 1 USD = 83 INR)
  const robots = [
    {
      id: 1,
      name: "Techligence Explorer Pro",
      category: "exploration",
      price: 10789, // Was $12,999 USD -> 12999 * 83 INR
      originalPrice: 13279, // Was $15,999 USD -> 15999 * 83 INR
      rating: 4.8,
      reviews: 324,
      image: "🤖",
      description:
        "Advanced 4WD exploration robot with AI-powered autonomous navigation and environmental mapping capabilities.",
      features: [
        "360° LiDAR Mapping",
        "AI Obstacle Avoidance",
        "12-Hour Battery Life",
        "Weather Resistant IP67",
        "Real-time Data Streaming",
      ],
      specs: {
        speed: "5 m/s",
        payload: "15 kg",
        range: "10 km",
        battery: "12 hours",
      },
      badge: "Best Seller",
      badgeVariant: "default" as const,
      inStock: true,
      stockCount: 12,
      shippingTime: "2-3 days",
      warranty: "2 years",
    },
    {
      id: 2,
      name: "Industrial Titan X1",
      category: "industrial",
      price: 20749, // Was $24,999 USD -> 24999 * 83 INR
      originalPrice: 24849, // Was $29,999 USD -> 29999 * 83 INR
      rating: 4.9,
      reviews: 156,
      image: "🏗️",
      description:
        "Heavy-duty 4WD industrial robot designed for manufacturing environments with precision control and safety systems.",
      features: [
        "50kg Payload Capacity",
        "Precision Actuators",
        "Safety Monitoring",
        "Integration APIs",
        "24/7 Operation Ready",
      ],
      specs: {
        speed: "3 m/s",
        payload: "50 kg",
        range: "Unlimited",
        battery: "Wired/Battery",
      },
      badge: "Enterprise",
      badgeVariant: "secondary" as const,
      inStock: true,
      stockCount: 8,
      shippingTime: "5-7 days",
      warranty: "3 years",
    },
    {
      id: 3,
      name: "Swift Scout V2",
      category: "surveillance",
      price: 74691, // Was $8,999 USD -> 8999 * 83 INR
      originalPrice: 82991, // Was $9,999 USD -> 9999 * 83 INR
      rating: 4.7,
      reviews: 89,
      image: "👁️",
      description:
        "Compact 4WD surveillance robot with advanced camera systems and silent operation for security applications.",
      features: [
        "4K Night Vision",
        "Silent Operation",
        "Motion Detection",
        "Remote Control",
        "Cloud Recording",
      ],
      specs: {
        speed: "8 m/s",
        payload: "5 kg",
        range: "5 km",
        battery: "8 hours",
      },
      badge: "New",
      badgeVariant: "destructive" as const,
      inStock: true,
      stockCount: 15,
      shippingTime: "1-2 days",
      warranty: "1 year",
    },
    {
      id: 4,
      name: "Research Rover Alpha",
      category: "research",
      price: 15769, // Was $18,999 USD -> 18999 * 83 INR
      originalPrice: 18259, // Was $21,999 USD -> 21999 * 83 INR
      rating: 4.6,
      reviews: 67,
      image: "🔬",
      description:
        "Scientific 4WD research robot equipped with modular sensor arrays and data collection systems for laboratory use.",
      features: [
        "Modular Sensors",
        "Data Logging",
        "Sterile Operation",
        "Precise Positioning",
        "Remote Monitoring",
      ],
      specs: {
        speed: "2 m/s",
        payload: "20 kg",
        range: "Indoor",
        battery: "16 hours",
      },
      badge: "Scientific",
      badgeVariant: "outline" as const,
      inStock: true,
      stockCount: 5,
      shippingTime: "3-5 days",
      warranty: "2 years",
    },
  ];

  const categories = [
    { id: "all", name: "All Products", count: robots.length },
    {
      id: "exploration",
      name: "Exploration",
      count: robots.filter((r) => r.category === "exploration").length,
    },
    {
      id: "industrial",
      name: "Industrial",
      count: robots.filter((r) => r.category === "industrial").length,
    },
    {
      id: "surveillance",
      name: "Surveillance",
      count: robots.filter((r) => r.category === "surveillance").length,
    },
    {
      id: "research",
      name: "Research",
      count: robots.filter((r) => r.category === "research").length,
    },
  ];

  const filteredRobots =
    selectedCategory === "all"
      ? robots
      : robots.filter((robot) => robot.category === selectedCategory);

  const SpecBadge = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center relative">
            {/* Shopping Cart Button - Using the dedicated component */}
            <div className="absolute top-0 right-0">
              <ShoppingCartComponent />
            </div>

            <Badge variant="outline" className="mb-4">
              <Bot className="w-3 h-3 mr-1" />
              Advanced Robotics Store
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Our <span className="text-primary">4WD Robot</span> Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our premium line of 4WD robots engineered for precision,
              reliability, and performance. Shop with confidence - Free shipping
              on all orders!
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Filter by Category:</span>
          </div>
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full lg:w-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {filteredRobots.map((robot) => (
              <Card
                key={robot.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={robot.badgeVariant}>{robot.badge}</Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(robot.id)}
                        className="h-8 w-8"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(robot.id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full h-48 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 relative">
                    <div className="text-6xl">{robot.image}</div>
                    {!robot.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {robot.rating}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({robot.reviews} reviews)
                    </span>
                  </div>

                  <CardTitle className="text-xl font-display mb-2">
                    {robot.name}
                  </CardTitle>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatINRPrice(robot.price)} {/* Format for display */}
                    </div>
                    {robot.originalPrice && (
                      <div className="text-lg text-muted-foreground line-through">
                        {formatINRPrice(robot.originalPrice)}{" "}
                        {/* Format for display */}
                      </div>
                    )}
                  </div>

                  {/* Stock & Shipping Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        {robot.inStock
                          ? `In Stock (${robot.stockCount} available)`
                          : "Currently unavailable"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" />
                      <span>Ships in {robot.shippingTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>{robot.warranty} warranty included</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <CardDescription className="text-base leading-relaxed">
                    {robot.description}
                  </CardDescription>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <SpecBadge
                      icon={Gauge}
                      label="Max Speed"
                      value={robot.specs.speed}
                    />
                    <SpecBadge
                      icon={Zap}
                      label="Payload"
                      value={robot.specs.payload}
                    />
                    <SpecBadge
                      icon={Camera}
                      label="Range"
                      value={robot.specs.range}
                    />
                    <SpecBadge
                      icon={Battery}
                      label="Battery"
                      value={robot.specs.battery}
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="space-y-2">
                      {robot.features.slice(0, 3).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {feature}
                        </div>
                      ))}
                      {robot.features.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{robot.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purchase Actions */}
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full gap-2 text-lg h-12"
                      onClick={() => addToCart(robot)}
                      disabled={!robot.inStock}
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      {robot.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="gap-2">
                        <Bot className="w-4 h-4" />
                        View Details
                      </Button>
                      <Link to="/controller" className="w-full">
                        <Button variant="outline" className="w-full gap-2">
                          <ArrowRight className="w-4 h-4" />
                          Try Demo
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Financing Option */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Starting at{" "}
                      <span className="font-bold">
                        {formatINRPrice(Math.round(robot.price / 24))}
                        /month
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      0% APR for 24 months
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRobots.length === 0 && (
            <div className="text-center py-16">
              <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No robots found in this category
              </h3>
              <p className="text-muted-foreground">
                Try selecting a different category to see our available robots.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our engineering team can customize any robot to meet your specific
            requirements. Contact us to discuss your unique needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to='/contact'>
            <Button size="lg" className="gap-2">
              <Cpu className="w-5 h-5" />
              Request Custom Quote
            </Button>
            </Link>
            <Link to="/controller">
              <Button variant="outline" size="lg" className="gap-2">
                Test Drive Controller
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
 