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
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Cpu,
  Bot,
  Zap,
  Globe,
  Clock,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  Loader2, // Import Loader2 for loading state
  Edit, // Import Edit icon
  Trash2, // Import Trash2 icon
  PlusCircle, // For "Add New Post" button
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { blogAPI } from "@/services/api"; // Import blogAPI
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Define interface for BlogPost to match backend schema
interface BlogPost {
  postId: number;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string; // Will be a string from backend, convert to Date for formatting
  readTime: string;
  category: string;
  image: string; // Emoji or URL
  likes: number;
  comments: number;
  featured: boolean;
  content: string; // Full content
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get query client for invalidation
  const { user, isAuthenticated } = useAuth(); // Get user and isAuthenticated from AuthContext

  // Determine if the current user is an admin
  const isAdmin = isAuthenticated && user?.role === "admin";

  // Fetch blog posts using react-query
  const { data: fetchedBlogPosts, isLoading, isError, error } = useQuery<BlogPost[], Error>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await blogAPI.getBlogPosts();
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch blog posts.");
      }
    },
  });

  const allPosts = fetchedBlogPosts || [];
  const featuredPosts = allPosts.filter(post => post.featured);
  const regularPosts = allPosts.filter(post => !post.featured);

  // Update categories counts dynamically based on fetched data
  const categories = [
    { id: "all", name: "All Posts", count: allPosts.length },
    { id: "robotics", name: "Robotics", count: allPosts.filter(p => p.category === "robotics").length },
    { id: "ai", name: "Artificial Intelligence", count: allPosts.filter(p => p.category === "ai").length },
    { id: "technology", name: "Technology", count: allPosts.filter(p => p.category === "technology").length },
    { id: "tutorials", name: "Tutorials", count: allPosts.filter(p => p.category === "tutorials").length },
    { id: "industry", name: "Industry News", count: allPosts.filter(p => p.category === "industry").length },
    { id: "innovation", name: "Innovation", count: allPosts.filter(p => p.category === "innovation").length },
  ];

  const filteredPosts = regularPosts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      robotics: Bot,
      ai: Cpu,
      technology: Zap,
      tutorials: BookOpen,
      industry: Globe,
      innovation: Lightbulb,
    };
    return icons[category] || BookOpen;
  };

  // Handle blog post update - navigate to edit page
  const handleUpdateBlogPost = (postId: number) => {
    navigate(`/admin/blog/edit/${postId}`); // Assuming a route like /admin/blog/edit/:postId
  };

  // Handle blog post delete
  const handleDeleteBlogPost = async (postId: number) => {
    if (window.confirm(`Are you sure you want to delete blog post with ID: ${postId}? This action cannot be undone.`)) {
      try {
        const response = await blogAPI.deleteBlogPost(postId);
        if (response.data.success) {
          toast.success(`Blog post ${postId} deleted successfully!`);
          queryClient.invalidateQueries({ queryKey: ["blogPosts"] }); // Invalidate to refetch list
        } else {
          toast.error(response.data.message || `Failed to delete blog post ${postId}.`);
        }
      } catch (error: any) {
        console.error("Delete blog post error:", error);
        toast.error(error.response?.data?.message || "An error occurred during deletion.");
      }
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading blog posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>Error loading blog posts: {error?.message || "Unknown error"}</p>
        <p>Please ensure your backend is running and accessible.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <BookOpen className="w-3 h-3 mr-1" />
              Techligence Blog
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Insights & Innovation in{" "}
              <span className="text-primary">Robotics</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stay updated with the latest trends, tutorials, and breakthrough
              technologies in robotics, AI, and automation. Expert insights from
              our team and industry leaders.
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
            {/* Admin-only Add New Post Button */}
            {isAdmin && (
              <div className="mt-8">
                <Link to="/admin/blog/new"> {/* Assuming a route for adding new blog posts */}
                  <Button size="lg" className="gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Add New Blog Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                {category.id !== "all" &&
                  (() => {
                    const IconComponent = getCategoryIcon(category.id);
                    return <IconComponent className="w-3 h-3" />;
                  })()}
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="w-3 h-3 mr-1" />
                Featured Articles
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Must-Read Posts
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our most popular and insightful articles on robotics and
                technology.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {featuredPosts.map((post) => (
                <Card
                  key={post.postId}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">Featured</Badge>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* Admin-only Edit and Delete Buttons */}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateBlogPost(post.postId)}
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlogPost(post.postId)}
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments}
                        </div>
                      </div>
                    </div>

                    <div className="text-4xl mb-4">{post.image}</div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.authorRole}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>

                    <Link to={`/blog/${post.postId}`} className="w-full">
                      <Button className="w-full mt-4 gap-2 group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Latest Articles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our latest insights, tutorials, and industry analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card
                key={post.postId}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                      {categories.find((c) => c.id === post.category)?.name}
                    </Badge>
                    <div className="flex items-center gap-2"> {/* Added flex container for buttons */}
                      {/* Admin-only Edit and Delete Buttons */}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateBlogPost(post.postId)}
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBlogPost(post.postId)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-3xl mb-4">{post.image}</div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{post.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.publishedDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>

                  <Link to={`/blog/${post.postId}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss the latest insights in
            robotics and AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white"
            />
            <Button variant="secondary" className="gap-2">
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
