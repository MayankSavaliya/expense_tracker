import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const GroupSettingsTab = ({ group }) => {
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description);
  const [groupCurrency, setGroupCurrency] = useState(group.currency);
  const [groupIcon, setGroupIcon] = useState(group.icon);
  const [groupIconBg, setGroupIconBg] = useState(group.iconBg);
  
  // Available currencies
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "$", name: "Australian Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" }
  ];
  
  // Available icons
  const icons = [
    { name: "Home", label: "Home" },
    { name: "Utensils", label: "Food" },
    { name: "Car", label: "Travel" },
    { name: "Briefcase", label: "Work" },
    { name: "Plane", label: "Trip" },
    { name: "ShoppingBag", label: "Shopping" },
    { name: "Users", label: "Friends" },
    { name: "Heart", label: "Family" }
  ];
  
  // Available icon backgrounds
  const iconBackgrounds = [
    { class: "bg-mint-500", label: "Mint" },
    { class: "bg-lavender-500", label: "Lavender" },
    { class: "bg-soft-blue-500", label: "Blue" },
    { class: "bg-success", label: "Green" },
    { class: "bg-warning", label: "Amber" },
    { class: "bg-error", label: "Red" },
    { class: "bg-info", label: "Sky Blue" },
    { class: "bg-gray-500", label: "Gray" }
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update the group settings
    alert("Group settings updated successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="groupDescription"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Icon
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Select Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {icons.map((icon) => (
                          <button
                            key={icon.name}
                            type="button"
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              groupIcon === icon.name 
                                ? 'bg-gray-200 ring-2 ring-mint-500' :'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => setGroupIcon(icon.name)}
                          >
                            <Icon name={icon.name} size={20} className="text-gray-700" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Select Background</label>
                      <div className="grid grid-cols-4 gap-2">
                        {iconBackgrounds.map((bg) => (
                          <button
                            key={bg.class}
                            type="button"
                            className={`w-12 h-12 ${bg.class} rounded-full flex items-center justify-center ${
                              groupIconBg === bg.class ? 'ring-2 ring-gray-400' : ''
                            }`}
                            onClick={() => setGroupIconBg(bg.class)}
                          >
                            {groupIconBg === bg.class && (
                              <Icon name="Check" size={20} className="text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-gray-500 mr-3">Preview:</span>
                    <div className={`w-12 h-12 ${groupIconBg} rounded-full flex items-center justify-center`}>
                      <Icon name={groupIcon} size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Financial Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Financial Settings</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="groupCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    id="groupCurrency"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                    value={groupCurrency}
                    onChange={(e) => setGroupCurrency(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable automatic split suggestions based on past expenses
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow members to add expenses in different currencies
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Settings</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notify me when a new expense is added
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notify me when someone settles a balance with me
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Send me a weekly summary of group activity
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-mint-500 focus:ring-mint-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Send me reminders for unsettled balances
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Danger Zone</h3>
            <div className="bg-white rounded-lg border border-error border-opacity-50 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-medium text-gray-800">Archive Group</h4>
                    <p className="text-sm text-gray-500">
                      Hide this group from your active groups list. You can restore it later.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Archive
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">Leave Group</h4>
                      <p className="text-sm text-gray-500">
                        You will no longer have access to this group's expenses.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 border border-error rounded-md text-sm font-medium text-error bg-white hover:bg-error hover:bg-opacity-10"
                    >
                      Leave
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">Delete Group</h4>
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. All data will be permanently deleted.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GroupSettingsTab;