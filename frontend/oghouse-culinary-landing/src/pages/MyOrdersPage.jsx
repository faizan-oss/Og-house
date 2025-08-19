import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { orderAPI } from '@/lib/api';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, Mail, Package, CheckCircle, XCircle, Truck, Loader2 } from 'lucide-react';

const MyOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      console.log('Orders fetched:', response);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Accepted':
        return <Loader2 className="h-4 w-4" />;
      case 'Preparing':
        return <Package className="h-4 w-4" />;
      case 'On The Way':
        return <Truck className="h-4 w-4" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800';
      case 'On The Way':
        return 'bg-orange-100 text-orange-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start exploring our menu!
                </p>
                <Button onClick={() => window.location.href = '/menu'}>
                  Browse Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{String(order._id).slice(-8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.food?.image} 
                                alt={item.food?.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-medium">{item.food?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × {formatCurrency(item.food?.price)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              {formatCurrency(item.total || (item.food?.price * item.quantity))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Details */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Order Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{order.orderType || 'Delivery'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Payment:</span>
                            <span className="font-medium">{order.paymentMethod || 'Cash on Delivery'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-semibold text-lg">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Details */}
                      {order.orderType !== 'pickup' && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Address:</span>
                              <span className="font-medium">{order.deliveryDetails?.address || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">City:</span>
                              <span className="font-medium">{order.deliveryDetails?.city || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Pincode:</span>
                              <span className="font-medium">{order.deliveryDetails?.pincode || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{order.deliveryDetails?.phone || order.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-semibold mb-2 text-amber-800">Special Instructions</h4>
                        <p className="text-amber-700 italic">"{order.specialInstructions}"</p>
                      </div>
                    )}

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Order Progress</h4>
                        <div className="space-y-2">
                          {order.statusHistory.map((status, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="font-medium">{status.status}</span>
                              <span className="text-muted-foreground">
                                {formatDate(status.timestamp)}
                              </span>
                              {status.notes && (
                                <span className="text-muted-foreground italic">- {status.notes}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
