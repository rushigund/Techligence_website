import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  Eye,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  specifications: { [key: string]: string };
  status: "active" | "draft" | "discontinued";
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  createdDate: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Techligence Explorer Pro",
      category: "exploration",
      price: 2499,
      originalPrice: 2999,
      description:
        "Advanced 4WD exploration robot with AI-powered navigation and autonomous mapping capabilities.",
      features: [
        "AI-Powered Navigation",
        "4WD All-Terrain System",
        "Real-time Mapping",
        "Remote Control",
      ],
      specifications: {
        Dimensions: "45cm x 35cm x 20cm",
        Weight: "12kg",
        "Battery Life": "8 hours",
        "Max Speed": "2.5 m/s",
      },
      status: "active",
      stock: 25,
      rating: 4.8,
      reviews: 127,
      image: "🤖",
      createdDate: "2024-01-10",
    },
    {
      id: "2",
      name: "Industrial Automation Bot",
      category: "industrial",
      price: 4999,
      description:
        "Heavy-duty industrial robot designed for manufacturing and warehouse automation.",
      features: [
        "Industrial Grade Build",
        "Precision Control",
        "Safety Systems",
        "Integration Ready",
      ],
      specifications: {
        "Payload Capacity": "50kg",
        Reach: "1.5m",
        Accuracy: "±0.1mm",
        "Operating Temp": "-10°C to 60°C",
      },
      status: "active",
      stock: 8,
      rating: 4.9,
      reviews: 89,
      image: "🏭",
      createdDate: "2024-01-05",
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    description: "",
    features: "",
    specifications: "",
    status: "draft" as const,
    stock: "",
    image: "",
  });

  const categories = [
    { value: "exploration", label: "Exploration Robots" },
    { value: "industrial", label: "Industrial Automation" },
    { value: "security", label: "Security & Surveillance" },
    { value: "education", label: "Educational Robots" },
    { value: "research", label: "Research Platforms" },
    { value: "consumer", label: "Consumer Robotics" },
  ];

  const handleCreateProduct = () => {
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice
        ? parseFloat(newProduct.originalPrice)
        : undefined,
      description: newProduct.description,
      features: newProduct.features.split(",").map((f) => f.trim()),
      specifications: newProduct.specifications
        ? JSON.parse(newProduct.specifications)
        : {},
      status: newProduct.status,
      stock: parseInt(newProduct.stock),
      rating: 0,
      reviews: 0,
      image: newProduct.image || "📦",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      originalPrice: "",
      description: "",
      features: "",
      specifications: "",
      status: "draft",
      stock: "",
      image: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  const handleStatusChange = (
    productId: string,
    newStatus: Product["status"],
  ) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, status: newStatus } : product,
      ),
    );
  };

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "discontinued":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your product catalog
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for your catalog
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Explorer Pro Robot"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="2499"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        originalPrice: e.target.value,
                      })
                    }
                    placeholder="2999"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Product Description *</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the product features and capabilities..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="features">Key Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={newProduct.features}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, features: e.target.value })
                  }
                  placeholder="AI Navigation, 4WD System, Remote Control"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="specifications">
                  Specifications (JSON format)
                </Label>
                <Textarea
                  id="specifications"
                  value={newProduct.specifications}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      specifications: e.target.value,
                    })
                  }
                  placeholder='{"Dimensions": "45cm x 35cm x 20cm", "Weight": "12kg"}'
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Product Icon/Emoji</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                    placeholder="🤖"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProduct.status}
                    onValueChange={(value) =>
                      setNewProduct({
                        ...newProduct,
                        status: value as Product["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateProduct} className="flex-1">
                  Create Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <Badge className={getStatusColor(product.status)}>
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{product.image}</div>
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <Badge variant="outline">
                  {getCategoryLabel(product.category)}
                </Badge>
              </div>

              <CardDescription className="text-center text-sm">
                {product.description.length > 100
                  ? product.description.substring(0, 100) + "..."
                  : product.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium">{product.stock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="flex gap-2">
                  <Select
                    value={product.status}
                    onValueChange={(value) =>
                      handleStatusChange(product.id, value as Product["status"])
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Features */}
                {product.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first product to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
