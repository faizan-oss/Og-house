import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star, Leaf, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { foodAPI } from '@/lib/api.js';
import { useCart } from '@/hooks/useCart.js';
import { toast } from 'sonner';

const MenuGrid = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  
  const { addToCart } = useCart();

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'salad', label: 'Salads' },
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'wings', label: 'Wings' },
    { value: 'burger', label: 'Burgers' },
    { value: 'sandwich', label: 'Sandwiches' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'combos', label: 'Combos' },
    { value: 'beverage', label: 'Beverages' },
  ];

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [foods, selectedCategory, searchQuery, sortBy, sortOrder, priceRange, vegFilter]);

  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      const response = await foodAPI.getFoods();
      console.log('Food API Response:', response);
      
      // Handle different response structures
      let foodData = [];
      if (response.data && Array.isArray(response.data)) {
        foodData = response.data;
      } else if (response.data && Array.isArray(response.data.foods)) {
        foodData = response.data.foods;
      } else if (response.data && Array.isArray(response.data.items)) {
        foodData = response.data.items;
      } else {
        console.warn('Unexpected response structure:', response.data);
        foodData = [];
      }
      
      setFoods(foodData);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      toast.error('Failed to load menu items');
      
      // Fallback to sample data if API fails
      setFoods([
        {
          _id: '1',
          name: 'Classic Burger',
          description: 'Juicy beef burger with fresh lettuce, tomato, and special sauce',
          price: 299,
          mainCategory: 'non-veg',
          subCategory: 'burger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          isAvailable: true
        },
        {
          _id: '2',
          name: 'Veggie Salad',
          description: 'Fresh mixed greens with cherry tomatoes, cucumber, and balsamic dressing',
          price: 199,
          mainCategory: 'veg',
          subCategory: 'salad',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          isAvailable: true
        },
        {
          _id: '3',
          name: 'Chicken Wings',
          description: 'Crispy fried wings with your choice of sauce',
          price: 399,
          mainCategory: 'non-veg',
          subCategory: 'wings',
          image: 'https://images.unsplash.com/photo-1567620832904-9d8430c60d0f?w=400',
          isAvailable: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...foods];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => {
        // Handle different category field names
        const category = food.subCategory || food.category || food.type;
        return category && category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Veg/Non-veg filter
    if (vegFilter !== 'all') {
      filtered = filtered.filter(food => {
        const category = food.mainCategory || food.category || food.type;
        return category && category.toLowerCase() === vegFilter.toLowerCase();
      });
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(food => {
        if (max) {
          return food.price >= min && food.price <= max;
        } else {
          return food.price >= min;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = (a.subCategory || a.category || a.type || '').toLowerCase();
          bValue = (b.subCategory || b.category || b.type || '').toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFoods(filtered);
  };

  const handleAddToCart = async (food) => {
    try {
      await addToCart(food._id);
      toast.success(`${food.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
    setPriceRange('all');
    setVegFilter('all');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Our <span className="text-primary">Complete Menu</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our full range of delicious offerings, from fresh salads to hearty mains
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={vegFilter} onValueChange={setVegFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Food Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="veg">Vegetarian</SelectItem>
              <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-100">Under ₹100</SelectItem>
              <SelectItem value="100-200">₹100 - ₹200</SelectItem>
              <SelectItem value="200-300">₹200 - ₹300</SelectItem>
              <SelectItem value="300-">Above ₹300</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredFoods.length} of {foods.length} items
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="text-xs md:text-sm py-2"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFoods.map((food) => (
          <Card 
            key={food._id} 
            className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20"
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={food.image}
                  alt={food.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={(food.mainCategory || food.category) === 'veg' ? 'secondary' : 'destructive'}
                    className="bg-background/90 backdrop-blur"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    {(food.mainCategory || food.category) === 'veg' ? 'Veg' : 'Non-Veg'}
                  </Badge>
                </div>
                {!food.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-background/90">
                      Currently Unavailable
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{food.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{food.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₹{food.price}</span>
                  <Button 
                    size="default" 
                    onClick={() => handleAddToCart(food)}
                    disabled={!food.isAvailable}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 text-sm flex items-center justify-center"
                  >
                    Add
                    <Plus className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground capitalize">
                  {(food.subCategory || food.category || food.type || 'other').replace('-', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFoods.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No items found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to discover our delicious offerings
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
