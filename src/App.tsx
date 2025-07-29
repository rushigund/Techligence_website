import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation
import { AuthProvider } from "./context/AuthContext"; // Ensure correct path to AuthContext
import Navigation from "./components/Navigation";
import Footer from "./components/Footer"; // Import Footer

import Index from "./pages/Index";
import Products from "./pages/Products";
import Controller from "./pages/Controller";
import Auth from "./pages/Auth";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";
import NewProductPage from "./pages/NewProductPage";
import NewBlogPostPage from "./pages/NewBlogPostPage";
import CreateJobListingForm from "./components/CreateJobListingForm";
import About from "./pages/About";
import Chatbot from "./components/Chatbot";
import MLTools from "./pages/MLTools"; // Import MLTools
import React from "react"; // Import React for useEffect
import RobotLab from "./pages/RobotLab"; // Import RobotLab page
import AdvancedURDFController from "./pages/AdvancedURDFController";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * ScrollToTop Component
 * This component listens for route changes and scrolls the window to the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    // Scroll to the top of the page on route change with smooth animation
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Added smooth behavior for animation
    });
  }, [pathname]); // Dependency array: re-run effect when pathname changes

  return null; // This component doesn't render anything
};

/**
 * App Component
 * This is the main application component, setting up routing, context providers,
 * and the overall layout.
 */
const App = () => (
  // Wrap the entire application with QueryClientProvider for React Query
  <QueryClientProvider client={queryClient}>
    {/* Provide authentication context to the entire app */}
    <AuthProvider>
      {/* Provide tooltip context */}
      <TooltipProvider>
        {/* Toast and Sonner components for notifications */}
        <Toaster />
        <Sonner />
        {/* BrowserRouter for client-side routing */}
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          {/* Include ScrollToTop component to handle auto-scrolling on navigation */}
          <ScrollToTop />
          {/* Main application container with a flexible column layout */}
          <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation bar */}
            <Navigation />
            {/* Main content area, takes available vertical space */}
            <div className="container mx-auto px-4 flex-1">
              {/* DemoModeBanner placeholder (if used) */}
              {/* <DemoModeBanner /> */}
            </div>
            {/* Define application routes */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/controller" element={<Controller />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
              <Route path="/admin/blog/new" element={<NewBlogPostPage />} />
              <Route
                path="/admin/blog/edit/:postId"
                element={<NewBlogPostPage />}
              />
              <Route path="/admin/products/new" element={<NewProductPage />} />
              <Route
                path="/admin/products/edit/:productId"
                element={<NewProductPage />}
              />
              <Route
                path="/admin/career/edit/:jobId"
                element={
                  <CreateJobListingForm
                    isOpen={true}
                    onClose={() => window.history.back()}
                  />
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/ml-tools" element={<MLTools />} />
              <Route path="/ml-tools/:tool" element={<MLTools />} />
              <Route
                path="/controller/advanced-urdf-controller"
                element={<AdvancedURDFController />}
              />
              <Route path="/robot-lab" element={<RobotLab />} />
              {/* Catch-all route for 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {/* Chatbot popup component */}
          <Chatbot />
          {/* Footer component */}
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
