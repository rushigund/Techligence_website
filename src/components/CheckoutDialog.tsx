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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartItem, useCartStore } from "@/store/cartStore";
import { CreditCard, Truck, Shield, User, Mail, Check } from "lucide-react";
import { otpAPI, paymentAPI } from "@/services/api"; // <--- Import your APIs
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeSidebar?: () => void;
  items: CartItem[];
  totalPrice: number;
}

const CheckoutDialog = ({
  open,
  onOpenChange,
  closeSidebar,
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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const resetState = () => {
    setStep("details");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError("");
    setOtp("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
  };

  const requestOtp = async () => {
    try {
      // Use the new otpAPI.send method
      const res = await otpAPI.send(formData.email);

      // Axios wraps the response in a 'data' property
      if (res.data.success) {
        setOtpSent(true);
        setResendDisabled(true);
        setResendTimer(30);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setResendDisabled(false);
              return 30;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Handle backend error messages
        throw new Error(res.data.error || "Failed to send OTP.");
      }
    } catch (error: any) {
      console.error("Error requesting OTP:", error);
      // Access error message from axios response if available
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      throw new Error(errorMessage); // Re-throw to be caught by the calling function (e.g., Continue to Payment button)
    }
  };

  const verifyOtp = async () => {
    try {
      // Use the new otpAPI.verify method
      const res = await otpAPI.verify(formData.email, otp);

      if (res.data.success) {
        setOtpVerified(true);
        setOtpError("");
        toast.success("OTP verified. You can now proceed to payment.");
      } else {
        setOtpError(res.data.error || "Invalid or expired OTP.");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setOtpError(
        error.response?.data?.error || error.message || "Failed to verify OTP.",
      );
    }
  };

  /*const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
*/
  const startRazorpayPayment = async () => {
    setIsProcessing(true);
    const loaded = true;
    if (!loaded) {
      toast.error("Razorpay SDK failed to load. Please check your connection.");
      setIsProcessing(false);
      return;
    }

    try {
      // Round the total price to the nearest integer (representing rupees) before sending.
      // This prevents potential issues with floating-point numbers. The backend is
      // responsible for converting this value to the smallest currency unit (e.g., paise).
      const finalAmountInRupees = Math.round(totalPrice);
      const backendOrderRes = await paymentAPI.createOrder(finalAmountInRupees);
      const backendOrder = backendOrderRes.data; // Axios response data

      if (!backendOrder.success) {
        toast.error(backendOrder.error || "Failed to create Razorpay order.");
        setIsProcessing(false);
        return;
      }

      onOpenChange(false);
      if (typeof closeSidebar === "function") closeSidebar();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: backendOrder.order.amount,
        currency: backendOrder.order.currency,
        name: `${formData.firstName} ${formData.lastName}`,
        description: "Order Payment",
        order_id: backendOrder.order.id,
        handler: async (response: any) => {
          try {
            // Use the new paymentAPI.verifyPayment method
            const verifyRes = await paymentAPI.verifyPayment(response);

            if (verifyRes.data.success) {
              setStep("confirmation");
              onOpenChange(true); // Re-open dialog to show confirmation
            } else {
              toast.error(
                verifyRes.data.error || "Payment verification failed.",
              );
              onOpenChange(true); // Re-open dialog on failure too
            }
          } catch (error: any) {
            console.error("Error during payment verification:", error);
            toast.error(
              error.response?.data?.error ||
                error.message ||
                "An error occurred during payment verification.",
            );
            onOpenChange(true); // Re-open dialog on error
          }
        },
        modal: {
          ondismiss: () => onOpenChange(true),
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Error starting Razorpay payment:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to initiate payment process.",
      );
      onOpenChange(true); // Re-open dialog on failure
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOrder = () => {
    clearCart();
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
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
            {step === "payment" && "Secure payment with OTP verification"}
            {step === "confirmation" && `Order #${orderNumber} confirmed!`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col overflow-hidden">
          {/* Order Summary */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
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

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            {step === "details" && (
              <Tabs defaultValue="customer" className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full">
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
                      <Label>First Name *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4">
                  <div>
                    <Label>Address *</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>ZIP Code *</Label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {step === "payment" && (
              <div className="space-y-4 text-center">
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Payment is encrypted and secure.
                  </AlertDescription>
                </Alert>
                {!otpVerified && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    {otpError && (
                      <p className="text-red-500 text-sm">{otpError}</p>
                    )}
                    <Button onClick={verifyOtp} className="w-full">
                      Verify OTP
                    </Button>
                    <Button
                      variant="outline"
                      disabled={resendDisabled}
                      onClick={requestOtp}
                      className="w-full"
                    >
                      {resendDisabled
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
                    </Button>
                  </div>
                )}
                {otpVerified && (
                  <Button
                    onClick={startRazorpayPayment}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Pay ${formatPrice(totalPrice)}`}
                  </Button>
                )}
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
                    Confirmation email sent to {formData.email}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="border-t pt-4 mt-4 flex gap-3">
            {step === "details" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await requestOtp();
                      toast.info("OTP sent to your email.");
                      setStep("payment");
                    } catch {
                      // Error is already toasted inside requestOtp, no need to alert again.
                    }
                  }}
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
              <Button
                onClick={() => {
                  setStep("details");
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtpError("");
                }}
              >
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
