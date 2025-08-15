import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { notificationAPI } from '@/lib/api.js';
import { toast } from 'sonner';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
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
                          onClick={() => markAsRead(notification._id)}
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
