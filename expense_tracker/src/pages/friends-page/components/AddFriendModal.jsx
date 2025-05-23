import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { friendAPI, userAPI } from "../../../services/api";
import Toast from "./Toast";
import './modal.css';

const AddFriendModal = ({ onClose, onFriendRequestSent }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [toast, setToast] = useState(null);

  // Get current user and fetch pending requests on modal open
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get the current user's profile 
        const profileResponse = await userAPI.getProfile();
        if (profileResponse.data.success) {
          setCurrentUserId(profileResponse.data.data._id);
        }
        const outgoingResponse = await friendAPI.getOutgoingRequests();
        
        const outgoingIds = outgoingResponse.data.data.map(req => req.recipient._id);
        // Store all pending request ids
        setPendingRequests([...outgoingIds]);
        console.log('Pending Requests:', pendingRequests);
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };
    
    loadUserData();
  }, []);

  // Search users function
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Get friends to exclude them from results
      const friendsResponse = await friendAPI.getFriends();
      const friendIds = friendsResponse.data.data.map(friend => friend._id);
      console.log('Friend IDs:', friendIds);
      // Get users
      const response = await userAPI.getUsers();
      console.log(response.data.data);
      const users = response.data.data.filter(user => 
        user._id !== currentUserId && 
        !friendIds.includes(user._id) &&
        !pendingRequests.includes(user._id) &&
        (searchTerm.trim() === "" || 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      ).map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`
      }));
      
      setSearchResults(users);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add debounce for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(); // Will handle both empty and non-empty search terms
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle friend request
  const [sentRequests, setSentRequests] = useState([]);
  const [requestError, setRequestError] = useState(null);
  
  // Handle friend request
  const sendFriendRequest = async (userId) => {
    setSendingRequest(true);
    setRequestError(null);
    
    // Find user info for better toast messages
    const userInfo = searchResults.find(user => user.id === userId);
    
    try {
      await friendAPI.sendFriendRequest({ userId });
      
      // Update local state to show request was sent without closing modal
      setSentRequests([...sentRequests, userId]);
      
      // Update search results to reflect the sent request
      setSearchResults(
        searchResults.filter(user => user.id !== userId)
      );
      
      // Update pending requests list
      setPendingRequests([...pendingRequests, userId]);
      
      // Show success toast
      setToast({
        type: 'success',
        message: `Friend request sent to ${userInfo?.name || 'user'}!`,
      });
      
      // Notify parent component to refresh friend data
      if (typeof onFriendRequestSent === 'function') {
        onFriendRequestSent();
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setRequestError('Failed to send friend request. Please try again.');
      
      // Show error toast
      setToast({
        type: 'error',
        message: `Failed to send friend request to ${userInfo?.name || 'user'}. Please try again.`,
      });
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fadeIn transform transition-all duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center">
            Add Friend
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Icon name="X" size={18} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 modal-content-container overflow-y-auto flex-1">
          {/* Error notification */}
          {requestError && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center">
              <Icon name="AlertCircle" size={16} className="text-red-500 mr-2" />
              <span className="text-red-600 text-sm">{requestError}</span>
              <button 
                onClick={() => setRequestError(null)}
                className="ml-auto p-1 rounded-full hover:bg-red-100 text-red-500"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSearch} className="mb-5">
            <div className="mb-4">
              <label htmlFor="friendSearch" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <span>Search by email or username</span>
                <span className="ml-2 text-xs text-gray-500 font-normal">(Results update as you type)</span>
              </label>
              <div className="relative group">
                <input
                  id="friendSearch"
                  type="text"
                  placeholder="Start typing to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none transition-all shadow-sm hover:border-gray-400"
                  autoFocus
                />
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-mint-500 transition-colors"
                />
                {isLoading ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Icon name="Loader" size={16} className="text-mint-500 animate-spin" />
                  </div>
                ) : searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <Icon name="X" size={14} />
                  </button>
                )}
              </div>
            </div>
          </form>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Icon name="Search" size={16} className="text-mint-500 mr-2" />
                  {searchTerm ? `Results for "${searchTerm}"` : "Available Users"}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-md">
                  {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'} found
                </span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {searchResults.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-3.5 border border-gray-100 shadow-sm ring-2 ring-white">
                        <Image 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{user.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    {sentRequests.includes(user.id) || user.requestSent ? (
                      <span className="py-1.5 px-4 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center">
                        <Icon name="Check" size={14} className="text-mint-600 mr-1.5" />
                        Request Sent
                      </span>
                    ) : (
                      <button 
                        className="py-1.5 px-4 bg-mint-500 hover:bg-mint-600 active:bg-mint-700 text-white text-sm rounded-lg transition-all shadow-sm hover:shadow-md active:shadow-sm flex items-center"
                        onClick={() => sendFriendRequest(user.id)}
                        disabled={sendingRequest}
                      >
                        {sendingRequest ? (
                          <span className="flex items-center">
                            <Icon name="Loader" size={14} className="animate-spin mr-1.5" />
                            Sending
                          </span>
                        ) : (
                          <>
                            <Icon name="UserPlus" size={14} className="mr-1.5" />
                            Add Friend
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No suggested contacts - we only show search results */}
          
          {/* No results message when searching */}
          {searchTerm && searchResults.length === 0 && !isLoading && (
            <div className="text-center py-8 my-2 bg-gray-50 rounded-xl border border-gray-100">
              <Icon name="Search" size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No users found</p>
              <p className="text-gray-500 text-sm">Try a different search term</p>
            </div>
          )}
          
          {/* Loading message */}
          {isLoading && (
            <div className="text-center py-6 my-1">
              <Icon name="Loader" size={24} className="text-mint-500 mx-auto mb-2 animate-spin" />
              <p className="text-gray-600">Searching for users...</p>
            </div>
          )}
          
          {/* Empty state message when not searching */}
          {!searchTerm && searchResults.length === 0 && !isLoading && (
            <div className="text-center py-8 my-2 bg-gray-50 rounded-xl border border-gray-100">
              <Icon name="Users" size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">Start searching for users</p>
              <p className="text-gray-500 text-sm">Type a name or email to find users to add</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;