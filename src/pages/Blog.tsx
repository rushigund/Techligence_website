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
import { Link } from "react-router-dom";
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
} from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Posts", count: 24 },
    { id: "robotics", name: "Robotics", count: 12 },
    { id: "ai", name: "Artificial Intelligence", count: 8 },
    { id: "technology", name: "Technology", count: 6 },
    { id: "tutorials", name: "Tutorials", count: 5 },
    { id: "industry", name: "Industry News", count: 4 },
    { id: "innovation", name: "Innovation", count: 3 },
  ];

  const featuredPosts = [
    {
      id: 1,
      title: "The Future of Autonomous Robotics in Manufacturing",
      excerpt:
        "Exploring how autonomous robots are revolutionizing manufacturing processes and increasing efficiency by 300%.",
      author: "Dr. Sarah Chen",
      authorRole: "Lead Robotics Engineer",
      publishedDate: "2024-01-15",
      readTime: "8 min read",
      category: "robotics",
      image: "🤖",
      likes: 245,
      comments: 18,
      featured: true,
    },
    {
      id: 2,
      title: "Machine Learning in Robot Navigation: A Deep Dive",
      excerpt:
        "Understanding how modern robots use ML algorithms to navigate complex environments safely and efficiently.",
      author: "Alex Rodriguez",
      authorRole: "AI Research Scientist",
      publishedDate: "2024-01-12",
      readTime: "12 min read",
      category: "ai",
      image: "🧠",
      likes: 189,
      comments: 24,
      featured: true,
    },
  ];

  const blogPosts = [
    {
      id: 3,
      title: "Getting Started with URDF: Robot Description Files",
      excerpt:
        "A comprehensive guide to creating and managing URDF files for robot modeling and simulation.",
      author: "Mike Johnson",
      authorRole: "Software Developer",
      publishedDate: "2024-01-10",
      readTime: "6 min read",
      category: "tutorials",
      image: "📋",
      likes: 156,
      comments: 12,
    },
    {
      id: 4,
      title: "Industry 4.0: How Robotics is Shaping Smart Factories",
      excerpt:
        "Examining the role of robotics in the fourth industrial revolution and smart manufacturing.",
      author: "Emma Wilson",
      authorRole: "Industry Analyst",
      publishedDate: "2024-01-08",
      readTime: "10 min read",
      category: "industry",
      image: "🏭",
      likes: 203,
      comments: 31,
    },
    {
      id: 5,
      title: "Computer Vision in Robotics: Real-World Applications",
      excerpt:
        "Exploring how computer vision technologies enable robots to see and understand their environment.",
      author: "David Kim",
      authorRole: "Computer Vision Engineer",
      publishedDate: "2024-01-05",
      readTime: "9 min read",
      category: "technology",
      image: "👁️",
      likes: 178,
      comments: 15,
    },
    {
      id: 6,
      title: "Building Your First Robot Controller with ROS",
      excerpt:
        "Step-by-step tutorial on creating a robot controller using the Robot Operating System (ROS).",
      author: "Lisa Park",
      authorRole: "Robotics Developer",
      publishedDate: "2024-01-03",
      readTime: "15 min read",
      category: "tutorials",
      image: "⚙️",
      likes: 312,
      comments: 42,
    },
    {
      id: 7,
      title: "The Ethics of AI in Robotics: Challenges and Solutions",
      excerpt:
        "Discussing the ethical implications of artificial intelligence in robotics and potential solutions.",
      author: "Dr. Robert Taylor",
      authorRole: "Ethics in AI Researcher",
      publishedDate: "2024-01-01",
      readTime: "11 min read",
      category: "ai",
      image: "⚖️",
      likes: 267,
      comments: 38,
    },
    {
      id: 8,
      title: "Collaborative Robots: Transforming Human-Robot Interaction",
      excerpt:
        "How collaborative robots (cobots) are changing the way humans and robots work together.",
      author: "Jennifer Lee",
      authorRole: "Human-Robot Interaction Specialist",
      publishedDate: "2023-12-28",
      readTime: "7 min read",
      category: "innovation",
      image: "🤝",
      likes: 234,
      comments: 19,
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
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
                key={post.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">Featured</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

                  <Button className="w-full mt-4 gap-2 group-hover:gap-3 transition-all">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
                key={post.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                      {categories.find((c) => c.id === post.category)?.name}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="w-3 h-3" />
                    </Button>
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

                  <Button variant="outline" className="w-full gap-2">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
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
