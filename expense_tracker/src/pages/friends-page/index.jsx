import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import { friendAPI } from "../../services/api";

import FriendCard from "./components/FriendCard";
import FriendRequestCard from "./components/FriendRequestCard";
import AddFriendModal from "./components/AddFriendModal";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({
    incoming: [],
    outgoing: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to reload all friend data
  const reloadData = async () => {
    setIsLoading(true);
    try {
      // Get friends
      const friendsResponse = await friendAPI.getFriends();
      const formattedFriends = friendsResponse.data.data.map(friend => ({
        id: friend._id,
        name: friend.name,
        avatar: friend.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`,
        email: friend.email,
        balance: 0,
        lastActivity: 'Recently',
        mutualFriends: 0,
      }));
      
      setFriends(formattedFriends);
      
      // Fetch incoming friend requests
      const incomingResponse = await friendAPI.getIncomingRequests();
      const incomingRequests = incomingResponse.data.data.map(request => ({
        id: request._id,
        userId: request.requester._id,
        name: request.requester.name,
        avatar: request.requester.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`,
        mutualFriends: 0,
        requestDate: new Date(request.createdAt).toLocaleDateString()
      }));
      
      // Fetch outgoing friend requests
      const outgoingResponse = await friendAPI.getOutgoingRequests();
      const outgoingRequests = outgoingResponse.data.data.map(request => ({
        id: request._id,
        userId: request.recipient._id,
        name: request.recipient.name,
        avatar: request.recipient.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`,
        mutualFriends: 0,
        requestDate: new Date(request.createdAt).toLocaleDateString()
      }));
      
      setFriendRequests({
        incoming: incomingRequests,
        outgoing: outgoingRequests
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching friend data:', err);
      setError('Failed to load friends. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch friends and friend requests from API
  useEffect(() => {
    reloadData();
  }, []);

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Friends</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your personal expense-sharing relationships</p>
      </div>

      {/* Search and Add Friend */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-mint-500 focus:border-mint-500 focus:ring-1 focus:outline-none transition-all shadow-sm"
          />
          <Icon
            name="Search"
            size={16}
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <button
          onClick={() => setIsAddFriendModalOpen(true)}
          className="flex items-center justify-center bg-mint-500 hover:bg-mint-600 active:bg-mint-700 text-white py-2.5 px-5 rounded-lg transition-all w-full md:w-auto shadow-sm"
        >
          <Icon name="UserPlus" size={16} />
          <span className="ml-2 font-medium">Add Friend</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap space-x-4 md:space-x-8">
          <button
            className={`pb-3 px-1 ${
              activeTab === "all" ? "border-b-2 border-mint-500 text-mint-500 font-medium" : "text-gray-500 hover:text-gray-700"
            } transition-all`}
            onClick={() => setActiveTab("all")}
          >
            All Friends
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
          </button>
          <button
            className={`pb-3 px-1 flex items-center ${
              activeTab === "incoming" ? "border-b-2 border-mint-500 text-mint-500 font-medium" : "text-gray-500 hover:text-gray-700"
            } transition-all`}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming Requests
            {friendRequests.incoming.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {friendRequests.incoming.length}
              </span>
            )}
          </button>
          <button
            className={`pb-3 px-1 flex items-center ${
              activeTab === "outgoing" ? "border-b-2 border-mint-500 text-mint-500 font-medium" : "text-gray-500 hover:text-gray-700"
            } transition-all`}
            onClick={() => setActiveTab("outgoing")}
          >
            Outgoing Requests
            {friendRequests.outgoing.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {friendRequests.outgoing.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <Icon name="Loader" size={28} className="animate-spin text-mint-500 mb-3" />
                  <span className="text-gray-600 text-sm">Loading friends...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <Icon name="AlertTriangle" size={36} className="mx-auto text-error mb-3" />
                <p className="text-gray-700 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-5 py-2 bg-mint-500 text-white text-sm font-medium rounded-lg hover:bg-mint-600 active:bg-mint-700 transition-all shadow-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {activeTab === "all" && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Friends</h2>
                    {filteredFriends.length > 0 ? (
                      <div className="space-y-4">
                        {filteredFriends.map((friend) => (
                          <FriendCard 
                            key={friend.id} 
                            friend={friend} 
                            onRefresh={reloadData}
                            onRemoveFriend={async (friendId) => {
                              try {
                                await friendAPI.removeFriend(friendId);
                                await reloadData();
                              } catch (err) {
                                console.error('Failed to remove friend:', err);
                                alert('Failed to remove friend. Please try again.');
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 my-4">
                        <Icon name="Users" size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-2">
                          {searchQuery ? "No friends match your search" : "You don't have any friends yet"}
                        </p>
                        {searchQuery ? (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-all"
                          >
                            Clear search
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAddFriendModalOpen(true)}
                            className="mt-2 py-1.5 px-3.5 bg-mint-500 hover:bg-mint-600 text-white text-sm rounded-lg transition-all shadow-sm"
                          >
                            <span className="flex items-center">
                              <Icon name="UserPlus" size={14} className="mr-1.5" />
                              Add your first friend
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
    
                {activeTab === "incoming" && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Incoming Friend Requests</h2>
                    {friendRequests.incoming.length > 0 ? (
                      <div className="space-y-4">
                        {friendRequests.incoming.map((request) => (
                          <FriendRequestCard 
                            key={request.id} 
                            request={request} 
                            type="incoming"
                            onAccept={async (requestId) => {
                              try {
                                await friendAPI.acceptFriendRequest(requestId);
                                reloadData();
                              } catch (err) {
                                console.error('Failed to accept friend request:', err);
                                alert('Failed to accept friend request. Please try again.');
                              }
                            }}
                            onDecline={async (requestId) => {
                              try {
                                await friendAPI.rejectFriendRequest(requestId);
                                await reloadData();
                              } catch (err) {
                                console.error('Failed to decline friend request:', err);
                                alert('Failed to decline friend request. Please try again.');
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 my-2">
                        <Icon name="UserCheck" size={34} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No incoming friend requests</p>
                        <button
                          onClick={() => setIsAddFriendModalOpen(true)}
                          className="mt-4 py-1.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-all"
                        >
                          <span className="flex items-center">
                            <Icon name="UserPlus" size={14} className="mr-1.5" />
                            Invite friends
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
    
                {activeTab === "outgoing" && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Outgoing Friend Requests</h2>
                    {friendRequests.outgoing.length > 0 ? (
                      <div className="space-y-4">
                        {friendRequests.outgoing.map((request) => (
                          <FriendRequestCard 
                            key={request.id} 
                            request={request} 
                            type="outgoing"
                            onCancel={async (requestId) => {
                              try {
                                await friendAPI.removeFriend(requestId);
                                await reloadData();
                              } catch (err) {
                                console.error('Failed to cancel friend request:', err);
                                alert('Failed to cancel friend request. Please try again.');
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 my-2">
                        <Icon name="UserPlus" size={34} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No outgoing friend requests</p>
                        <button
                          onClick={() => setIsAddFriendModalOpen(true)}
                          className="mt-4 py-1.5 px-3.5 bg-mint-50 hover:bg-mint-100 text-mint-600 text-sm rounded-lg transition-all"
                        >
                          <span className="flex items-center">
                            <Icon name="UserPlus" size={14} className="mr-1.5" />
                            Add new friends
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3.5">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setIsAddFriendModalOpen(true)}
                className="flex items-center justify-between w-full p-3 bg-mint-500 bg-opacity-10 rounded-lg hover:bg-opacity-15 active:bg-opacity-20 transition-all shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center">
                    <Icon name="UserPlus" size={14} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-800 text-sm">Add Friend</span>
                </div>
                <Icon name="ChevronRight" size={14} className="text-gray-500" />
              </button>
              
              <Link 
                to="/add-expense-page" 
                className="flex items-center justify-between p-3 bg-lavender-500 bg-opacity-10 rounded-lg hover:bg-opacity-15 active:bg-opacity-20 transition-all shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-lavender-500 flex items-center justify-center">
                    <Icon name="Plus" size={14} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-800 text-sm">Add Expense</span>
                </div>
                <Icon name="ChevronRight" size={14} className="text-gray-500" />
              </Link>
              
              <Link 
                to="/dashboard" 
                className="flex items-center justify-between p-3 bg-soft-blue-500 bg-opacity-10 rounded-lg hover:bg-opacity-15 active:bg-opacity-20 transition-all shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-soft-blue-500 flex items-center justify-center">
                    <Icon name="LayoutDashboard" size={14} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-800 text-sm">Dashboard</span>
                </div>
                <Icon name="ChevronRight" size={14} className="text-gray-500" />
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3.5">Friend Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Friends</span>
                <span className="font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">{friends.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Incoming Requests</span>
                <span className="font-medium bg-red-100 text-red-600 px-2.5 py-1 rounded-md">{friendRequests.incoming.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outgoing Requests</span>
                <span className="font-medium bg-mint-100 text-mint-600 px-2.5 py-1 rounded-md">{friendRequests.outgoing.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {isAddFriendModalOpen && (
        <AddFriendModal 
          onClose={() => setIsAddFriendModalOpen(false)}
          onFriendRequestSent={() => reloadData()}
        />
      )}
    </div>
  );
};

export default FriendsPage;