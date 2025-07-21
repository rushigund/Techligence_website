import { useState } from "react";
import { Button } from "@/components/ui/button";
import { contactAPI } from "@/services/api"; // Import the new contactAPI
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building,
  Users,
  Headphones,
  Loader2, // Import Loader2 for loading state
} from "lucide-react";
import { toast } from "sonner"; // Import toast for notifications

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state

    // --- Client-side validation ---
    if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.inquiryType) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // NEW: Log formData to console before sending
    console.log("Attempting to send form data:", formData);

    try {
      const response = await contactAPI.submitContact(formData);

      if (response.data.success) {
        toast.success(response.data.message || "Your message has been sent successfully!");
        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          company: "",
          subject: "",
          message: "",
          inquiryType: "",
        });
        console.log("✅ Contact form submitted successfully:", response.data);
      } else {
        // If backend sends a specific error message, use it
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (error: any) {
      console.error("❌ Contact form submission error:", error);
      // Display specific backend error message if available, otherwise a generic one
      toast.error(error.response?.data?.message || "Error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "piyushshinde@techligence.net",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 70208 12247",
      description: "Mon-Fri from 10am to 6pm IST",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Saptagiri Building, Lokdhara Phase 3, Near Ganesh Nagar, Kalyan, Maharashtra, 421306",
      description: "Our registered office",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Monday - Friday: 10:00 AM - 6:00 PM IST",
      description: "Indian Standard Time",
    },
  ];

  const departments = [
    {
      icon: Users,
      title: "Sales & Partnerships",
      email: "sales@techligence.com", // Assuming these department-specific emails remain the same
      description: "Product inquiries and business partnerships",
    },
    {
      icon: Headphones,
      title: "Technical Support",
      email: "support@techligence.com", // Assuming these department-specific emails remain the same
      description: "Technical assistance and troubleshooting",
    },
    {
      icon: Building,
      title: "General Inquiries",
      email: "info@techligence.com", // Assuming these department-specific emails remain the same
      description: "General questions and information",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <MessageSquare className="w-3 h-3 mr-1" />
              Get In Touch
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Contact <span className="text-primary">Techligence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Have questions about our robotics solutions? Need technical
              support? Want to explore partnership opportunities? We're here to
              help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-2">{info.details}</p>
                  <CardDescription>{info.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Departments */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">
                Send Us a Message
              </h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inquiryType">Inquiry Type *</Label> {/* Marked as required */}
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, inquiryType: value })
                          }
                          required // Mark as required
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales Inquiry</SelectItem>
                            <SelectItem value="support">
                              Technical Support
                            </SelectItem>
                            <SelectItem value="partnership">
                              Partnership
                            </SelectItem>
                            <SelectItem value="career">Career</SelectItem>
                            <SelectItem value="general">
                              General Question
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="mt-1"
                        placeholder="Tell us about your project or inquiry..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">
                Contact by Department
              </h2>
              <div className="space-y-6">
                {departments.map((dept, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <dept.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {dept.title}
                          </CardTitle>
                          <CardDescription>{dept.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <a
                          href={`mailto:${dept.email}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {dept.email}
                        </a>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${dept.email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Office Hours */}
              <Card className="border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">10:00 AM - 6:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">Closed</span> {/* Updated based on 10AM to 6PM IST business hours */}
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    * Emergency technical support available for enterprise
                    customers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;