import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-background/20">
          <div className="text-center space-y-6">
            <h3 className="text-2xl lg:text-3xl font-bold">Stay Updated</h3>
            <p className="text-background/80 max-w-md mx-auto">
              Subscribe to get updates on new menu items, special offers, and exclusive events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-background/10 border-background/30 text-background placeholder:text-background/60 rounded-full px-6"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <img 
              src="/lovable-uploads/6c5b80cf-9d75-46fb-a308-4f9f0704f8bf.png" 
              alt="The OG House Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-background/80 leading-relaxed">
              Refined American fare delivered with passion. Experience exceptional flavors 
              crafted by our expert chefs.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-3 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">Menu</a></li>
              <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Catering</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Support</h4>
            <ul className="space-y-3 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Contact Us</h4>
            <div className="space-y-4 text-background/80">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span>hello@oghouse.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1" />
                <span>123 Culinary Street<br />Foodie District, FD 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-background/20 text-center text-background/60">
          <p>&copy; 2024 The OG House. All rights reserved. Designed with ❤️ for food lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
