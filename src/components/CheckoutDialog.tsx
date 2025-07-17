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
  User,
  Mail,
  Check,
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
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber] = useState(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase()
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    newsletter: false,
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startRazorpayPayment = async () => {
    setIsProcessing(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK");
      setIsProcessing(false);
      return;
    }

    try {
      const backendOrder = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      }).then((res) => res.json());
console.log(backendOrder);


      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: backendOrder.amount,
        currency: backendOrder.currency,
        name: `${formData.firstName} ${formData.lastName}`,
        description: "Order Payment",
        order_id: backendOrder.id,
       handler: (response: any) => {
  console.log("Payment Success", response);

  fetch("/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response), // send {razorpay_payment_id, razorpay_order_id, razorpay_signature}
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      setStep("confirmation"); // verified
    } else {
      alert("⚠️ Payment verification failed");
    }
  })
  .catch(err => {
    console.error(err);
    alert("⚠️ Verification request failed");
  });

  setIsProcessing(false);
},

        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed to initiate");
    }

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
            {step === "details" && "Please provide your shipping and contact information"}
            {step === "payment" && "Secure payment processing"}
            {step === "confirmation" && `Order #${orderNumber} confirmed!`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col overflow-hidden">
          {/* Order Summary */}
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
              <span>Total:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === "details" && (
              <div className="space-y-6">
                <Tabs defaultValue="customer">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">
                      <User className="w-4 h-4 mr-2" /> Customer Info
                    </TabsTrigger>
                    <TabsTrigger value="shipping">
                      <Truck className="w-4 h-4 mr-2" /> Shipping
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping" className="space-y-4">
                    <div>
                      <Label>Address *</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City *</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Input
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>ZIP Code *</Label>
                        <Input
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          required
                        />
                      </div>
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
                    Your payment information is secure and encrypted.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 text-center">
                  <Button
                    className="w-full"
                    onClick={startRazorpayPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ${formatPrice(totalPrice)}`}
                  </Button>
                </div>
              </div>
            )}

            {step === "confirmation" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Order Confirmed!</h3>
                  <p>Your order #{orderNumber} has been placed successfully.</p>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    A confirmation email has been sent to {formData.email}.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4 flex gap-3">
            {step === "details" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
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
              <Button onClick={() => setStep("details")} disabled={isProcessing}>
                Back
              </Button>
            )}

            {step === "confirmation" && (
              <Button className="w-full" onClick={completeOrder}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
