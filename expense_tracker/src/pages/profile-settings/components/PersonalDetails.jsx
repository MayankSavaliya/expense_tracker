import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const PersonalDetails = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
    biography: userData.biography
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save the data to the backend here
    setIsEditing(false);
    
    // Show success toast
    showToast("Profile updated successfully!");
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Personal Details</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center text-mint-500 hover:text-mint-700"
        >
          <Icon name={isEditing ? "X" : "Edit2"} size={16} className="mr-1" />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
            Biography
          </label>
          <textarea
            id="biography"
            name="biography"
            rows="4"
            value={formData.biography}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
          ></textarea>
        </div>
        
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalDetails;