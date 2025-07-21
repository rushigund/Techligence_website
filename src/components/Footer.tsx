import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F19ea23aafe364ba794f4649330baa0f9%2F6ab4735d62b8469981e63420c42401fc?format=webp&width=800"
                  alt="Techligence Logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Techligence
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Revolutionizing industries with advanced AI-powered robotics. Building the future of intelligent automation, one robot at a time.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:info@techligence.net" className="hover:text-foreground transition-colors">info@techligence.net</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+917020812247" className="hover:text-foreground transition-colors">+91 70208 12247</a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <span>Saptagiri Building, Lokdhara Phase 3, <br/>Near Ganesh Nagar, Kalyan, Maharashtra, 421306</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/career" className="hover:text-foreground transition-colors">Career</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Products</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/products?category=exploration" className="hover:text-foreground transition-colors">4WD Robots</Link></li>
              <li><Link to="/controller" className="hover:text-foreground transition-colors">Robot Controller</Link></li>
              <li><Link to="/products?category=ai" className="hover:text-foreground transition-colors">AI Solutions</Link></li>
              <li><Link to="/products?category=industrial" className="hover:text-foreground transition-colors">Enterprise</Link></li>
            </ul>
          </div>

          {/* <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link to="/api-reference" className="hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link to="/community" className="hover:text-foreground transition-colors">Community</Link></li>
              <li><Link to="/status" className="hover:text-foreground transition-colors">Status</Link></li>
            </ul>
          </div> */}

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link to="/gdpr" className="hover:text-foreground transition-colors">GDPR</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Techligence. All rights reserved. 
          </div>
          <div className="flex space-x-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
