import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Clock } from 'lucide-react';
import { orderAPI } from '@/lib/api.js';
import { useCart } from '@/hooks/useCart.js';
import { toast } from 'sonner';

const CheckoutForm = ({ onBack, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    orderType: 'delivery',
    paymentMethod: 'cod',
    specialInstructions: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.orderType === 'delivery' && !formData.address) {
      toast.error('Please provide delivery address');
      return;
    }

    try {
      setIsLoading(true);
      
      const orderData = {
        ...formData,
        items: cart.items.map(item => ({
          food: item.food?._id || item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.totalPrice,
        deliveryFee: formData.orderType === 'delivery' ? 40 : 0,
        finalAmount: formData.orderType === 'delivery' ? cart.totalPrice + 40 : cart.totalPrice
      };

      const response = await orderAPI.createOrderFromCart(orderData);
      
      toast.success('Order placed successfully!');
      
      // Clear cart after successful order
      await clearCart();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.totalPrice;
    const deliveryFee = formData.orderType === 'delivery' ? 40 : 0;
    return subtotal + deliveryFee;
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Your cart is empty
        </h3>
        <p className="text-muted-foreground mb-4">
          Add some items to your cart to proceed with checkout
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.orderType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, orderType: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Home Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">Pickup</Label>
                </div>
              </RadioGroup>

              {formData.orderType === 'delivery' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Online Payment (Coming Soon)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special instructions for your order? (Optional)"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.food?.image || item.image}
                      alt={item.food?.name || item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-medium">{item.food?.name || item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.totalPrice}</span>
                </div>
                {formData.orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹40</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="px-8 py-3 text-lg rounded-full flex items-center justify-center"
          >
            {isLoading ? 'Placing Order...' : `Place Order - ₹${calculateTotal()}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
