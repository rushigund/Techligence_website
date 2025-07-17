import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogAPI } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Heart,
  ArrowLeft,
  Bot,
  Cpu,
  Zap,
  BookOpen,
  Globe,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown'; // NEW: Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // NEW: Import remarkGfm for GitHub Flavored Markdown

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
  image: string;
  likes: number;
  comments: number;
  featured: boolean;
  content: string; // Full content of the blog post
}

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>(); // Get postId from URL
  const navigate = useNavigate();

  // Fetch single blog post using react-query
  const { data: blogPost, isLoading, isError, error } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", postId], // Unique key for this specific post
    queryFn: async () => {
      if (!postId) {
        throw new Error("Blog post ID is missing.");
      }
      const response = await blogAPI.getBlogPostById(parseInt(postId));
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch blog post.");
      }
    },
    enabled: !!postId, // Only run the query if postId is available
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading blog post...</p>
      </div>
    );
  }

  if (isError) {
    // Redirect to blog list if post not found or error
    useEffect(() => {
      toast.error(error?.message || "Failed to load blog post. It might not exist.");
      navigate("/blog");
    }, [error, navigate]);
    return null; // Don't render anything while redirecting
  }

  if (!blogPost) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Blog post not found.</p>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(blogPost.category);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <Button
        variant="outline"
        onClick={() => navigate("/blog")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Button>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="gap-1">
              <CategoryIcon className="w-3 h-3" />
              {blogPost.category.charAt(0).toUpperCase() + blogPost.category.slice(1)}
            </Badge>
            {blogPost.featured && <Badge variant="outline">Featured</Badge>}
          </div>

          <div className="text-6xl mb-4 text-center">{blogPost.image}</div>
          <CardTitle className="text-4xl lg:text-5xl font-display font-bold text-center mb-4">
            {blogPost.title}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            {blogPost.excerpt}
          </CardDescription>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{blogPost.author}</span>
              <span className="text-xs">({blogPost.authorRole})</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blogPost.publishedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blogPost.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{blogPost.likes} Likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{blogPost.comments} Comments</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
            {/* Render the full content here using ReactMarkdown */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blogPost.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostPage;
