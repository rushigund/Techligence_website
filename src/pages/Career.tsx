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
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import JobApplicationForm from '@/components/JobApplicationForm';
import CreateJobListingForm from '@/components/CreateJobListingForm'; // Import CreateJobListingForm
import {
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Star,
  Building,
  ChevronRight,
  PlusCircle,
  Loader2,
  Edit, // Import Edit icon
  Trash2, // Import Trash2 icon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import react-query hooks
import { careerAPI } from "@/services/api"; // Import careerAPI
import { toast } from "sonner"; // Import toast for notifications

// Define interface for a job listing to match the Mongoose schema
interface JobListing {
  _id: string; // MongoDB ID
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Career = () => {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null); // Use JobListing type
  const [isCreateJobFormOpen, setIsCreateJobFormOpen] = useState(false); // State for create/edit job form
  const [editingJobId, setEditingJobId] = useState<string | null>(null); // State for job ID being edited

  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const navigate = useNavigate(); // Initialize useNavigate
  const queryClient = useQueryClient(); // Get query client for invalidation

  // Use useQuery to fetch job listings from the backend
  const { data: jobOpenings, isLoading, isError, error } = useQuery<JobListing[], Error>({
    queryKey: ["jobListings"], // Unique key for this query
    queryFn: async () => {
      const response = await careerAPI.getJobListings();
      if (response.data.success) {
        // Filter for active jobs if not admin, otherwise show all
        return isAdmin ? response.data.data : response.data.data.filter((job: JobListing) => job.isActive);
      } else {
        throw new Error(response.data.message || "Failed to fetch job listings.");
      }
    },
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // Refetch when isAdmin changes to update visibility of active/inactive jobs
    // This is handled implicitly by `queryKey` if `isAdmin` was part of it, but `useQuery`
    // will re-run `queryFn` if `isAdmin` (from `useAuth`) changes and `queryKey` is stable.
    // Explicit invalidation on auth state change would be more robust if needed.
  });


  const handleApplyClick = (job: JobListing) => {
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  const handleCreateJobClick = () => {
    setEditingJobId(null); // Ensure we're in create mode
    setIsCreateJobFormOpen(true);
  };

  const handleCloseCreateJobForm = () => {
    setIsCreateJobFormOpen(false);
    setEditingJobId(null); // Reset editingJobId when form closes
    queryClient.invalidateQueries({ queryKey: ["jobListings"] }); // Invalidate to refetch updated job list
  };

  // Handle Edit Job Listing: Opens the CreateJobListingForm in edit mode
  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId); // Set the ID of the job to be edited
    setIsCreateJobFormOpen(true); // Open the form
    toast.info(`Opening form to edit job ID: ${jobId}`);
  };

  // Handle Delete Job Listing
  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) {
      try {
        const response = await careerAPI.deleteJobListing(jobId);
        if (response.data.success) {
          toast.success(response.data.message || "Job listing deleted successfully!");
          queryClient.invalidateQueries({ queryKey: ["jobListings"] }); // Invalidate to refetch updated list
        } else {
          toast.error(response.data.message || "Failed to delete job listing.");
        }
      } catch (error: any) {
        console.error("Error deleting job listing:", error);
        toast.error(error.response?.data?.message || "An error occurred during deletion.");
      }
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Industry-leading compensation packages with equity options",
    },
    {
      icon: Users,
      title: "Great Team",
      description:
        "Work with brilliant minds from top tech companies and universities",
    },
    {
      icon: Star,
      title: "Innovation Focus",
      description: "20% time for personal projects and cutting-edge research",
    },
    {
      icon: Building,
      title: "Modern Office",
      description: "State-of-the-art facilities with the latest robotics labs",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Briefcase className="w-3 h-3 mr-1" />
              Join Our Team
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Build the Future of <span className="text-primary">Robotics</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join a team of passionate engineers, researchers, and innovators
              who are shaping the future of intelligent robotics. Make an impact
              in an industry that's transforming the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 text-lg px-8">
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-lg px-8"
              >
                Learn About Culture
                <Users className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
              Why Work With Us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We offer more than just a job – we provide a platform for growth,
              innovation, and making a real impact in the robotics industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Briefcase className="w-3 h-3 mr-1" />
              Current Openings
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
              Open Positions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find your perfect role in our growing team. We're always looking
              for talented individuals who share our passion for robotics.
            </p>
            {/* Admin button to create new job listing */}
            {isAdmin && (
              <div className="mt-8">
                <Button size="lg" className="gap-2" onClick={handleCreateJobClick}>
                  <PlusCircle className="w-5 h-5" />
                  Create New Job Listing
                </Button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading job openings...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-red-500">
              <p>Error loading job openings: {error?.message || "Unknown error"}</p>
              <p>Please ensure your backend is running and accessible.</p>
            </div>
          ) : (jobOpenings && jobOpenings.length > 0 ? (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {jobOpenings.map((job) => ( // Removed index as key, using job._id
                <Card
                  key={job._id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Admin Edit and Delete Buttons */}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditJob(job._id)}
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                              title="Edit Job Listing"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJob(job._id)}
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              title="Delete Job Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          className="gap-2"
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      {/* Display isActive status for admins */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Badge variant={job.isActive ? "default" : "destructive"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No job openings available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new opportunities!
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-6">
            Don't See Your Role?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We're always looking for exceptional talent. Send us your resume and
            let us know how you'd like to contribute to the future of robotics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-lg px-8"
            >
              Send Resume
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
              >
                Contact Us
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Job Application Form Modal */}
      {selectedJob && (
        <JobApplicationForm
          isOpen={isApplicationFormOpen}
          onClose={() => {
            setIsApplicationFormOpen(false);
            setSelectedJob(null);
          }}
          jobTitle={selectedJob.title}
          jobDepartment={selectedJob.department}
          jobLocation={selectedJob.location}
        />
      )}

      {/* Create/Edit Job Listing Form Modal (Admin Only) */}
      {isAdmin && (
        <CreateJobListingForm
          isOpen={isCreateJobFormOpen}
          onClose={handleCloseCreateJobForm}
          jobId={editingJobId} // Pass the jobId to the form for editing
        />
      )}
    </div>
  );
};

export default Career;
