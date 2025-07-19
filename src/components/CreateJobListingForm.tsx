import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save, Edit } from "lucide-react";
import { careerAPI } from "@/services/api"; // Ensure this path is correct
import { useParams } from "react-router-dom"; // NEW: Import useParams

interface CreateJobListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string; // Optional jobId prop for when opened as a modal by Career.tsx
}

// Define interface for a job listing data structure
interface JobListingData {
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string; // Comma-separated string for input
  isActive: boolean;
}

const CreateJobListingForm: React.FC<CreateJobListingFormProps> = ({
  isOpen,
  onClose,
  jobId: propJobId, // Destructure propJobId to differentiate from URL param
}) => {
  // NEW: Get jobId from URL parameters
  const { jobId: paramJobId } = useParams<{ jobId: string }>();
  // Determine the effective jobId: prioritize propJobId, then URL param
  const currentJobId = propJobId || paramJobId;

  const [formData, setFormData] = useState<JobListingData>({
    title: "",
    department: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    skills: "", // Comma-separated string for input
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);

  // Effect to load job data if currentJobId is provided (for editing)
  useEffect(() => {
    if (isOpen && currentJobId) { // Use currentJobId here
      setIsLoadingJob(true);
      const fetchJob = async () => {
        try {
          const response = await careerAPI.getJobListingById(currentJobId); // Use currentJobId here
          if (response.data.success) {
            const jobData = response.data.data;
            setFormData({
              title: jobData.title,
              department: jobData.department,
              location: jobData.location,
              type: jobData.type,
              salary: jobData.salary,
              description: jobData.description,
              skills: jobData.skills ? jobData.skills.join(", ") : "", // Convert array to comma-separated string
              isActive: jobData.isActive,
            });
          } else {
            throw new Error(response.data.message || "Failed to fetch job listing for editing.");
          }
        } catch (err: any) {
          console.error("❌ Error fetching job listing for edit:", err);
          setError(err.response?.data?.message || err.message || "Failed to load job details.");
          toast.error("Failed to load job details for editing.");
          onClose(); // Close modal if job data cannot be loaded
        } finally {
          setIsLoadingJob(false);
        }
      };
      fetchJob();
    } else if (!isOpen) { // Reset form data when the dialog closes
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        skills: "",
        isActive: true,
      });
      setError(null);
    }
  }, [isOpen, currentJobId, onClose]); // Dependencies: isOpen, currentJobId, onClose

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Client-side validation
    if (
      !formData.title ||
      !formData.department ||
      !formData.location ||
      !formData.type ||
      !formData.salary ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert comma-separated skills string to an array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      const jobDataToSubmit = {
        ...formData,
        skills: skillsArray,
      };

      let response;
      if (currentJobId) { // Use currentJobId for the condition
        // If currentJobId exists, it's an update operation
        response = await careerAPI.updateJobListing(currentJobId, jobDataToSubmit);
      } else {
        // Otherwise, it's a create operation
        response = await careerAPI.createJobListing(jobDataToSubmit);
      }

      if (response.data.success) {
        toast.success(response.data.message || `Job listing ${currentJobId ? 'updated' : 'created'} successfully!`);
        onClose(); // Close the modal on success
      } else {
        throw new Error(response.data.message || `Failed to ${currentJobId ? 'update' : 'create'} job listing.`);
      }
    } catch (err: any) {
      console.error(`❌ Error ${currentJobId ? 'updating' : 'creating'} job listing:`, err);
      setError(err.response?.data?.message || err.message || `An error occurred while ${currentJobId ? 'updating' : 'creating'} the job listing. Please try again.`);
      toast.error(err.response?.data?.message || err.message || `Failed to ${currentJobId ? 'update' : 'create'} job listing.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = currentJobId ? "Edit Job Listing" : "Create New Job Listing";
  const submitButtonText = currentJobId ? "Save Changes" : "Create Job Listing";
  const submitButtonIcon = currentJobId ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />;
  const dialogIcon = currentJobId ? <Edit className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {dialogIcon} {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {currentJobId ? "Modify the details of this job opening." : "Fill in the details for the new job opening."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingJob ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading job details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range *</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="$XXk - $YYk"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Provide a detailed description of the job..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., Python, ROS, C++, Machine Learning"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isActive">Active Job Listing</Label>
            </div>

            <Button type="submit" className="w-full gap-2 mt-6" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                submitButtonIcon
              )}
              {isSubmitting ? (currentJobId ? "Saving..." : "Creating...") : submitButtonText}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobListingForm;
