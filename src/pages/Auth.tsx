import { useState, useEffect } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Lock,
  Bot,
  Shield,
  Zap,
  Github,
  Chrome,
  Eye,
  EyeOff,
  Loader2, // Import for loading spinner
} from "lucide-react";

import { useAuth } from "@/context/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const Auth = () => {
  // State for password visibility
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for Sign In form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  // State for Sign Up form
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Access authentication functions from context
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Redirect if already authenticated (e.g., user lands on /auth but is already logged in)
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/"); // Redirect to home page
    }
  }, [isAuthenticated, authLoading, navigate]);


  // Features list (remains unchanged)
  const features = [
    {
      icon: Bot,
      title: "Robot Control Access",
      description: "Full access to our advanced robot controller interface",
    },
    {
      icon: Shield,
      title: "Secure Dashboard",
      description: "Encrypted data and secure cloud storage for your projects",
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant synchronization across all your devices",
    },
  ];

  // Handle Sign In form submission
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError(""); // Clear previous errors
    setIsSigningIn(true);
    try {
      await login(signInEmail, signInPassword);
      console.log("Sign in successful!");
      navigate("/"); // Redirect to home page on successful login
    } catch (error) {
      console.error("Sign in failed:", error);
      setSignInError(error.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign Up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError(""); // Clear previous errors

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
        setSignUpError("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }

    setIsSigningUp(true);
    try {
      await register({
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        password: signUpPassword,
      });
      console.log("Sign up successful!");
      navigate("/"); // Redirect to home page on successful registration
    } catch (error) {
      console.error("Sign up failed:", error);
      setSignUpError(error.message || "An unexpected error occurred during sign up.");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-inter"> {/* Added font-inter */}
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <User className="w-3 h-3 mr-1" />
              Account Access
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Join the <span className="text-primary">Techligence</span> Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create your account to access advanced robot control features,
              exclusive content, and connect with fellow robotics enthusiasts.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Form */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">
                  Unlock Premium Features
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join thousands of engineers, researchers, and robotics
                  enthusiasts who trust Techligence for their robotic automation
                  needs.
                </p>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-semibold mb-4">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    Access to all robot controllers
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Priority customer support
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Early access to new features
                  </li>
                </ul>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="w-full">
              <Card className="border-0 shadow-xl rounded-xl"> {/* Added rounded-xl */}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-display">
                    Welcome to Techligence
                  </CardTitle>
                  <CardDescription>
                    Sign in to your account or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* Sign In Form */}
                    <TabsContent value="signin" className="space-y-6">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signin-email"
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 rounded-md" // Added rounded-md
                              required
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signin-password"
                              name="password"
                              type={showSignInPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signInPassword}
                              onChange={(e) => setSignInPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() => setShowSignInPassword(!showSignInPassword)}
                            >
                              {showSignInPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {signInError && (
                          <p className="text-red-500 text-sm">{signInError}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="remember" name="remember" className="rounded" /> {/* Added rounded */}
                            <Label htmlFor="remember" className="text-sm">
                              Remember me
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-sm text-primary"
                          >
                            Forgot password?
                          </Button>
                        </div>

                        <Button type="submit" className="w-full rounded-md" size="lg" disabled={isSigningIn}> {/* Added rounded-md */}
                          {isSigningIn ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full rounded" /> {/* Added rounded */}
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="gap-2 rounded-md"> {/* Added rounded-md */}
                          <Github className="h-4 w-4" />
                          GitHub
                        </Button>
                        <Button variant="outline" className="gap-2 rounded-md"> {/* Added rounded-md */}
                          <Chrome className="h-4 w-4" />
                          Google
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Sign Up Form */}
                    <TabsContent value="signup" className="space-y-6">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input
                              id="first-name"
                              name="firstName"
                              type="text"
                              placeholder="John"
                              className="rounded-md" // Added rounded-md
                              required
                              value={signUpFirstName}
                              onChange={(e) => setSignUpFirstName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input
                              id="last-name"
                              name="lastName"
                              type="text"
                              placeholder="Doe"
                              className="rounded-md" // Added rounded-md
                              required
                              value={signUpLastName}
                              onChange={(e) => setSignUpLastName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 rounded-md" // Added rounded-md
                              required
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              name="password"
                              type={showSignUpPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signUpPassword}
                              onChange={(e) => setSignUpPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            >
                              {showSignUpPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signUpConfirmPassword}
                              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {signUpError && (
                          <p className="text-red-500 text-sm">{signUpError}</p>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            name="terms"
                            required
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(!!checked)} // Fixed: Cast to boolean
                            className="rounded" // Added rounded
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I agree to the{" "}
                            <Button
                              type="button"
                              variant="link"
                              className="px-0 text-sm text-primary h-auto"
                            >
                              Terms of Service
                            </Button>{" "}
                            and{" "}
                            <Button
                              type="button"
                              variant="link"
                              className="px-0 text-sm text-primary h-auto"
                            >
                              Privacy Policy
                            </Button>
                          </Label>
                        </div>

                        <Button type="submit" className="w-full rounded-md" size="lg" disabled={isSigningUp}> {/* Added rounded-md */}
                          {isSigningUp ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full rounded" /> {/* Added rounded */}
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="gap-2 rounded-md"> {/* Added rounded-md */}
                          <Github className="h-4 w-4" />
                          GitHub
                        </Button>
                        <Button variant="outline" className="gap-2 rounded-md"> {/* Added rounded-md */}
                          <Chrome className="h-4 w-4" />
                          Google
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
