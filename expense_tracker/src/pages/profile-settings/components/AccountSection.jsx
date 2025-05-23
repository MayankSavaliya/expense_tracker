import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const AccountSection = ({ userData }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    // In a real app, you would call an API to change the password
    setPasswordError("");
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    
    // Show success toast
    showToast("Password updated successfully!");
  };

  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    showToast("Account deletion request submitted");
    setShowDeleteConfirm(false);
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
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h3>
      
      <div className="space-y-8">
        {/* Account Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="User" size={18} className="mr-2 text-gray-500" />
            Account Information
          </h4>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm font-medium">{userData.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Created</p>
                <p className="text-sm font-medium">{userData.joinDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <p className="text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="Lock" size={18} className="mr-2 text-gray-500" />
            Security
          </h4>
          
          <div className="space-y-4">
            {/* Password Change */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-700">Password</p>
                  <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-3 py-1.5 text-xs bg-mint-500 bg-opacity-10 text-mint-700 rounded-md hover:bg-opacity-20"
                >
                  Change Password
                </button>
              </div>
              
              {showPasswordForm && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <form onSubmit={handlePasswordSubmit}>
                    {passwordError && (
                      <div className="mb-4 p-2 bg-error bg-opacity-10 text-error text-sm rounded">
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordError("");
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs bg-mint-500 text-white rounded-md hover:bg-mint-700"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Two-Factor Authentication */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-mint-500 bg-opacity-10 text-mint-700 rounded-md hover:bg-opacity-20">
                  Enable
                </button>
              </div>
            </div>
            
            {/* Active Sessions */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Sessions</p>
                  <p className="text-xs text-gray-500">Manage devices where you're currently logged in</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Icon name="Database" size={18} className="mr-2 text-gray-500" />
            Data Management
          </h4>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-700">Export Your Data</p>
                  <p className="text-xs text-gray-500">Download a copy of your data</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                    <Icon name="FileText" size={12} className="mr-1" />
                    CSV
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                    <Icon name="FileJson" size={12} className="mr-1" />
                    JSON
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                    <Icon name="FilePdf" size={12} className="mr-1" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div>
          <h4 className="text-lg font-medium text-error mb-4 flex items-center">
            <Icon name="AlertTriangle" size={18} className="mr-2 text-error" />
            Danger Zone
          </h4>
          
          <div className="border border-error border-opacity-20 rounded-md overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-error bg-opacity-5">
              <div>
                <p className="text-sm font-medium text-gray-700">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 text-xs bg-white border border-error text-error rounded-md hover:bg-error hover:bg-opacity-10"
              >
                Delete Account
              </button>
            </div>
          </div>
          
          {/* Delete Account Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-error bg-opacity-10">
                  <Icon name="AlertTriangle" size={24} className="text-error" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Account</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark text-sm font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSection;