import { useState, forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  Bot,
  User,
  LogIn,
  Settings,
  ChevronDown,
  ShoppingBag,
  Cpu,
  Zap,
  Shield,
  BookOpen,
  TrendingUp,
  Lightbulb,
  FileText,
  MessageSquare,
  Briefcase,
  Mail,
  Phone,
  Building,
  Wrench,
  Beaker,
  Brain,
  Eye,
  Users,
  Activity,
  Smile,
  Search,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import ShoppingCart from "./ShoppingCart";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Navigation structure with dropdowns
  const navigationConfig = {
    simple: [{ name: "Home", href: "/", icon: null }],
    dropdown: {
      products: {
        name: "Products",
        href: "/products",
        icon: ShoppingBag,
        items: [
          {
            title: "4WD Explorer Robots",
            href: "/products?category=exploration",
            description: "Advanced autonomous exploration robots",
            icon: Bot,
          },
          {
            title: "Industrial Automation",
            href: "/products?category=industrial",
            description: "Manufacturing and warehouse robotics",
            icon: Cpu,
          },
          {
            title: "AI-Powered Solutions",
            href: "/products?category=ai",
            description: "Machine learning integrated robots",
            icon: Zap,
          },
          {
            title: "Security & Surveillance",
            href: "/products?category=security",
            description: "Intelligent security robotics",
            icon: Shield,
          },
        ],
      },
      blog: {
        name: "Blog",
        href: "/blog",
        icon: BookOpen,
        items: [
          {
            title: "Latest Articles",
            href: "/blog",
            description: "Recent insights and updates",
            icon: TrendingUp,
          },
          {
            title: "Tutorials",
            href: "/blog?category=tutorials",
            description: "Step-by-step guides and how-tos",
            icon: FileText,
          },
          {
            title: "Industry News",
            href: "/blog?category=industry",
            description: "Latest robotics industry developments",
            icon: Building,
          },
          {
            title: "Innovation Hub",
            href: "/blog?category=innovation",
            description: "Cutting-edge research and breakthroughs",
            icon: Lightbulb,
          },
        ],
      },
      company: {
        name: "Company",
        href: "/about",
        icon: Building,
        items: [
          {
            title: "Career Opportunities",
            href: "/career",
            description: "Join our team of innovators",
            icon: Briefcase,
          },
          {
            title: "Contact Us",
            href: "/contact",
            description: "Get in touch with our team",
            icon: Mail,
          },
          {
            title: "About Techligence",
            href: "/about",
            description: "Learn about our mission and values",
            icon: Building,
          },
          {
            title: "Support Center",
            href: "/support",
            description: "Technical support and resources",
            icon: Phone,
          },
        ],
      },
    },
    simple_end: [{ name: "Robot Lab", href: "/robot-lab", icon: Beaker }],
  };

  const isActive = (href: string) => {
    // Controller should always stay highlighted as it's the main feature
    if (href === "/robot-lab") {
      return true;
    }

    // Don't highlight Home when we're on the home page (since Controller takes priority)
    if (location.pathname === "/" && href === "/") {
      return false;
    }

    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const isDropdownActive = (
    items: any[] | undefined,
    categories: any[] | undefined,
  ) => {
    if (categories) {
      return categories.some((category) =>
        category.items.some((item: any) => isActive(item.href)),
      );
    }
    if (items) {
      return items.some((item) => isActive(item.href));
    }
    return false;
  };

  const NavLink = forwardRef<
    HTMLAnchorElement,
    {
      item: any;
      mobile?: boolean;
    }
  >(({ item, mobile = false }, ref) => {
    const isController = item.href === "/controller";
    const isRobotLab = item.href === "/robot-lab";
    const shouldHighlight =
      isActive(item.href) || (isController && location.pathname === "/");

    return (
      <Link
        ref={ref}
        to={item.href}
        onClick={() => mobile && setIsOpen(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium",
          // Special styling for Robot Lab
          isRobotLab
            ? isActive(item.href)
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg ring-2 ring-orange-200 dark:ring-orange-800"
              : "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 border border-orange-200 dark:border-orange-800"
            : // Special styling for Controller
              isController
              ? shouldHighlight
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg ring-2 ring-orange-200 dark:ring-orange-800"
                : "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 border border-orange-200 dark:border-orange-800"
              : // Regular styling for other items
                isActive(item.href)
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
          mobile && "w-full justify-start",
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.name}
      </Link>
    );
  });

  const DropdownNavItem = ({
    config,
    mobile = false,
  }: {
    config: any;
    mobile?: boolean;
  }) => {
    // No special highlighting needed for dropdowns anymore

    if (mobile) {
      return (
        <div className="space-y-2">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium",
              isDropdownActive(config.items, config.categories)
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {config.icon && <config.icon className="h-4 w-4" />}
            {config.name}
          </div>
          <div className="ml-4 space-y-3">
            {config.categories
              ? config.categories.map(
                  (category: any, categoryIndex: number) => (
                    <div key={categoryIndex} className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-1">
                        {category.name}
                      </div>
                      {category.items.map((item: any, index: number) => (
                        <Link
                          key={index}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          )}
                        >
                          <item.icon className="h-3 w-3" />
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  ),
                )
              : config.items?.map((item: any, index: number) => (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    {item.title}
                  </Link>
                ))}
          </div>
        </div>
      );
    }

    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger
          className={cn(
            "bg-transparent hover:bg-accent data-[state=open]:bg-accent transition-all duration-200",
            isDropdownActive(config.items, config.categories) &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <div className="flex items-center gap-2">
            {config.icon && <config.icon className="h-4 w-4" />}
            {config.name}
          </div>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-[500px] p-4 md:w-[600px] lg:w-[700px]">
            {config.categories ? (
              <div className="space-y-6">
                {config.categories.map(
                  (category: any, categoryIndex: number) => (
                    <div key={categoryIndex}>
                      <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {category.name}
                      </h4>
                      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                        {category.items.map((item: any, index: number) => (
                          <NavigationMenuLink key={index} asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActive(item.href) &&
                                  "bg-primary text-primary-foreground",
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">
                                  {item.title}
                                </div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {config.items?.map((item: any, index: number) => (
                  <NavigationMenuLink key={index} asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        isActive(item.href) &&
                          "bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-4 w-4" />
                        <div className="text-sm font-medium leading-none">
                          {item.title}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            )}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F19ea23aafe364ba794f4649330baa0f9%2F6ab4735d62b8469981e63420c42401fc?format=webp&width=800"
                alt="Techligence Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Techligence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {/* Simple navigation items */}
                {navigationConfig.simple.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink asChild>
                      <NavLink item={item} />
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* Dropdown navigation items */}
                <DropdownNavItem config={navigationConfig.dropdown.products} />
                <DropdownNavItem config={navigationConfig.dropdown.blog} />
                <DropdownNavItem config={navigationConfig.dropdown.company} />

                {/* Simple end items */}
                {navigationConfig.simple_end.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink asChild>
                      <NavLink item={item} />
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <ShoppingCart />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Account
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 max-w-[80vw] overflow-y-auto"
            >
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>

              {/* Logo */}
              <div className="flex items-center space-x-2 mb-6 pt-4">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F19ea23aafe364ba794f4649330baa0f9%2F6ab4735d62b8469981e63420c42401fc?format=webp&width=800"
                    alt="Techligence Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <span className="font-display font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Techligence
                </span>
              </div>

              <div className="flex flex-col space-y-4">
                {/* Simple navigation items */}
                {navigationConfig.simple.map((item) => (
                  <NavLink key={item.name} item={item} mobile />
                ))}

                {/* Dropdown navigation items for mobile */}
                <DropdownNavItem
                  config={navigationConfig.dropdown.products}
                  mobile
                />
                <DropdownNavItem
                  config={navigationConfig.dropdown.blog}
                  mobile
                />
                <DropdownNavItem
                  config={navigationConfig.dropdown.company}
                  mobile
                />

                {/* Simple end items */}
                {navigationConfig.simple_end.map((item) => (
                  <NavLink key={item.name} item={item} mobile />
                ))}

                <hr className="my-4" />

                {/* Auth Buttons */}
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-start gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
