import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItem, useCartStore } from "@/store/cartStore";
import {
  CreditCard,
  Truck,
  Shield,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  Check,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  totalPrice: number;
}

const CheckoutDialog = ({
  open,
  onOpenChange,
  items,
  totalPrice,
}: CheckoutDialogProps) => {
  const { clearCart } = useCartStore();
  const [step, setStep] = useState<"details" | "payment" | "confirmation">(
    "details",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber] = useState(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase(),
  );

  const [formData, setFormData] = useState({
    // Customer Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",

    // Shipping Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Special Instructions
    instructions: "",
    newsletter: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setStep("confirmation");
    setIsProcessing(false);
  };

  const completeOrder = () => {
    clearCart();
    onOpenChange(false);
    setStep("details");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === "details" && "Checkout Details"}
            {step === "payment" && "Payment Information"}
            {step === "confirmation" && "Order Confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === "details" &&
              "Please provide your shipping and contact information"}
            {step === "payment" && "Secure payment processing"}
            {step === "confirmation" && `Order #${orderNumber} confirmed!`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col overflow-hidden">
          {/* Order Summary - Always Visible */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.priceValue * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total (incl. tax):</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === "details" && (
              <div className="space-y-6">
                <Tabs defaultValue="customer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">
                      <User className="w-4 h-4 mr-2" />
                      Customer Info
                    </TabsTrigger>
                    <TabsTrigger value="shipping">
                      <Truck className="w-4 h-4 mr-2" />
                      Shipping
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping" className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instructions">
                        Special Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) =>
                          handleInputChange("instructions", e.target.value)
                        }
                        placeholder="Any special delivery instructions..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) =>
                          handleInputChange("newsletter", checked as boolean)
                        }
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Subscribe to our newsletter for updates and offers
                      </Label>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your payment information is secure and encrypted. We use
                    industry-standard SSL encryption.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" maxLength={4} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={`${formData.firstName} ${formData.lastName}`}
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Billing Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.address}
                    <br />
                    {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                </div>
              </div>
            )}

            {step === "confirmation" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Order Confirmed!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for your purchase. Your order #{orderNumber} has
                    been confirmed and will be processed within 24 hours.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg text-left">
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>Order Number: #{orderNumber}</p>
                    <p>Email: {formData.email}</p>
                    <p>
                      Shipping to: {formData.address}, {formData.city},{" "}
                      {formData.state}
                    </p>
                    <p>Estimated Delivery: 5-7 business days</p>
                  </div>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    A confirmation email has been sent to {formData.email} with
                    tracking information.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex gap-3">
              {step === "details" && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep("payment")}
                    disabled={
                      !formData.firstName ||
                      !formData.lastName ||
                      !formData.email ||
                      !formData.address ||
                      !formData.city ||
                      !formData.state ||
                      !formData.zipCode
                    }
                  >
                    Continue to Payment
                  </Button>
                </>
              )}

              {step === "payment" && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("details")}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={processPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Complete Order"}
                  </Button>
                </>
              )}

              {step === "confirmation" && (
                <Button className="w-full" onClick={completeOrder}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
