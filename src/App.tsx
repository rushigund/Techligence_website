import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";

import Index from "./pages/Index";
import Products from "./pages/Products";
import Controller from "./pages/Controller";
import Auth from "./pages/Auth";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import NewProductPage from "./pages/NewProductPage";
import BlogPostPage from "./pages/BlogPostPage";
import NewBlogPostPage from "./pages/NewBlogPostPage";
import CreateJobListingForm from "./components/CreateJobListingForm";
import About from "./pages/About";
import Chatbot from "./components/Chatbot"; // Import the Chatbot component (assuming it's now in components folder)
import MLTools from "./pages/MLTools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  // <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navigation />
              <div className="container mx-auto px-4">
                {/* <DemoModeBanner /> */}
              </div>
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
                <Route path="/admin/blog/edit/:postId" element={<NewBlogPostPage />} />
                <Route path="/admin/products/new" element={<NewProductPage />} />
                <Route path="/admin/products/edit/:productId" element={<NewProductPage />} />
                <Route path="/admin/career/edit/:jobId" element={<CreateJobListingForm isOpen={true} onClose={() => window.history.back()} />} />
                <Route path="/about" element={<About />} />
                <Route path="/ml-tools" element={<MLTools />} />
                <Route path="/ml-tools/:tool" element={<MLTools />} />
                {/* Removed: <Route path="/chatbot" element={<Chatbot />} /> */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Chatbot /> {/* NEW: Render Chatbot component directly for popup */}
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  // </ErrorBoundary>
);

export default App;
