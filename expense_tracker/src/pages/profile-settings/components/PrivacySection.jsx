import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const PrivacySection = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "friends",
    activityVisibility: "friends",
    balanceVisibility: "involved",
    searchable: true,
    allowFriendRequests: true,
    allowGroupInvites: true
  });

  const handleChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));

    // Show toast for immediate feedback
    showToast("Privacy setting updated");
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
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Privacy Settings</h3>
      
      <div className="space-y-8">
        {/* Profile Visibility */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="Eye" size={18} className="mr-2 text-gray-500" />
            Visibility Settings
          </h4>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see your profile?
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-4 py-2 rounded-md border ${
                    privacySettings.profileVisibility === 'public' ?'bg-mint-500 bg-opacity-10 border-mint-500 text-mint-700' :'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleChange('profileVisibility', 'public')}
                >
                  <div className="flex items-center">
                    <Icon name="Globe" size={16} className="mr-2" />
                    <span>Public</span>
                  </div>
                  <p className="text-xs mt-1 text-left">Anyone can view your profile</p>
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md border ${
                    privacySettings.profileVisibility === 'friends' ?'bg-mint-500 bg-opacity-10 border-mint-500 text-mint-700' :'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleChange('profileVisibility', 'friends')}
                >
                  <div className="flex items-center">
                    <Icon name="Users" size={16} className="mr-2" />
                    <span>Friends Only</span>
                  </div>
                  <p className="text-xs mt-1 text-left">Only friends can view your profile</p>
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md border ${
                    privacySettings.profileVisibility === 'private' ?'bg-mint-500 bg-opacity-10 border-mint-500 text-mint-700' :'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleChange('profileVisibility', 'private')}
                >
                  <div className="flex items-center">
                    <Icon name="Lock" size={16} className="mr-2" />
                    <span>Private</span>
                  </div>
                  <p className="text-xs mt-1 text-left">Only you can view your profile</p>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see your activity?
              </label>
              <select
                value={privacySettings.activityVisibility}
                onChange={(e) => handleChange('activityVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
              >
                <option value="public">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="involved">Only People Involved</option>
                <option value="private">Only Me</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                This controls who can see your expense activity and transactions.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see your balances?
              </label>
              <select
                value={privacySettings.balanceVisibility}
                onChange={(e) => handleChange('balanceVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
              >
                <option value="friends">Friends Only</option>
                <option value="involved">Only People Involved</option>
                <option value="private">Only Me</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                This controls who can see how much you owe or are owed.
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection Settings */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="Link" size={18} className="mr-2 text-gray-500" />
            Connection Settings
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Searchable Profile</p>
                <p className="text-xs text-gray-500">Allow others to find you by name or email</p>
              </div>
              <ToggleSwitch
                enabled={privacySettings.searchable}
                onChange={() => handleChange('searchable', !privacySettings.searchable)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Friend Requests</p>
                <p className="text-xs text-gray-500">Allow others to send you friend requests</p>
              </div>
              <ToggleSwitch
                enabled={privacySettings.allowFriendRequests}
                onChange={() => handleChange('allowFriendRequests', !privacySettings.allowFriendRequests)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Group Invitations</p>
                <p className="text-xs text-gray-500">Allow others to invite you to groups</p>
              </div>
              <ToggleSwitch
                enabled={privacySettings.allowGroupInvites}
                onChange={() => handleChange('allowGroupInvites', !privacySettings.allowGroupInvites)}
              />
            </div>
          </div>
        </div>
        
        {/* Data Privacy */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="Shield" size={18} className="mr-2 text-gray-500" />
            Data Privacy
          </h4>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Data</p>
              <p className="text-xs text-gray-600 mb-4">
                We value your privacy and are committed to protecting your personal information. 
                Your data is stored securely and is never shared with third parties without your consent.
              </p>
              <div className="flex space-x-3">
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Icon name="Download" size={14} className="mr-1" />
                  Download Your Data
                </button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                  <Icon name="FileText" size={14} className="mr-1" />
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySection;