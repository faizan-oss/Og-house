import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Heart, Users } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: ChefHat,
      title: "Master Craftsmanship",
      description: "Every dish is prepared by our expert chefs using time-honored techniques and the finest ingredients."
    },
    {
      icon: Heart,
      title: "Passion for Quality",
      description: "We source locally when possible and never compromise on quality. Your satisfaction is our greatest reward."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Born from our community, we serve our neighbors with pride and create connections through exceptional food."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* About Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
                The Story Behind
                <span className="block text-primary">The OG House</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded with a simple mission: to elevate American comfort food to new heights. 
                Our kitchen combines traditional techniques with innovative flavors, creating dishes 
                that honor the past while embracing the future.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From our signature burgers to our carefully crafted sides, every item on our menu 
                tells a story of dedication, quality, and the pursuit of culinary excellence.
              </p>
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-full shadow-elegant transition-all duration-300">
              Learn More About Us
            </Button>
          </div>

          {/* Values Grid */}
          <div className="space-y-6">
            {values.map((value, index) => (
              <Card 
                key={index}
                className="border-2 border-primary/10 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-foreground">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
