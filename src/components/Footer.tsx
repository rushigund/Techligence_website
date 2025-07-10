import { Link } from "react-router-dom";
import {
  Bot,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Career", href: "/career" },
      { name: "Contact Us", href: "/contact" },
      { name: "Blog", href: "/blog" },
    ],
    products: [
      { name: "4WD Robots", href: "/products" },
      { name: "Robot Controller", href: "/controller" },
      { name: "AI Solutions", href: "/products" },
      { name: "Enterprise", href: "/products" },
    ],
    support: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/techligence", icon: Twitter },
    { name: "GitHub", href: "https://github.com/techligence", icon: Github },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/techligence",
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F19ea23aafe364ba794f4649330baa0f9%2F6ab4735d62b8469981e63420c42401fc?format=webp&width=800"
                    alt="Techligence Logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="font-display font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Techligence
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Revolutionizing industries with advanced AI-powered robotics.
                Building the future of intelligent automation, one robot at a
                time.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href="mailto:hello@techligence.com"
                    className="hover:text-primary transition-colors"
                  >
                    hello@techligence.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <a
                    href="tel:+15551234567"
                    className="hover:text-primary transition-colors"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    123 Tech Boulevard
                    <br />
                    San Francisco, CA 94105
                  </span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Products</h3>
              <ul className="space-y-3">
                {footerLinks.products.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Techligence. All rights reserved.
              </p>
              <a
                href="/admin/login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Admin Access
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
