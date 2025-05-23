import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";

import NotificationItem from "./components/NotificationItem";
import NotificationGroup from "./components/NotificationGroup";

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  // Mock data for notifications
  const mockNotifications = [
    {
      id: 1,
      type: "expense_added",
      title: "New expense added",
      message: "Emily Johnson added an expense for Grocery Shopping ($85.50) in Roommates.",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      isRead: false,
      data: {
        expenseId: 101,
        groupId: 1,
        amount: 85.50,
        groupName: "Roommates",
        user: {
          id: 2,
          name: "Emily Johnson",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        }
      }
    },
    {
      id: 2,
      type: "payment_received",
      title: "Payment received",
      message: "Michael Brown paid you $450.00 for Rent Payment.",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isRead: false,
      data: {
        transactionId: 201,
        amount: 450.00,
        user: {
          id: 3,
          name: "Michael Brown",
          avatar: "https://randomuser.me/api/portraits/men/59.jpg"
        }
      }
    },
    {
      id: 3,
      type: "group_invitation",
      title: "Group invitation",
      message: "Sarah Wilson invited you to join Weekend Trip group.",
      timestamp: new Date(Date.now() - 28800000), // 8 hours ago
      isRead: true,
      data: {
        groupId: 2,
        groupName: "Weekend Trip",
        user: {
          id: 4,
          name: "Sarah Wilson",
          avatar: "https://randomuser.me/api/portraits/women/63.jpg"
        }
      }
    },
    {
      id: 4,
      type: "settlement_reminder",
      title: "Settlement reminder",
      message: "You have an outstanding balance of $40.25 in Weekend Trip group.",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      isRead: true,
      data: {
        groupId: 2,
        groupName: "Weekend Trip",
        amount: 40.25
      }
    },
    {
      id: 5,
      type: "expense_added",
      title: "New expense added",
      message: "David Lee added an expense for Movie Tickets ($45.00) in Weekend Trip.",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      isRead: true,
      data: {
        expenseId: 102,
        groupId: 2,
        amount: 45.00,
        groupName: "Weekend Trip",
        user: {
          id: 5,
          name: "David Lee",
          avatar: "https://randomuser.me/api/portraits/men/86.jpg"
        }
      }
    },
    {
      id: 6,
      type: "friend_request",
      title: "Friend request",
      message: "Jessica Taylor sent you a friend request.",
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      isRead: true,
      data: {
        userId: 6,
        user: {
          id: 6,
          name: "Jessica Taylor",
          avatar: "https://randomuser.me/api/portraits/women/29.jpg"
        }
      }
    },
    {
      id: 7,
      type: "settlement_completed",
      title: "Settlement completed",
      message: "You settled all balances with Robert Martinez.",
      timestamp: new Date(Date.now() - 604800000), // 1 week ago
      isRead: true,
      data: {
        userId: 7,
        user: {
          id: 7,
          name: "Robert Martinez",
          avatar: "https://randomuser.me/api/portraits/men/42.jpg"
        }
      }
    }
  ];

  useEffect(() => {
    // Simulate loading notifications
    const loadNotifications = () => {
      setLoading(true);
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 800);
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Close panel when clicking outside
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true
      }))
    );
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.timestamp);
      notificationDate.setHours(0, 0, 0, 0);

      if (notificationDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= lastWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-gray-900 bg-opacity-30">
      <div 
        ref={panelRef}
        className="w-full max-w-md bg-white shadow-lg flex flex-col h-full transform transition-transform duration-300 ease-in-out"
        style={{ maxHeight: '100vh' }}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-mint-500 hover:text-mint-700 font-medium"
              >
                Mark all as read
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-mint-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Icon name="Bell" size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">You don't have any notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupedNotifications.today.length > 0 && (
                <NotificationGroup title="Today">
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))}
                </NotificationGroup>
              )}

              {groupedNotifications.yesterday.length > 0 && (
                <NotificationGroup title="Yesterday">
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))}
                </NotificationGroup>
              )}

              {groupedNotifications.thisWeek.length > 0 && (
                <NotificationGroup title="This Week">
                  {groupedNotifications.thisWeek.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))}
                </NotificationGroup>
              )}

              {groupedNotifications.earlier.length > 0 && (
                <NotificationGroup title="Earlier">
                  {groupedNotifications.earlier.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))}
                </NotificationGroup>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Link 
            to="/profile-settings" 
            className="flex items-center justify-center text-sm text-gray-600 hover:text-mint-500"
            onClick={onClose}
          >
            <Icon name="Settings" size={16} className="mr-2" />
            Notification Preferences
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;