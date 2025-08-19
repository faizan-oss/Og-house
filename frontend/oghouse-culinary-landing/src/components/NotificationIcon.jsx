import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import io from 'socket.io-client';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    console.log('🔔 [NotificationIcon] Setting up notifications for user:', user.id, 'Role:', user.role);

    // Connect to Socket.IO server
    const socket = io('https://og-house.onrender.com');
    console.log('🔔 [NotificationIcon] Socket.IO connection initiated');

    // Join appropriate room based on user role
    if (user.role === 'admin') {
      socket.emit('join-admin');
      console.log('🔔 [NotificationIcon] Admin joined notification room');
    } else {
      socket.emit('join-user', user.id);
      console.log('🔔 [NotificationIcon] User joined notification room:', user.id);
    }

    // Listen for admin notifications (new orders)
    if (user.role === 'admin') {
      socket.on('new-order', (data) => {
        console.log('🔔 [NotificationIcon] New order notification received:', data);
        const newNotification = {
          _id: Date.now().toString(),
          type: 'order_placed',
          title: 'New Order Received',
          message: data.message,
          createdAt: data.timestamp,
          isRead: false,
          metadata: data.order
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification with action button
        toast.success('New order received!', {
          description: data.message,
          action: {
            label: 'View Order',
            onClick: () => {
              navigate('/admin');
              setIsOpen(false);
            }
          }
        });
      });
    }

    // Listen for user notifications (order status updates)
    if (user.role !== 'admin') {
      socket.on('order-status-update', (data) => {
        console.log('🔔 [NotificationIcon] Order status notification received:', data);
        const newNotification = {
          _id: Date.now().toString(),
          type: 'order_status_update',
          title: `Order ${data.status}`,
          message: data.message,
          createdAt: data.timestamp,
          isRead: false,
          metadata: { orderId: data.orderId, status: data.status }
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification with action button
        toast.info('Order Update', {
          description: data.message,
          action: {
            label: 'View Order',
            onClick: () => {
              navigate('/my-orders');
              setIsOpen(false);
            }
          }
        });
      });
    }

    // Debug notifications (for troubleshooting)
    socket.on('debug-notification', (data) => {
      console.log('🔔 [NotificationIcon] Debug notification received:', data);
    });

    // Socket connection events
    socket.on('connect', () => {
      console.log('🔔 [NotificationIcon] Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔔 [NotificationIcon] Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('🔔 [NotificationIcon] Socket connection error:', error);
    });

    return () => {
      console.log('🔔 [NotificationIcon] Cleaning up socket connection');
      socket.disconnect();
    };
  }, [user, navigate]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification._id);
    
    // Navigate based on notification type and user role
    if (user.role === 'admin') {
      if (notification.type === 'order_placed') {
        // Admin clicks on new order notification -> go to admin dashboard
        navigate('/admin');
      }
    } else {
      if (notification.type === 'order_status_update') {
        // User clicks on order status update -> go to my orders
        navigate('/my-orders');
      }
    }
    
    // Close notification panel
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_accepted':
        return '✅';
      case 'order_on_way':
        return '🚚';
      case 'order_completed':
        return '🎉';
      case 'order_cancelled':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_accepted':
        return 'text-green-600';
      case 'order_on_way':
        return 'text-blue-600';
      case 'order_completed':
        return 'text-green-600';
      case 'order_cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="default"
        className="relative px-4 py-2 text-sm rounded-full flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4 mr-2" />
        Notifications
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-0">
                    {notifications.map((notification, index) => (
                      <div key={notification._id}>
                        <div
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationIcon;
