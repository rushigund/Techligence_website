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
import { Link } from "react-router-dom";
import JobApplicationForm from "@/components/JobApplicationForm";
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
} from "lucide-react";

const Career = () => {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    department: string;
    location: string;
  } | null>(null);

  const handleApplyClick = (job: (typeof jobOpenings)[0]) => {
    setSelectedJob({
      title: job.title,
      department: job.department,
      location: job.location,
    });
    setIsApplicationFormOpen(true);
  };

  const jobOpenings = [
    {
      title: "Senior Robotics Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $150k",
      description:
        "Lead the development of next-generation autonomous robotics systems.",
      skills: ["ROS", "Python", "C++", "Machine Learning", "Computer Vision"],
    },
    {
      title: "AI/ML Research Scientist",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $170k",
      description:
        "Research and develop AI algorithms for intelligent robot behavior.",
      skills: ["PyTorch", "TensorFlow", "Computer Vision", "Deep Learning"],
    },
    {
      title: "Frontend Developer",
      department: "Software",
      location: "New York, NY",
      type: "Full-time",
      salary: "$90k - $120k",
      description:
        "Build intuitive interfaces for robot control and monitoring systems.",
      skills: ["React", "TypeScript", "Three.js", "UI/UX Design"],
    },
    {
      title: "Hardware Engineer",
      department: "Hardware",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$100k - $130k",
      description:
        "Design and optimize robotic hardware components and systems.",
      skills: ["PCB Design", "Embedded Systems", "CAD", "Electronics"],
    },
  ];

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
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobOpenings.map((job, index) => (
              <Card
                key={index}
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
                    <Button
                      className="gap-2 shrink-0"
                      onClick={() => handleApplyClick(job)}
                    >
                      Apply Now
                      <ChevronRight className="w-4 h-4" />
                    </Button>
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

      {/* Job Application Form */}
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
    </div>
  );
};

export default Career;
