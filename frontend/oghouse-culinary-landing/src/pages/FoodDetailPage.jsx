import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Star, Leaf, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { foodAPI } from '@/lib/api.js';
import { useCart } from '@/hooks/useCart.js';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchFoodDetails();
  }, [id]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const response = await foodAPI.getFoodById(id);
      
      // Handle different response structures
      if (response.data && response.data.food) {
        setFood(response.data.food);
      } else if (response.data) {
        setFood(response.data);
      } else {
        throw new Error('Food not found');
      }
    } catch (error) {
      console.error('Failed to fetch food details:', error);
      toast.error('Failed to load food details');
      navigate('/menu'); // Redirect to menu if food not found
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(food._id, quantity);
      toast.success(`Added ${quantity} ${food.name} to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading food details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Food Not Found</h1>
            <Button onClick={() => navigate('/menu')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Food Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={food.image} 
                  alt={food.name}
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={(food.mainCategory || food.category) === 'veg' ? 'secondary' : 'destructive'}
                    className="bg-background/90 backdrop-blur"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    {(food.mainCategory || food.category) === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                  </Badge>
                </div>
                {food.rating && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {food.rating}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{food.name}</h1>
              <p className="text-sm text-muted-foreground capitalize mb-4">
                {food.subCategory || food.category}
              </p>
              
              {!food.isAvailable && (
                <Badge variant="secondary" className="mb-4">
                  Currently Unavailable
                </Badge>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {food.description || 'No description available.'}
              </p>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary">₹{food.price}</span>
                {food.isAvailable && (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={increaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {food.isAvailable ? (
                <Button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {addingToCart ? 'Adding...' : `Add ${quantity} to Cart - ₹${food.price * quantity}`}
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg">
                  Currently Unavailable
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Additional Information</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="capitalize">{food.mainCategory || food.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{food.subCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span>{food.isAvailable ? 'Available' : 'Out of Stock'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FoodDetailPage;
