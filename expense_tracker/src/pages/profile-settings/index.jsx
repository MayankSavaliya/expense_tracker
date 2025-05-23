import React, { useState } from "react";

import Icon from "../../components/AppIcon";

import ProfileInfo from "./components/ProfileInfo";
import PersonalDetails from "./components/PersonalDetails";
import PreferencesSection from "./components/PreferencesSection";
import NotificationsSection from "./components/NotificationsSection";
import PrivacySection from "./components/PrivacySection";
import AccountSection from "./components/AccountSection";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeSetting, setActiveSetting] = useState("preferences");
  
  // Mock user data
  const userData = {
    id: 1,
    name: "John Smith",
    username: "@johnsmith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "San Francisco, CA",
    joinDate: "January 2022",
    stats: {
      groups: 5,
      friends: 12,
      transactions: 47
    },
    biography: `I'm a software engineer living in San Francisco. I enjoy hiking, photography, and trying new restaurants with friends. I use this app to split expenses for our weekend trips and dining adventures.

I believe in keeping finances transparent and simple among friends, which is why I love using this expense tracker!`,
    preferences: {
      currency: "USD",
      language: "English",
      theme: "light",
      defaultGroup: "Roommates"
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "User" },
    { id: "settings", label: "Settings", icon: "Settings" }
  ];

  const settingsSections = [
    { id: "preferences", label: "Preferences", icon: "Sliders" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "privacy", label: "Privacy", icon: "Shield" },
    { id: "account", label: "Account", icon: "UserCog" }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Profile & Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-6 py-4 focus:outline-none ${
                activeTab === tab.id
                  ? "border-b-2 border-mint-500 text-mint-500 font-medium" :"text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <ProfileInfo userData={userData} />
          </div>

          {/* Personal Details */}
          <div className="lg:col-span-2">
            <PersonalDetails userData={userData} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Settings</h3>
              <nav>
                <ul className="space-y-1">
                  {settingsSections.map((section) => (
                    <li key={section.id}>
                      <button
                        className={`w-full flex items-center px-4 py-3 rounded-md ${
                          activeSetting === section.id
                            ? "bg-mint-500 bg-opacity-10 text-mint-700 font-medium" :"text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveSetting(section.id)}
                      >
                        <Icon
                          name={section.icon}
                          size={18}
                          className={activeSetting === section.id ? "text-mint-500" : ""}
                        />
                        <span className="ml-3">{section.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeSetting === "preferences" && <PreferencesSection userData={userData} />}
              {activeSetting === "notifications" && <NotificationsSection />}
              {activeSetting === "privacy" && <PrivacySection />}
              {activeSetting === "account" && <AccountSection userData={userData} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;