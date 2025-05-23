import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const PreferencesSection = ({ userData }) => {
  const [preferences, setPreferences] = useState({
    currency: userData.preferences.currency,
    language: userData.preferences.language,
    theme: userData.preferences.theme,
    defaultGroup: userData.preferences.defaultGroup
  });

  const currencies = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "JPY", label: "Japanese Yen (¥)" },
    { value: "CAD", label: "Canadian Dollar (C$)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "INR", label: "Indian Rupee (₹)" }
  ];

  const languages = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Hindi", label: "Hindi" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Show toast for immediate feedback
    showToast(`${name.charAt(0).toUpperCase() + name.slice(1)} updated!`);
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

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Preferences</h3>
      
      <div className="space-y-6">
        {/* Currency Preference */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Default Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={preferences.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          >
            {currencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            This will be the default currency for all your transactions.
          </p>
        </div>
        
        {/* Language Preference */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={preferences.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          >
            {languages.map(language => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Theme Preference */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-3">
            Theme
          </span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={preferences.theme === "light"}
                onChange={handleChange}
                className="h-4 w-4 text-mint-500 focus:ring-mint-500 focus:ring-2 focus:outline-none"
              />
              <span className="ml-2 flex items-center">
                <Icon name="Sun" size={16} className="mr-1 text-warning" />
                Light
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={preferences.theme === "dark"}
                onChange={handleChange}
                className="h-4 w-4 text-mint-500 focus:ring-mint-500 focus:ring-2 focus:outline-none"
              />
              <span className="ml-2 flex items-center">
                <Icon name="Moon" size={16} className="mr-1 text-lavender-500" />
                Dark
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={preferences.theme === "system"}
                onChange={handleChange}
                className="h-4 w-4 text-mint-500 focus:ring-mint-500 focus:ring-2 focus:outline-none"
              />
              <span className="ml-2 flex items-center">
                <Icon name="Monitor" size={16} className="mr-1 text-info" />
                System
              </span>
            </label>
          </div>
          
          {/* Theme Preview */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-md border ${preferences.theme === "light" ? "border-mint-500" : "border-gray-200"}`}>
              <div className="bg-white p-3 rounded shadow-sm mb-2">
                <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Light Theme</span>
                {preferences.theme === "light" && (
                  <Icon name="Check" size={14} className="text-mint-500" />
                )}
              </div>
            </div>
            
            <div className={`p-4 rounded-md border ${preferences.theme === "dark" ? "border-mint-500" : "border-gray-200"}`}>
              <div className="bg-gray-800 p-3 rounded shadow-sm mb-2">
                <div className="h-2 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-2 w-16 bg-gray-600 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Dark Theme</span>
                {preferences.theme === "dark" && (
                  <Icon name="Check" size={14} className="text-mint-500" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Default Group */}
        <div>
          <label htmlFor="defaultGroup" className="block text-sm font-medium text-gray-700 mb-2">
            Default Group
          </label>
          <select
            id="defaultGroup"
            name="defaultGroup"
            value={preferences.defaultGroup}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          >
            <option value="Roommates">Roommates</option>
            <option value="Weekend Trip">Weekend Trip</option>
            <option value="Lunch Club">Lunch Club</option>
            <option value="Office Party">Office Party</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            This group will be selected by default when adding new expenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;