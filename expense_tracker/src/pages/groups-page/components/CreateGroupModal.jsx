import React, { useState, useContext, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { groupAPI, userAPI } from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    icon: "Users",
    iconBg: "bg-mint-500",
    members: [],
    type: "shared"
  });

  // State for friends and loading indicator
  const [friends, setFriends] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState(null);

  // Available icons for groups
  const availableIcons = [
    { name: "Users", bg: "bg-mint-500" },
    { name: "Home", bg: "bg-lavender-500" },
    { name: "Utensils", bg: "bg-soft-blue-500" },
    { name: "Plane", bg: "bg-warning" },
    { name: "Car", bg: "bg-info" },
    { name: "ShoppingBag", bg: "bg-success" },
    { name: "Tent", bg: "bg-error" },
    { name: "PartyPopper", bg: "bg-mint-700" },
    { name: "Gamepad2", bg: "bg-lavender-700" },
    { name: "BookOpen", bg: "bg-soft-blue-700" },
    { name: "PalmTree", bg: "bg-warning" },
    { name: "Building", bg: "bg-info" }
  ];

  // Group types
  const groupTypes = [
    { id: "shared", name: "Shared Expenses", description: "Everyone shares expenses equally", icon: "Users" },
    { id: "trip", name: "Trip", description: "For vacations and travel expenses", icon: "Plane" },
    { id: "home", name: "Household", description: "For roommates and family expenses", icon: "Home" },
    { id: "custom", name: "Custom", description: "Create your own expense sharing rules", icon: "Settings" }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  
  // Load friends and other users data from API
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      setContactsError(null);
      
      try {
        // First, get user profile to get friends list
        const profileResponse = await userAPI.getProfile();
        if (profileResponse.data.success) {
          const userFriends = profileResponse.data.data.friends || [];
          setFriends(userFriends.map(friend => ({
            id: friend._id,
            name: friend.name,
            avatar: friend.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
            email: friend.email
          })));
        }
        
        // Then get other users who could be added as group members
        const usersResponse = await userAPI.getUsers();
        if (usersResponse.data.success) {
          const otherUsers = usersResponse.data.data || [];
          setAvailableUsers(otherUsers.map(user => ({
            id: user._id,
            name: user.name,
            avatar: user.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
            email: user.email
          })));
        }
      } catch (error) {
        console.error("Error loading contacts:", error);
        setContactsError("Failed to load contacts. Please try again.");
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    if (isOpen && step === 2) {
      loadContacts();
    }
  }, [isOpen, step]);
  
  // Combine friends and available users into a single contacts list
  const contacts = [...friends, ...availableUsers];
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMember = (contact) => {
    setGroupData(prev => {
      const isSelected = prev.members.some(member => member.id === contact.id);
      
      if (isSelected) {
        return {
          ...prev,
          members: prev.members.filter(member => member.id !== contact.id)
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, contact]
        };
      }
    });
  };

  const selectIcon = (icon, bg) => {
    setGroupData(prev => ({
      ...prev,
      icon,
      iconBg: bg
    }));
  };

  const selectGroupType = (typeId) => {
    setGroupData(prev => ({
      ...prev,
      type: typeId
    }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate group data
      if (!groupData.name || groupData.name.trim().length < 2) {
        toast.error("Please enter a valid group name (at least 2 characters)");
        return;
      }
      
      // Transform data to match the API requirements
      const apiData = {
        name: groupData.name.trim(),
        description: groupData.description.trim(),
        // Add fields that the API accepts from the schema
        type: groupData.type,
        icon: groupData.icon,
        iconBg: groupData.iconBg,
        // Extract just the IDs of the members
        members: groupData.members.map(member => member.id)
      };
      
      // Add the current user as a member if not already included
      if (!apiData.members.includes(user._id)) {
        apiData.members.push(user._id);
      }
      
      console.log("Creating group with data:", apiData);
      
      // Submit to API
      const response = await groupAPI.createGroup(apiData);
      
      // Show success message
      toast.success("Group created successfully!");
      
      // Close modal and refresh groups list
      onClose(true); // Pass true to indicate successful creation
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the current step is valid and the next button can be enabled
  const isStepValid = () => {
    switch (step) {
      case 1:
        // Name is required, and it must be at least 2 characters
        return groupData.name.trim().length >= 2;
      case 2:
        // At least one member must be selected (other than the current user)
        return groupData.members.length > 0;
      case 3:
        // Icon selection is technically optional but we validate group data is valid
        return groupData.name.trim().length >= 2 && 
               groupData.icon && 
               groupData.iconBg;
      default:
        return true;
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-mint-500 text-white text-xs mr-2">1</span>
              Basic Information
            </h3>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name<span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={groupData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Roommates, Trip to Paris"
                    className={`w-full px-4 py-3 border ${
                      groupData.name.trim().length === 0 && step === 1 ? 'border-error' : 'border-gray-300'
                    } rounded-lg focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none transition-all duration-200 bg-white shadow-sm`}
                    required
                  />
                  {groupData.name.trim().length > 0 && (
                    <Icon name="Check" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success" />
                  )}
                </div>
                {groupData.name.trim().length === 0 && step === 1 && (
                  <p className="text-error text-xs mt-1.5 flex items-center">
                    <Icon name="AlertCircle" size={12} className="mr-1" />
                    Group name is required
                  </p>
                )}
                {groupData.name.trim().length === 1 && step === 1 && (
                  <p className="text-error text-xs mt-1.5 flex items-center">
                    <Icon name="AlertCircle" size={12} className="mr-1" />
                    Group name must be at least 2 characters
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={groupData.description}
                  onChange={handleInputChange}
                  placeholder="What is this group for?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none resize-none transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupTypes.map(type => (
                    <div
                      key={type.id}
                      onClick={() => selectGroupType(type.id)}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                        groupData.type === type.id
                          ? "border-mint-500 bg-mint-500 bg-opacity-5 shadow-sm" : 
                          "border-gray-200 hover:border-mint-300 hover:bg-mint-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${
                        groupData.type === type.id ? "bg-mint-500 shadow-sm" : "bg-gray-100"
                      } flex items-center justify-center mr-3 transition-colors`}>
                        <Icon name={type.icon} size={18} className={groupData.type === type.id ? "text-white" : "text-gray-600"} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${groupData.type === type.id ? "text-mint-700" : "text-gray-800"}`}>
                          {type.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-mint-500 text-white text-xs mr-2">2</span>
              Add Members
            </h3>
            <div className="mb-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search friends by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none transition-all duration-200 shadow-sm"
                />
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            
            {groupData.members.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Icon name="Users" size={14} className="mr-2 text-mint-500" />
                  Selected ({groupData.members.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {groupData.members.map(member => (
                    <div 
                      key={member.id}
                      className="flex items-center bg-mint-500 bg-opacity-10 text-mint-700 px-3 py-1.5 rounded-full shadow-sm border border-mint-100 transition-all hover:shadow-md"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border-2 border-white shadow-sm">
                        <Image 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">{member.name}</span>
                      <button 
                        onClick={() => toggleMember(member)}
                        className="ml-2 text-mint-700 hover:text-mint-900 hover:bg-mint-200 rounded-full p-0.5"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg shadow-sm bg-white">
              {isLoadingContacts ? (
                <div className="p-8 text-center">
                  <div className="animate-spin mx-auto text-mint-500 mb-3 w-10 h-10 rounded-full border-4 border-mint-200 border-t-mint-500"></div>
                  <p className="text-gray-500">Loading contacts...</p>
                </div>
              ) : contactsError ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-error bg-opacity-10 flex items-center justify-center mx-auto mb-3">
                    <Icon name="AlertCircle" size={24} className="text-error" />
                  </div>
                  <p className="text-error mb-2 font-medium">{contactsError}</p>
                  <button 
                    onClick={() => setStep(2)} // Reload contacts by "reloading" the step
                    className="text-sm text-mint-500 hover:text-mint-700 px-4 py-2 rounded-md bg-mint-50 hover:bg-mint-100 transition-colors inline-flex items-center"
                  >
                    <Icon name="RefreshCw" size={14} className="mr-1.5" />
                    Retry
                  </button>
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map(contact => {
                  const isSelected = groupData.members.some(member => member.id === contact.id);
                  const isFriend = friends.some(friend => friend.id === contact.id);
                  return (
                    <div 
                      key={contact.id}
                      onClick={() => toggleMember(contact)}
                      className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-mint-50 transition-all duration-200 ${
                        isSelected ? "bg-mint-500 bg-opacity-5" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full overflow-hidden mr-4 ${isFriend ? "border-2 border-lavender-300" : "border border-gray-200"} shadow-sm`}>
                          <Image 
                            src={contact.avatar} 
                            alt={contact.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{contact.name}</h4>
                          <div className="flex items-center mt-0.5">
                            <p className="text-xs text-gray-500">{contact.email}</p>
                            {isFriend && (
                              <span className="inline-flex items-center bg-lavender-500 bg-opacity-15 text-lavender-700 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
                                <Icon name="UserCheck" size={10} className="mr-1" />
                                Friend
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? "bg-mint-500 text-white shadow-sm" : "border-2 border-gray-300 bg-white"
                      }`}>
                        {isSelected && <Icon name="Check" size={14} className="text-white" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Icon name="UserX" size={22} className="text-gray-400" />
                  </div>
                  {searchTerm ? (
                    <p className="text-gray-500">No contacts found matching "<span className="font-medium">{searchTerm}</span>"</p>
                  ) : (
                    <div>
                      <p className="text-gray-500 mb-2">No contacts available.</p>
                      <p className="text-xs text-gray-400">Add friends in the Friends section first.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-mint-500 text-white text-xs mr-2">3</span>
              Customize Group
            </h3>
            <div className="mb-7">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Icon name="Palette" size={14} className="mr-2 text-mint-600" />
                Choose an Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {availableIcons.map((iconOption, index) => (
                  <div
                    key={index}
                    onClick={() => selectIcon(iconOption.name, iconOption.bg)}
                    className={`w-14 h-14 rounded-xl ${iconOption.bg} flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      groupData.icon === iconOption.name && groupData.iconBg === iconOption.bg
                        ? "ring-2 ring-offset-2 ring-mint-500 shadow-lg transform scale-110" : "hover:shadow-md hover:scale-105"
                    }`}
                  >
                    <Icon name={iconOption.name} size={26} className="text-white" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Icon name="Eye" size={14} className="mr-2 text-mint-600" />
                Group Preview
              </h4>
              <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <div className={`w-16 h-16 rounded-xl ${groupData.iconBg} flex items-center justify-center mr-4 shadow-sm`}>
                    <Icon name={groupData.icon} size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-1">
                      {groupData.name || "Group Name"}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {groupData.description || "No description provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center pt-3 border-t border-gray-100">
                  <div className="flex -space-x-3">
                    {groupData.members.slice(0, 4).map((member) => (
                      <div key={member.id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <Image 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {groupData.members.length > 4 && (
                      <div className="w-9 h-9 rounded-full bg-mint-100 border-2 border-white flex items-center justify-center text-xs font-medium text-mint-700 shadow-sm">
                        +{groupData.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-500 flex items-center">
                    <Icon name="Users" size={14} className="mr-1.5 text-gray-400" />
                    {groupData.members.length} members
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-lg transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-5 pt-6 pb-5 sm:p-7 sm:pb-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-mint-500 bg-opacity-10 flex items-center justify-center mr-3">
                      <Icon name="Users" size={16} className="text-mint-600" />
                    </span>
                    Create New Group
                  </h2>
                  <button
                    onClick={() => onClose(false)} /* Don't refresh when canceling */
                    className="text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between relative">
                    {[1, 2, 3].map((stepNumber) => (
                      <div key={stepNumber} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          step > stepNumber 
                            ? "bg-mint-500 border-mint-500 text-white"
                            : step === stepNumber
                            ? "bg-white border-mint-500 text-mint-600 font-medium"
                            : "bg-white border-gray-300 text-gray-500"
                        } transition-all duration-200 shadow-sm`}>
                          {step > stepNumber ? (
                            <Icon name="Check" size={16} />
                          ) : (
                            stepNumber
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${
                          step >= stepNumber ? "text-mint-600" : "text-gray-500"
                        }`}>
                          {stepNumber === 1 ? "Basics" : stepNumber === 2 ? "Members" : "Customize"}
                        </span>
                      </div>
                    ))}
                    
                    {/* Progress connector lines */}
                    <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 -z-0"></div>
                    <div 
                      className="absolute top-5 left-0 h-[2px] bg-mint-500 -z-0 transition-all duration-300 ease-in-out"
                      style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                    ></div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {renderStepContent()}
                </form>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-5 py-4 sm:px-7 sm:flex sm:flex-row-reverse rounded-b-xl border-t border-gray-100">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`w-full inline-flex items-center justify-center rounded-lg shadow-sm px-5 py-2.5 text-base font-medium sm:ml-4 sm:w-auto ${
                  isStepValid()
                    ? "bg-mint-500 hover:bg-mint-600 text-white border border-transparent" :"bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed"
                } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500`}
              >
                Next
                <Icon name="ArrowRight" size={18} className="ml-1.5" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full inline-flex items-center justify-center rounded-lg shadow-sm px-5 py-2.5 text-base font-medium sm:ml-4 sm:w-auto ${
                  isSubmitting 
                  ? 'bg-mint-300 text-white cursor-not-allowed' 
                  : 'bg-mint-500 hover:bg-mint-600 text-white hover:shadow'
                } border border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2.5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={18} className="mr-1.5" />
                    Create Group
                  </>
                )}
              </button>
            )}
            
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 bg-white text-gray-700 hover:bg-gray-50 transition-colors sm:mt-0 sm:w-auto text-base"
              >
                <Icon name="ArrowLeft" size={18} className="mr-1.5" />
                Back
              </button>
            )}
            
            <button
              type="button"
              onClick={() => onClose(false)} /* Don't refresh when canceling */
              className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 bg-white text-gray-700 hover:bg-gray-50 transition-colors sm:mt-0 sm:ml-auto sm:w-auto text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;