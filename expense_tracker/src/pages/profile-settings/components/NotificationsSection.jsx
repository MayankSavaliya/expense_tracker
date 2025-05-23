import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState({
    email: {
      newExpense: true,
      paymentReminder: true,
      friendRequest: true,
      groupInvite: true,
      weeklyReport: false,
      marketingUpdates: false
    },
    push: {
      newExpense: true,
      paymentReminder: true,
      friendRequest: true,
      groupInvite: true,
      weeklyReport: false,
      marketingUpdates: false
    },
    inApp: {
      newExpense: true,
      paymentReminder: true,
      friendRequest: true,
      groupInvite: true,
      weeklyReport: true,
      marketingUpdates: true
    }
  });

  const handleToggle = (category, setting) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));

    // Show toast for immediate feedback
    showToast(`${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} notifications ${!notifications[category][setting] ? 'enabled' : 'disabled'}`);
  };

  const showToast = (message) => {
    // Simple toast implementation
    const toast = document.createElement("div");
    toast.className = "fixed bottom-4 right-4 bg-mint-500 text-white px-4 py-2 rounded-md shadow-md flex items-center";
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Notification settings
  const notificationSettings = [
    { id: "newExpense", label: "New Expenses", description: "When someone adds an expense that involves you" },
    { id: "paymentReminder", label: "Payment Reminders", description: "Reminders about pending payments and settlements" },
    { id: "friendRequest", label: "Friend Requests", description: "When someone sends you a friend request" },
    { id: "groupInvite", label: "Group Invitations", description: "When you\'re invited to join a group" },
    { id: "weeklyReport", label: "Weekly Summary", description: "Weekly report of your expenses and balances" },
    { id: "marketingUpdates", label: "Product Updates", description: "News about features and improvements" }
  ];

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2 ${
        enabled ? 'bg-mint-500' : 'bg-gray-200'
      }`}
      onClick={onChange}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h3>
      
      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-700 flex items-center">
              <Icon name="Mail" size={18} className="mr-2 text-gray-500" />
              Email Notifications
            </h4>
            <button className="text-mint-500 text-sm hover:text-mint-700 flex items-center">
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Reset to Default
            </button>
          </div>
          
          <div className="space-y-4">
            {notificationSettings.map(setting => (
              <div key={`email-${setting.id}`} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <ToggleSwitch
                  enabled={notifications.email[setting.id]}
                  onChange={() => handleToggle('email', setting.id)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Push Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-700 flex items-center">
              <Icon name="BellRing" size={18} className="mr-2 text-gray-500" />
              Push Notifications
            </h4>
            <button className="text-mint-500 text-sm hover:text-mint-700 flex items-center">
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Reset to Default
            </button>
          </div>
          
          <div className="space-y-4">
            {notificationSettings.map(setting => (
              <div key={`push-${setting.id}`} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <ToggleSwitch
                  enabled={notifications.push[setting.id]}
                  onChange={() => handleToggle('push', setting.id)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* In-App Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-700 flex items-center">
              <Icon name="MessageSquare" size={18} className="mr-2 text-gray-500" />
              In-App Notifications
            </h4>
            <button className="text-mint-500 text-sm hover:text-mint-700 flex items-center">
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Reset to Default
            </button>
          </div>
          
          <div className="space-y-4">
            {notificationSettings.map(setting => (
              <div key={`inApp-${setting.id}`} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <ToggleSwitch
                  enabled={notifications.inApp[setting.id]}
                  onChange={() => handleToggle('inApp', setting.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;