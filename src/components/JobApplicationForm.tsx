import { useState } from "react";
import { Button } from "@/components/ui/button";
import { careerAPI } from "@/services/api"; // Uncommented careerAPI import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  DollarSign,
  CheckCircle,
  Loader2, // Import Loader2 for loading spinner
} from "lucide-react";
import { toast } from "sonner"; // Import toast for notifications

interface JobApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobDepartment: string;
  jobLocation: string;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Professional Information
  currentTitle: string;
  currentCompany: string;
  totalExperience: string;
  relevantExperience: string;
  expectedSalary: string;
  noticePeriod: string;

  // Education
  education: string;
  university: string;
  graduationYear: string;

  // Application Details
  coverLetter: string;
  whyJoin: string;
  availability: string;
  relocate: boolean;

  // Files
  resume: File | null;
  portfolio: File | null;

  // Agreements
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  isOpen,
  onClose,
  jobTitle,
  jobDepartment,
  jobLocation,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    currentTitle: "",
    currentCompany: "",
    totalExperience: "",
    relevantExperience: "",
    expectedSalary: "",
    noticePeriod: "",
    education: "",
    university: "",
    graduationYear: "",
    coverLetter: "",
    whyJoin: "",
    availability: "",
    relocate: false,
    resume: null,
    portfolio: null,
    agreeTerms: false,
    agreePrivacy: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validation for Step 4 (Review and Submit)
    if (currentStep === 4) {
      if (!formData.agreeTerms || !formData.agreePrivacy) {
        toast.error("Please agree to the Terms and Conditions and Privacy Policy.");
        setIsSubmitting(false);
        return;
      }
    }

    // Basic validation for required fields before submission (can be expanded per step)
    if (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode)) {
        toast.error("Please fill all required fields in Personal Information.");
        setIsSubmitting(false);
        return;
    }
    if (currentStep === 2 && (!formData.totalExperience || !formData.relevantExperience || !formData.education)) {
        toast.error("Please fill all required fields in Professional Information.");
        setIsSubmitting(false);
        return;
    }
    if (currentStep === 3 && (!formData.resume || !formData.coverLetter || !formData.whyJoin || !formData.availability)) {
        toast.error("Please fill all required fields in Application Details, including resume upload.");
        setIsSubmitting(false);
        return;
    }

    // File validation for resume
    if (formData.resume) {
      if (formData.resume.size > 5 * 1024 * 1024) { // 5 MB limit
        toast.error("Resume file size exceeds 5MB limit.");
        setIsSubmitting(false);
        return;
      }
      const allowedResumeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedResumeTypes.includes(formData.resume.type)) {
        toast.error("Only PDF and Word documents are allowed for resume.");
        setIsSubmitting(false);
        return;
      }
    }

    // File validation for portfolio (optional, but if provided, validate type/size)
    if (formData.portfolio) {
        if (formData.portfolio.size > 10 * 1024 * 1024) { // Example: 10 MB limit for portfolio
            toast.error("Portfolio file size exceeds 10MB limit.");
            setIsSubmitting(false);
            return;
        }
        const allowedPortfolioTypes = ['application/pdf', 'application/zip', 'image/jpeg', 'image/png']; // Example types
        if (!allowedPortfolioTypes.includes(formData.portfolio.type)) {
            toast.error("Only PDF, Zip, JPG, PNG files are allowed for portfolio.");
            setIsSubmitting(false);
            return;
        }
    }


    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof FormData];
        if (key === "resume" || key === "portfolio") {
          // Handle file uploads
          if (value instanceof File) {
            submitData.append(key, value);
          }
        } else if (key === "agreeTerms" || key === "agreePrivacy") {
          // Skip agreement fields (they're just for frontend validation)
          return;
        } else if (value !== null && value !== undefined && value !== "") {
          // Add other fields as strings
          submitData.append(key, String(value));
        }
      });

      // Add job information
      submitData.append("jobTitle", jobTitle);
      submitData.append("jobDepartment", jobDepartment);
      submitData.append("jobLocation", jobLocation);

      // Submit application using careerAPI
      const response = await careerAPI.submitApplication(submitData);

      if (response.data.success) {
        setIsSubmitted(true);
        toast.success(response.data.message || "Application submitted successfully!");
        console.log("✅ Application submitted successfully:", response.data);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (error: any) {
      console.error("❌ Application submission error:", error);
      toast.error(error.response?.data?.message || "Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Basic validation before moving to the next step
    let isValid = true;
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        toast.error("Please fill all required fields in Personal Information.");
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.totalExperience || !formData.relevantExperience || !formData.education) {
        toast.error("Please fill all required fields in Professional Information.");
        isValid = false;
      }
    } else if (currentStep === 3) {
        if (!formData.resume) {
            toast.error("Resume is required for application details.");
            isValid = false;
        } else if (formData.resume.size > 5 * 1024 * 1024) {
            toast.error("Resume file size exceeds 5MB limit.");
            isValid = false;
        } else if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(formData.resume.type)) {
            toast.error("Only PDF and Word documents are allowed for resume.");
            isValid = false;
        }
        if (!formData.coverLetter || !formData.whyJoin || !formData.availability) {
            toast.error("Please fill all required text fields in Application Details.");
            isValid = false;
        }
    }

    if (isValid && currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      currentTitle: "",
      currentCompany: "",
      totalExperience: "",
      relevantExperience: "",
      expectedSalary: "",
      noticePeriod: "",
      education: "",
      university: "",
      graduationYear: "",
      coverLetter: "",
      whyJoin: "",
      availability: "",
      relocate: false,
      resume: null,
      portfolio: null,
      agreeTerms: false,
      agreePrivacy: false,
    });
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={resetForm}>
        <DialogContent className="max-w-md">
          <VisuallyHidden>
            <DialogTitle>Application Submitted Successfully</DialogTitle>
          </VisuallyHidden>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Application Submitted!
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to the {jobTitle} position. We'll review
              your application and get back to you within 5-7 business days.
            </p>
            <Button onClick={resetForm} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            {jobDepartment} • {jobLocation}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <div className="ml-2 text-sm">
                {step === 1 && "Personal"}
                {step === 2 && "Professional"}
                {step === 3 && "Application"}
                {step === 4 && "Review"}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-0.5 ml-4 ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Please provide your basic contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Tell us about your work experience and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentTitle">Current Job Title</Label>
                    <Input
                      id="currentTitle"
                      name="currentTitle"
                      value={formData.currentTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      name="currentCompany"
                      value={formData.currentCompany}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalExperience">Total Experience *</Label>
                    <Select
                      value={formData.totalExperience}
                      onValueChange={(value) =>
                        handleSelectChange("totalExperience", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-8">5-8 years</SelectItem>
                        <SelectItem value="8+">8+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relevantExperience">
                      Relevant Experience *
                    </Label>
                    <Select
                      value={formData.relevantExperience}
                      onValueChange={(value) =>
                        handleSelectChange("relevantExperience", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relevant experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-8">5-8 years</SelectItem>
                        <SelectItem value="8+">8+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="education">Education Level *</Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) =>
                        handleSelectChange("education", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="associate">
                          Associate Degree
                        </SelectItem>
                        <SelectItem value="bachelor">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="university">University/Institution</Label>
                    <Input
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      min="1980"
                      max="2030"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedSalary">
                      Expected Salary (Annual)
                    </Label>
                    <Select
                      value={formData.expectedSalary}
                      onValueChange={(value) =>
                        handleSelectChange("expectedSalary", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40k-60k">$40k - $60k</SelectItem>
                        <SelectItem value="60k-80k">$60k - $80k</SelectItem>
                        <SelectItem value="80k-100k">$80k - $100k</SelectItem>
                        <SelectItem value="100k-120k">$100k - $120k</SelectItem>
                        <SelectItem value="120k-150k">$120k - $150k</SelectItem>
                        <SelectItem value="150k+">$150k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="noticePeriod">Notice Period</Label>
                    <Select
                      value={formData.noticePeriod}
                      onValueChange={(value) =>
                        handleSelectChange("noticePeriod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="2-weeks">2 weeks</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                        <SelectItem value="2-months">2 months</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Application Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  Upload your documents and tell us about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Uploads */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="resume">Resume/CV *</Label>
                    <div className="mt-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {formData.resume
                              ? formData.resume.name
                              : "Click to upload resume"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            handleFileChange(
                              "resume",
                              e.target.files?.[0] || null,
                            )
                          }
                          required // Resume is required
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio (Optional)</Label>
                    <div className="mt-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {formData.portfolio
                              ? formData.portfolio.name
                              : "Click to upload portfolio"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.zip,.jpg,.jpeg,.png" // Added image types
                          onChange={(e) =>
                            handleFileChange(
                              "portfolio",
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    required
                  />
                </div>

                {/* Why Join */}
                <div>
                  <Label htmlFor="whyJoin">
                    Why do you want to join Techligence? *
                  </Label>
                  <Textarea
                    id="whyJoin"
                    name="whyJoin"
                    value={formData.whyJoin}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="What excites you about working at Techligence and contributing to the robotics industry?"
                    required
                  />
                </div>

                {/* Additional Questions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability">When can you start? *</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) =>
                        handleSelectChange("availability", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 month</SelectItem>
                        <SelectItem value="2-months">
                          Within 2 months
                        </SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="relocate"
                      checked={formData.relocate}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          relocate: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="relocate">
                      Willing to relocate if required
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Application</CardTitle>
                <CardDescription>
                  Please review your information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.firstName} {formData.lastName}
                      <br />
                      {formData.email}
                      <br />
                      {formData.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Professional Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.currentTitle || "N/A"}
                      <br />
                      {formData.totalExperience} total experience
                      <br />
                      {formData.education} education
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Uploaded Files</h4>
                  <div className="flex gap-4">
                    {formData.resume && (
                      <Badge variant="secondary">
                        <FileText className="w-3 h-3 mr-1" />
                        Resume: {formData.resume.name}
                      </Badge>
                    )}
                    {formData.portfolio && (
                      <Badge variant="secondary">
                        <FileText className="w-3 h-3 mr-1" />
                        Portfolio: {formData.portfolio.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: checked as boolean,
                        }))
                      }
                      required
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and confirm that all information provided is accurate.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreePrivacy: checked as boolean,
                        }))
                      }
                      required
                    />
                    <Label htmlFor="agreePrivacy" className="text-sm">
                      I agree to the{" "}
                      <a
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </a>{" "}
                      and consent to the processing of my personal data for
                      recruitment purposes.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    !formData.agreeTerms ||
                    !formData.agreePrivacy ||
                    isSubmitting
                  }
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationForm;
