import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("🎉 Thank you for subscribing! You'll receive updates on new menu items, special offers, and exclusive events.");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-8 sm:py-12 border-b border-background/20">
          <div className="text-center space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">Stay Updated</h3>
            <p className="text-sm sm:text-base text-background/80 max-w-md mx-auto px-4">
              Subscribe to get updates on new menu items, special offers, and exclusive events.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4">
              <Input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/10 border-background/30 text-background placeholder:text-background/60 rounded-full px-6"
                required
              />
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-semibold"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                     {/* Company Info */}
           <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
             <Link to="/" className="cursor-pointer inline-block">
               <img 
                 src="/lovable-uploads/6c5b80cf-9d75-46fb-a308-4f9f0704f8bf.png" 
                 alt="The OG House Logo" 
                 className="h-16 w-16 sm:h-20 sm:w-20 hover:opacity-80 transition-opacity"
               />
             </Link>
             <p className="text-sm sm:text-base text-background/80 leading-relaxed">
               Refined American fare delivered with passion. Experience exceptional flavors 
               crafted by our expert chefs.
             </p>
             <div className="flex justify-center sm:justify-start space-x-4">
              <a 
                href="https://www.instagram.com/the.og.house/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background transition-all duration-300 hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a 
                href="https://www.facebook.com/share/1AKUGeHyMJ/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background transition-all duration-300 hover:scale-110">
                  <Facebook className="h-5 w-5" />
                </Button>
              </a>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-background/10 text-background">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

                     {/* Quick Links */}
           <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
             <h4 className="text-base sm:text-lg font-bold">Quick Links</h4>
             <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-background/80">
              <li><Link to="/menu" className="hover:text-background transition-colors">Menu</Link></li>
              <li><Link to="/#about" className="hover:text-background transition-colors">About Us</Link></li>
              <li><a href="tel:+917070893997" className="hover:text-background transition-colors">Contact</a></li>
              <li><a href="mailto:Theoghouze@gmail.com" className="hover:text-background transition-colors">Catering</a></li>
              <li><Link to="/" className="hover:text-background transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

                     {/* Customer Support */}
           <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
             <h4 className="text-base sm:text-lg font-bold">Support</h4>
             <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-background/80">
              <li><Link to="/my-orders" className="hover:text-background transition-colors">Track Order</Link></li>
              <li><a href="mailto:Theoghouze@gmail.com" className="hover:text-background transition-colors">Help Center</a></li>
              <li><Link to="/" className="hover:text-background transition-colors">Refund Policy</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold">Contact Us</h4>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-background/80">
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">+91-7070893997</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">Theoghouze@gmail.com</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-center sm:text-left">8, Ak apartment, dhatkidih, Jamshedpur 831001<br />Foodie District, FD 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-4 sm:py-6 border-t border-background/20 text-center text-background/60">
          <p className="text-sm sm:text-base">&copy; 2024 The OG House. All rights reserved. Designed with ❤️ for food lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
