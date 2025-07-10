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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: "active" | "draft" | "closed";
  applications: number;
  postedDate: string;
}

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "Senior Robotics Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $150k",
      description:
        "Lead the development of next-generation autonomous robotics systems.",
      requirements: [
        "5+ years robotics experience",
        "ROS expertise",
        "Python/C++",
      ],
      benefits: ["Health insurance", "Stock options", "Flexible hours"],
      status: "active",
      applications: 45,
      postedDate: "2024-01-15",
    },
    {
      id: "2",
      title: "AI/ML Research Scientist",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $170k",
      description:
        "Research and develop AI algorithms for intelligent robot behavior.",
      requirements: [
        "PhD in AI/ML",
        "Deep learning experience",
        "Research publications",
      ],
      benefits: ["Research budget", "Conference attendance", "Stock options"],
      status: "active",
      applications: 32,
      postedDate: "2024-01-12",
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
    status: "draft" as const,
  });

  const handleCreateJob = () => {
    const job: Job = {
      id: Date.now().toString(),
      title: newJob.title,
      department: newJob.department,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      description: newJob.description,
      requirements: newJob.requirements.split(",").map((r) => r.trim()),
      benefits: newJob.benefits.split(",").map((b) => b.trim()),
      status: newJob.status,
      applications: 0,
      postedDate: new Date().toISOString().split("T")[0],
    };

    setJobs([...jobs, job]);
    setNewJob({
      title: "",
      department: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      requirements: "",
      benefits: "",
      status: "draft",
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      setJobs(jobs.filter((job) => job.id !== jobId));
    }
  };

  const handleStatusChange = (jobId: string, newStatus: Job["status"]) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job,
      ),
    );
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage job postings
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
              <DialogDescription>
                Fill in the details for the new job posting
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={newJob.title}
                    onChange={(e) =>
                      setNewJob({ ...newJob, title: e.target.value })
                    }
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={newJob.department}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newJob.location}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={newJob.type}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, type: value })
                    }
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
              </div>

              <div>
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={newJob.salary}
                  onChange={(e) =>
                    setNewJob({ ...newJob, salary: e.target.value })
                  }
                  placeholder="$120k - $150k"
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, description: e.target.value })
                  }
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="requirements">
                  Requirements (comma-separated)
                </Label>
                <Textarea
                  id="requirements"
                  value={newJob.requirements}
                  onChange={(e) =>
                    setNewJob({ ...newJob, requirements: e.target.value })
                  }
                  placeholder="5+ years experience, Bachelor's degree, Python expertise"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                <Textarea
                  id="benefits"
                  value={newJob.benefits}
                  onChange={(e) =>
                    setNewJob({ ...newJob, benefits: e.target.value })
                  }
                  placeholder="Health insurance, Stock options, Flexible hours"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newJob.status}
                  onValueChange={(value) =>
                    setNewJob({ ...newJob, status: value as Job["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateJob} className="flex-1">
                  Create Job Posting
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

      {/* Jobs List */}
      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {job.description}
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={job.status}
                    onValueChange={(value) =>
                      handleStatusChange(job.id, value as Job["status"])
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  {job.department}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {job.type}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  {job.salary}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applications} applications
                  </div>
                  <div>Posted: {job.postedDate}</div>
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  View Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs Posted</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job posting to start hiring
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobManagement;
