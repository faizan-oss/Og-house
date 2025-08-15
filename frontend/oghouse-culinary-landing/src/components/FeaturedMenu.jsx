import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Leaf } from 'lucide-react';
import { foodAPI } from '@/lib/api.js';
import { useCart } from '@/hooks/useCart.js';
import { toast } from 'sonner';

const FeaturedMenu = () => {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedFoods();
  }, []);

  const fetchFeaturedFoods = async () => {
    try {
      setIsLoading(true);
      const response = await foodAPI.getFoods();
      console.log('Featured Foods API Response:', response);
      
      // Handle different response structures
      let allFoods = [];
      if (response.data && Array.isArray(response.data)) {
        allFoods = response.data;
      } else if (response.data && Array.isArray(response.data.foods)) {
        allFoods = response.data.foods;
      } else if (response.data && Array.isArray(response.data.items)) {
        allFoods = response.data.items;
      } else {
        console.warn('Unexpected response structure:', response.data);
        allFoods = [];
      }
      
      // Get featured foods (first 6 available items)
      const featured = allFoods
        .filter(food => food.isAvailable !== false) // Handle undefined isAvailable
        .slice(0, 6);
      
      setFeaturedFoods(featured);
    } catch (error) {
      console.error('Failed to fetch featured foods:', error);
      toast.error('Failed to load featured menu');
      
      // Fallback to sample data
      setFeaturedFoods([
        {
          _id: '1',
          name: 'Classic Burger',
          description: 'Juicy beef burger with fresh lettuce, tomato, and special sauce',
          price: 299,
          mainCategory: 'non-veg',
          subCategory: 'burger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          isAvailable: true,
          rating: 4.5
        },
        {
          _id: '2',
          name: 'Veggie Salad',
          description: 'Fresh mixed greens with cherry tomatoes, cucumber, and balsamic dressing',
          price: 199,
          mainCategory: 'veg',
          subCategory: 'salad',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          isAvailable: true,
          rating: 4.3
        },
        {
          _id: '3',
          name: 'Chicken Wings',
          description: 'Crispy fried wings with your choice of sauce',
          price: 399,
          mainCategory: 'non-veg',
          subCategory: 'wings',
          image: 'https://images.unsplash.com/photo-1567620832904-9d8430c60d0f?w=400',
          isAvailable: true,
          rating: 4.7
        },
        {
          _id: '4',
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
          price: 499,
          mainCategory: 'veg',
          subCategory: 'pizza',
          image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400',
          isAvailable: true,
          rating: 4.6
        },
        {
          _id: '5',
          name: 'Grilled Chicken Sandwich',
          description: 'Grilled chicken breast with lettuce, tomato, and mayo on toasted bread',
          price: 349,
          mainCategory: 'non-veg',
          subCategory: 'sandwich',
          image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
          isAvailable: true,
          rating: 4.4
        },
        {
          _id: '6',
          name: 'Fresh Fruit Smoothie',
          description: 'Blend of seasonal fruits with yogurt and honey',
          price: 149,
          mainCategory: 'veg',
          subCategory: 'beverage',
          image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
          isAvailable: true,
          rating: 4.2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (food) => {
    try {
      await addToCart(food._id);
      toast.success(`${food.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured <span className="text-primary">Menu Items</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover our most popular and delicious dishes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Featured <span className="text-primary">Menu Items</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our most popular and delicious dishes
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredFoods.map((item) => (
            <Card 
              key={item._id} 
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={(item.mainCategory || item.category) === 'veg' ? 'secondary' : 'destructive'}
                    className="bg-background/90 backdrop-blur"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    {(item.mainCategory || item.category) === 'veg' ? 'Veg' : 'Non-Veg'}
                  </Badge>
                </div>
                {item.rating && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {item.rating}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₹{item.price}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 text-sm group-hover:scale-105 transition-transform flex items-center justify-center"
                    >
                      Add
                      <Plus className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground capitalize">
                  {(item.subCategory || item.category || item.type || 'other').replace('-', ' ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-full px-8 py-3 text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => window.location.href = '/menu'}
          >
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMenu;
