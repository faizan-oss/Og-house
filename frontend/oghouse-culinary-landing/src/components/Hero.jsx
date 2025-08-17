import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Truck } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-hero-gradient min-h-[600px] lg:min-h-[700px] flex items-center">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                Refined American
                <span className="block text-primary">Fare Delivered</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl">
                Experience exceptional flavors crafted with passion. From comfort classics to innovative dishes, 
                we bring restaurant-quality meals straight to your door.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 text-base rounded-full shadow-elegant transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center">
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="default" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 py-3 text-base rounded-full transition-all duration-300 flex items-center justify-center">
                View Menu
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Quick Delivery</p>
                  <p className="text-sm text-muted-foreground">30-45 minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Free Delivery</p>
                  <p className="text-sm text-muted-foreground">Orders over ₹200</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:order-2">
            <div className="relative bg-card rounded-3xl shadow-elegant p-8 animate-fade-in">
              <img 
                src="https://res.cloudinary.com/dfpedvv8x/image/upload/v1755247965/food_items/xeqtzhqlgjvqt2uwzgys.png"
                alt="Gourmet burger and fries"
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
