import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Corrected import path for AuthContext
import { blogAPI } from "@/services/api"; // Import blogAPI

// Define the type for blog post data
interface BlogPostFormData {
  postId: number | null;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string; // Stored as string for input, will convert to Date
  readTime: string;
  category: string;
  image: string; // Emoji or URL
  likes: number;
  comments: number;
  featured: boolean;
  content: string; // Full content of the blog post
}

const NewBlogPostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>(); // Get postId from URL for edit mode
  const isEditMode = !!postId;

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<BlogPostFormData>({
    postId: null,
    title: "",
    excerpt: "",
    author: "",
    authorRole: "",
    publishedDate: new Date().toISOString().split('T')[0], // Default to today's date
    readTime: "",
    category: "",
    image: "",
    likes: 0,
    comments: 0,
    featured: false,
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditMode); // Loading state for fetching post in edit mode

  const categories = [
    { id: "robotics", name: "Robotics" },
    { id: "ai", name: "Artificial Intelligence" },
    { id: "technology", name: "Technology" },
    { id: "tutorials", name: "Tutorials" },
    { id: "industry", name: "Industry News" },
    { id: "innovation", name: "Innovation" },
  ];

  // Effect to check authentication and role on component mount
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only.");
        navigate("/");
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Effect to fetch blog post data if in edit mode
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (isEditMode && postId) {
        setIsLoadingPost(true);
        try {
          const response = await blogAPI.getBlogPostById(parseInt(postId));
          if (response.data.success) {
            const postData = response.data.data;
            setFormData({
              postId: postData.postId,
              title: postData.title,
              excerpt: postData.excerpt,
              author: postData.author,
              authorRole: postData.authorRole,
              publishedDate: new Date(postData.publishedDate).toISOString().split('T')[0], // Format date for input
              readTime: postData.readTime,
              category: postData.category,
              image: postData.image,
              likes: postData.likes,
              comments: postData.comments,
              featured: postData.featured,
              content: postData.content,
            });
          } else {
            throw new Error(response.data.message || "Failed to fetch blog post.");
          }
        } catch (err: any) {
          console.error("Error fetching blog post:", err);
          setError(err.response?.data?.message || err.message || "Failed to load blog post for editing.");
          toast.error(err.response?.data?.message || err.message || "Failed to load blog post.");
          navigate("/blog"); // Redirect if post not found or error
        } finally {
          setIsLoadingPost(false);
        }
      }
    };

    fetchBlogPost();
  }, [isEditMode, postId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Correctly handle checkbox 'checked' property
    const inputValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.title || !formData.excerpt || !formData.author || !formData.category || !formData.readTime || !formData.image || !formData.content || formData.postId === null) {
        throw new Error("Please fill in all required fields.");
      }
      if (formData.likes < 0 || formData.comments < 0) {
        throw new Error("Likes and comments cannot be negative.");
      }

      const dataToSend = {
        ...formData,
        publishedDate: new Date(formData.publishedDate), // Convert to Date object for backend
      };

      let response;
      if (isEditMode && postId) {
        response = await blogAPI.updateBlogPost(parseInt(postId), dataToSend);
      } else {
        response = await blogAPI.addBlogPost(dataToSend);
      }

      if (response.data.success) {
        toast.success(`Blog post ${isEditMode ? "updated" : "added"} successfully!`);
        setFormData({ // Reset form after successful submission
          postId: null,
          title: "",
          excerpt: "",
          author: "",
          authorRole: "",
          publishedDate: new Date().toISOString().split('T')[0],
          readTime: "",
          category: "",
          image: "",
          likes: 0,
          comments: 0,
          featured: false,
          content: "",
        });
        navigate("/blog"); // Redirect to blog list page
      } else {
        throw new Error(response.data.message || `Failed to ${isEditMode ? "update" : "add"} blog post.`);
      }
    } catch (err: any) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} blog post:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} blog post. Please try again.`);
      toast.error(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} blog post.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isEditMode && isLoadingPost)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {authLoading ? "Loading authentication status..." : "Loading blog post data..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Redirection handled by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            {isEditMode ? "Modify the details of this blog post." : "Fill in the details to create a new blog post."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Post Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postId">Post ID</Label>
                <Input
                  id="postId"
                  name="postId"
                  type="number"
                  placeholder="e.g., 101"
                  value={formData.postId === null ? "" : formData.postId}
                  onChange={handleChange}
                  required
                  disabled={isEditMode} // Post ID should not be editable in edit mode
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., The Future of AI"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="A short summary of the blog post..."
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorRole">Author Role</Label>
                <Input
                  id="authorRole"
                  name="authorRole"
                  type="text"
                  placeholder="e.g., Lead AI Engineer"
                  value={formData.authorRole}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedDate">Published Date</Label>
                <Input
                  id="publishedDate"
                  name="publishedDate"
                  type="date"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  name="readTime"
                  type="text"
                  placeholder="e.g., 10 min read"
                  value={formData.readTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleSelectChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL / Emoji</Label>
                <Input
                  id="image"
                  name="image"
                  type="text"
                  placeholder="e.g., 🧠 or https://example.com/blog.png"
                  value={formData.image}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  name="likes"
                  type="number"
                  min="0"
                  placeholder="e.g., 150"
                  value={formData.likes}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  name="comments"
                  type="number"
                  min="0"
                  placeholder="e.g., 25"
                  value={formData.comments}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2 col-span-full">
                <Input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured">Mark as Featured</Label>
              </div>
            </div>

            {/* Full Content */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Full Content</h3>
            <div className="space-y-2">
              <Label htmlFor="content">Blog Post Content (Markdown/HTML)</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your full blog post content here..."
                value={formData.content}
                onChange={handleChange}
                rows={10}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2 mt-8" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {isSubmitting ? (isEditMode ? "Updating Post..." : "Creating Post...") : (isEditMode ? "Update Post" : "Create Post")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBlogPostPage;
