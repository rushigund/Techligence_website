import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Target,
  Handshake,
  Users,
  History,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Lightbulb,
  Award,
  Globe,
  Briefcase,
} from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Kunal Gawhale",
      role: "CEO & Co-founder",
      description:
        "A visionary in AI and robotics, leading Techligence with a passion for innovation and ethical technology.",
      image: "https://placehold.co/100x100/A0B9CE/FFFFFF?text=AS", // Placeholder image
    },
    {
      name: "Piyush Shinde",
      role: "HR Head & Co-founder",
      description:
        "Specialist in human resources and talent development, driving the people strategy and cultural foundation behind our organizational success.",
      image: "https://placehold.co/100x100/C0D9E0/FFFFFF?text=MJ", // Placeholder image
    },
    {
      name: "Under Development",
      role: "TBA",
      description: "Under Development",
      image: "https://placehold.co/100x100/D0E9F0/FFFFFF?text=SL", // Placeholder image
    },
    {
      name: "Under Development",
      role: "TBA",
      description: "Under Development",
      image: "https://placehold.co/100x100/E0F9F5/FFFFFF?text=MC", // Placeholder image
    },
  ];

  const milestones = [
    {
      year: 2018,
      event:
        "Company Founded: Techligence established with a vision for autonomous robotics.",
    },
    {
      year: 2019,
      event:
        "First Prototype: Unveiled the initial 4WD exploration robot prototype.",
    },
    {
      year: 2021,
      event:
        "Series A Funding: Secured significant investment for R&D and expansion.",
    },
    {
      year: 2023,
      event:
        "Product Launch: Introduced the RoboTech Explorer Pro to the market.",
    },
    {
      year: 2024,
      event: "Global Expansion: Opened new offices in Europe and Asia.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Lightbulb className="w-3 h-3 mr-1" />
              About Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Pioneering the Future of{" "}
              <span className="text-primary">Intelligent Robotics</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              At Techligence, we are dedicated to developing cutting-edge
              autonomous robotic solutions that empower industries and enrich
              lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/career">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Join Our Team
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-lg px-8"
                >
                  Contact Us
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  To innovate and deliver advanced robotic solutions that
                  enhance productivity, safety, and efficiency across diverse
                  industries.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  To be the global leader in intelligent robotics, creating a
                  future where humans and machines collaborate seamlessly.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Handshake className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-base leading-relaxed text-muted-foreground list-disc list-outside inline-block text-left">
                  <li>Innovation</li>
                  <li>Integrity</li>
                  <li>Excellence</li>
                  <li>Collaboration</li>
                  <li>Impact</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users className="w-3 h-3 mr-1" />
              Our Leadership
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Meet the Visionaries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team comprises brilliant minds and passionate innovators
              dedicated to pushing the boundaries of robotics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center shadow-md">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary/50"
                  />
                  <CardTitle className="text-lg mb-1">{member.name}</CardTitle>
                  <p className="text-sm font-medium text-primary mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our History/Milestones Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <History className="w-3 h-3 mr-1" />
              Our Journey
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Milestones & Achievements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A look back at the key moments that shaped Techligence into what
              it is today.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-primary h-full hidden md:block"></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center w-full my-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="w-full md:w-1/2 px-4">
                  <Card className="shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {milestone.year}
                      </h3>
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-1/2 md:w-1/2 flex justify-center relative">
                  <div className="w-4 h-4 bg-primary rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section (Optional) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Award className="w-3 h-3 mr-1" />
            Recognition
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Our Achievements
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Proudly recognized for our contributions to the robotics industry.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+1"
              alt="Award 1"
              className="h-20 object-contain"
            />
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+2"
              alt="Award 2"
              className="h-20 object-contain"
            />
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+3"
              alt="Award 3"
              className="h-20 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
            Have Questions or Want to Collaborate?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            We'd love to hear from you. Reach out to our team for inquiries,
            partnerships, or career opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-lg px-8"
              >
                Contact Our Team
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/career">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
              >
                View Open Positions
                <Briefcase className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
