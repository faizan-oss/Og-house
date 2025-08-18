import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import { foodAPI, orderAPI, adminAPI } from '@/lib/api.js';
import { toast } from 'sonner';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [loading, setLoading] = useState(false);

  // Food form state
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    mainCategory: 'veg',
    subCategory: '',
    image: null,
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsRes, ordersRes, statsRes] = await Promise.all([
        foodAPI.getFoods(),
        orderAPI.getAllOrders(),
        adminAPI.getDashboardStats()
      ]);
      
      setFoods(Array.isArray(foodsRes.data) ? foodsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
      // Set default values on error
      setFoods([]);
      setOrders([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodForm(prev => ({ ...prev, image: file }));
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('name', foodForm.name);
      formData.append('description', foodForm.description);
      formData.append('price', foodForm.price);
      formData.append('mainCategory', foodForm.mainCategory);
      formData.append('subCategory', foodForm.subCategory);
      formData.append('isAvailable', foodForm.isAvailable);
      
      if (foodForm.image) {
        formData.append('image', foodForm.image);
      }

      if (editingFood) {
        await foodAPI.updateFood(editingFood._id, formData);
        toast.success('Food item updated successfully');
      } else {
        await foodAPI.createFood(formData);
        toast.success('Food item added successfully');
      }

      setShowAddFood(false);
      setEditingFood(null);
      setFoodForm({
        name: '',
        description: '',
        price: '',
        mainCategory: 'veg',
        subCategory: '',
        image: null,
        isAvailable: true
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save food item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      mainCategory: food.mainCategory,
      subCategory: food.subCategory,
      image: null,
      isAvailable: food.isAvailable
    });
    setShowAddFood(true);
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await foodAPI.deleteFood(id);
        toast.success('Food item deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete food item');
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'on-the-way': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'on-the-way': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Link to="/" className="cursor-pointer">
            <img
              src="/lovable-uploads/6c5b80cf-9d75-46fb-a308-4f9f0704f8bf.png"
              
              alt="The OG House Logo"
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage your restaurant operations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="foods">Food Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newOrders || 0} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.userGrowth || 0} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{foods?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {foods?.filter(f => f.isAvailable)?.length || 0} available
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.slice(0, 5)?.map((order) => (
                    <div key={order._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order._id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} - ₹{order.totalAmount}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => {
                    setActiveTab('foods');
                    setShowAddFood(true);
                  }} 
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Food Item
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="foods" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Food Management</h2>
            <Button onClick={() => setShowAddFood(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Food Item
            </Button>
          </div>

          {showAddFood && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFood} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Food Name</Label>
                      <Input
                        id="name"
                        value={foodForm.name}
                        onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={foodForm.price}
                        onChange={(e) => setFoodForm(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={foodForm.description}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="mainCategory">Main Category</Label>
                      <select
                        id="mainCategory"
                        value={foodForm.mainCategory}
                        onChange={(e) => setFoodForm(prev => ({ ...prev, mainCategory: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subCategory">Sub Category</Label>
                      <select
                        id="subCategory"
                        value={foodForm.subCategory}
                        onChange={(e) => setFoodForm(prev => ({ ...prev, subCategory: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select sub category</option>
                        <option value="salad">Salad</option>
                        <option value="appetizers">Appetizers</option>
                        <option value="wings">Wings</option>
                        <option value="burger">Burger</option>
                        <option value="sandwich">Sandwich</option>
                        <option value="main-course">Main Course</option>
                        <option value="combos">Combos</option>
                        <option value="beverage">Beverage</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="image">Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required={!editingFood}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isAvailable"
                      type="checkbox"
                      checked={foodForm.isAvailable}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    />
                    <Label htmlFor="isAvailable">Available for ordering</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      {editingFood ? 'Update Food' : 'Add Food'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowAddFood(false);
                        setEditingFood(null);
                        setFoodForm({
                          name: '',
                          description: '',
                          price: '',
                          mainCategory: 'veg',
                          subCategory: '',
                          image: null,
                          isAvailable: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods?.map((food) => (
              <Card key={food._id}>
                <div className="relative">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge 
                    variant={food.mainCategory === 'veg' ? 'secondary' : 'destructive'}
                    className="absolute top-2 left-2"
                  >
                    {food.mainCategory === 'veg' ? 'Veg' : 'Non-Veg'}
                  </Badge>
                  {!food.isAvailable && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Unavailable
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{food.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {food.description}
                  </p>
                  <p className="font-bold text-primary mb-3">₹{food.price}</p>
                  <p className="text-xs text-muted-foreground mb-3 capitalize">
                    {food.subCategory}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditFood(food)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFood(food._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <h2 className="text-2xl font-bold">Order Management</h2>
          
          <div className="space-y-4">
            {orders?.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order._id.slice(-6)}</h3>
                      <p className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">Customer Details</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName} - {order.deliveryDetails?.phone}
                      </p>
                      {order.deliveryDetails?.address && (
                        <p className="text-sm text-muted-foreground">
                          {order.deliveryDetails.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Order Details</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderType} - {order.paymentMethod}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.food.name} x {item.quantity}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, 'accepted')}
                      disabled={order.status === 'accepted'}
                    >
                      Accept Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, 'on-the-way')}
                      disabled={order.status === 'on-the-way'}
                    >
                      Mark On The Way
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      disabled={order.status === 'completed'}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      disabled={order.status === 'cancelled'}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                User management features will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
