import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save } from "lucide-react"; // Added Save icon
import { useNavigate, useParams } from "react-router-dom"; // Added useParams
import { useAuth } from "@/context/AuthContext";
import { productsAPI } from "@/services/api"; // Import the productsAPI

// Define the type for product data based on your schema
interface ProductFormData {
  productId: number | null;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  specifications: {
    speed: string;
    payload: string;
    range: string;
    battery: string;
  };
  features: string[]; // Array of strings
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  shippingTime: string;
  warranty: string;
  category: string;
}

const NewProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>(); // Get productId from URL
  const isEditMode = !!productId; // Determine if in edit mode

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ProductFormData>({
    productId: null,
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    specifications: {
      speed: "",
      payload: "",
      range: "",
      battery: "",
    },
    features: [],
    rating: 0,
    reviews: 0,
    inStock: true,
    stockCount: 0,
    shippingTime: "2-3 days",
    warranty: "2 years warranty included",
    category: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode); // Loading state for fetching product

  const categories = [
    { id: "exploration", name: "Exploration" },
    { id: "industrial", name: "Industrial" },
    { id: "surveillance", name: "Surveillance" },
    { id: "research", name: "Research" },
  ];

  // Effect to check authentication and role on component mount
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only."); // Show toast notification
        navigate("/"); // Redirect to home page
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Effect to fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode && productId) {
        setIsLoadingProduct(true);
        try {
          const response = await productsAPI.getProductById(parseInt(productId));
          if (response.data.success) {
            const productData = response.data.data;
            // Map fetched data to formData structure
            setFormData({
              productId: productData.productId,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              originalPrice: productData.originalPrice || "", // Handle optional
              image: productData.image,
              specifications: productData.specifications,
              features: productData.features || [], // Ensure it's an array
              rating: productData.rating,
              reviews: productData.reviews,
              inStock: productData.inStock,
              stockCount: productData.stockCount,
              shippingTime: productData.shippingTime,
              warranty: productData.warranty,
              category: productData.category,
            });
          } else {
            throw new Error(response.data.message || "Failed to fetch product.");
          }
        } catch (err: any) {
          console.error("Error fetching product:", err);
          setError(err.response?.data?.message || err.message || "Failed to load product for editing.");
          toast.error(err.response?.data?.message || err.message || "Failed to load product.");
          navigate("/products"); // Redirect if product not found or error
        } finally {
          setIsLoadingProduct(false);
        }
      }
    };

    fetchProduct();
  }, [isEditMode, productId, navigate]); // Depend on isEditMode and productId

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("specs.")) {
      const specKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value,
        },
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      inStock: checked,
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
      if (!formData.name || !formData.description || !formData.price || !formData.category || formData.productId === null) {
        throw new Error("Please fill in all required fields.");
      }
      if (formData.stockCount < 0 || formData.rating < 0 || formData.reviews < 0) {
        throw new Error("Numeric values cannot be negative.");
      }

      // Process features string into an array
      const processedFeatures = formData.features.join(", ").split(',').map(f => f.trim()).filter(f => f !== '');
      // Ensure price and originalPrice are clean strings before sending
      const cleanPrice = formData.price.replace(/[$,]/g, '');
      const cleanOriginalPrice = formData.originalPrice ? formData.originalPrice.replace(/[$,]/g, '') : undefined;

      const dataToSend = {
        ...formData,
        productId: formData.productId,
        price: cleanPrice,
        originalPrice: cleanOriginalPrice,
        features: processedFeatures,
      };

      let response;
      if (isEditMode && productId) {
        response = await productsAPI.updateProduct(parseInt(productId), dataToSend);
      } else {
        response = await productsAPI.addProduct(dataToSend);
      }

      if (response.data.success) {
        toast.success(`Product ${isEditMode ? "updated" : "added"} successfully!`);
        setFormData({ // Reset form after successful submission
          productId: null,
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          image: "",
          specifications: {
            speed: "",
            payload: "",
            range: "",
            battery: "",
          },
          features: [],
          rating: 0,
          reviews: 0,
          inStock: true,
          stockCount: 0,
          shippingTime: "2-3 days",
          warranty: "2 years warranty included",
          category: "",
        });
        navigate("/products"); // Redirect to products page
      } else {
        throw new Error(response.data.message || `Failed to ${isEditMode ? "update" : "add"} product.`);
      }
    } catch (err: any) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} product:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} product. Please try again.`);
      toast.error(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading spinner if auth is loading or product data is loading in edit mode
  if (authLoading || (isEditMode && isLoadingProduct)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {authLoading ? "Loading authentication status..." : "Loading product data..."}
        </p>
      </div>
    );
  }

  // If not admin, return null (redirection handled by useEffect)
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            {isEditMode ? "Modify the details of this product." : "Fill in the details to add a new robot to your store."}
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
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  name="productId"
                  type="number"
                  placeholder="e.g., 101"
                  value={formData.productId === null ? "" : formData.productId}
                  onChange={handleChange}
                  required
                  disabled={isEditMode} // Product ID should not be editable in edit mode
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., RoboTech Explorer Pro"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed description of the product..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="$12,999"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price ($) (Optional)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="text"
                  placeholder="$15,999"
                  value={formData.originalPrice}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="image">Image URL / Emoji</Label>
                <Input
                  id="image"
                  name="image"
                  type="text"
                  placeholder="e.g., 🤖 or https://example.com/robot.png"
                  value={formData.image}
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
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g., 4.8"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviews">Number of Reviews</Label>
                <Input
                  id="reviews"
                  name="reviews"
                  type="number"
                  min="0"
                  placeholder="e.g., 324"
                  value={formData.reviews}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Specifications */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specs.speed">Max Speed</Label>
                <Input
                  id="specs.speed"
                  name="specs.speed"
                  type="text"
                  placeholder="e.g., 5 m/s"
                  value={formData.specifications.speed}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specs.payload">Payload Capacity</Label>
                <Input
                  id="specs.payload"
                  name="specs.payload"
                  type="text"
                  placeholder="e.g., 15 kg"
                  value={formData.specifications.payload}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specs.range">Range</Label>
                <Input
                  id="specs.range"
                  name="specs.range"
                  type="text"
                  placeholder="e.g., 10 km"
                  value={formData.specifications.range}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specs.battery">Battery Life</Label>
                <Input
                  id="specs.battery"
                  name="specs.battery"
                  type="text"
                  placeholder="e.g., 12 hours"
                  value={formData.specifications.battery}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Features */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Features</h3>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                name="features"
                placeholder="e.g., 360° LiDAR Mapping, AI Obstacle Avoidance, 12-Hour Battery Life"
                value={formData.features.join(", ")}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    features: e.target.value.split(',').map(f => f.trim())
                }))}
                rows={3}
              />
            </div>

            {/* Stock & Shipping */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Stock & Shipping</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockCount">Stock Quantity</Label>
                <Input
                  id="stockCount"
                  name="stockCount"
                  type="number"
                  min="0"
                  placeholder="e.g., 12"
                  value={formData.stockCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingTime">Shipping Time</Label>
                <Input
                  id="shippingTime"
                  name="shippingTime"
                  type="text"
                  placeholder="e.g., 2-3 days"
                  value={formData.shippingTime}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  name="warranty"
                  type="text"
                  placeholder="e.g., 2 years warranty included"
                  value={formData.warranty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 mt-8" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {isSubmitting ? (isEditMode ? "Updating Product..." : "Adding Product...") : (isEditMode ? "Update Product" : "Add Product")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProductPage;
