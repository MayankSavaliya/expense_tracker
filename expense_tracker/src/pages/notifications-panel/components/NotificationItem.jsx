import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const NotificationItem = ({ notification }) => {
  const { type, message, timestamp, isRead, data } = notification;

  // Format the time (e.g., "2 hours ago")
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Determine the icon based on notification type
  const getNotificationIcon = () => {
    switch (type) {
      case "expense_added":
        return { name: "Receipt", color: "text-lavender-500", bg: "bg-lavender-500" };
      case "payment_received":
        return { name: "CreditCard", color: "text-success", bg: "bg-success" };
      case "group_invitation":
        return { name: "Users", color: "text-soft-blue-500", bg: "bg-soft-blue-500" };
      case "settlement_reminder":
        return { name: "Clock", color: "text-warning", bg: "bg-warning" };
      case "friend_request":
        return { name: "UserPlus", color: "text-mint-500", bg: "bg-mint-500" };
      case "settlement_completed":
        return { name: "CheckCircle", color: "text-success", bg: "bg-success" };
      default:
        return { name: "Bell", color: "text-gray-500", bg: "bg-gray-500" };
    }
  };

  // Determine the link based on notification type
  const getNotificationLink = () => {
    switch (type) {
      case "expense_added":
        return `/group-details-page?id=${data.groupId}&expense=${data.expenseId}`;
      case "payment_received":
        return `/transactions-page?id=${data.transactionId}`;
      case "group_invitation":
        return `/group-details-page?id=${data.groupId}`;
      case "settlement_reminder":
        return `/settlements-page?group=${data.groupId}`;
      case "friend_request":
        return `/friends-page?id=${data.userId}`;
      case "settlement_completed":
        return `/settlements-page`;
      default:
        return "/dashboard";
    }
  };

  const icon = getNotificationIcon();
  const link = getNotificationLink();

  return (
    <Link 
      to={link}
      className={`block p-4 hover:bg-gray-50 transition-colors ${!isRead ? 'bg-mint-500 bg-opacity-5' : ''}`}
    >
      <div className="flex">
        <div className="mr-3">
          <div className={`w-10 h-10 rounded-full ${icon.bg} bg-opacity-10 flex items-center justify-center relative`}>
            <Icon name={icon.name} size={18} className={icon.color} />
            {!isRead && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-mint-500 rounded-full border-2 border-white"></span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`font-medium text-gray-800 ${isRead ? 'opacity-80' : ''}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {timeAgo}
            </span>
          </div>
          <p className={`text-sm text-gray-600 ${isRead ? 'opacity-80' : ''}`}>
            {message}
          </p>
          
          {/* Show user avatar for relevant notifications */}
          {data.user && (
            <div className="mt-2 flex items-center">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image 
                  src={data.user.avatar} 
                  alt={data.user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {data.user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NotificationItem;