import React, { useState, useEffect } from "react";

import Icon from "../../components/AppIcon";
import GroupCard from "./components/GroupCard";
import CreateGroupModal from "./components/CreateGroupModal";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const GroupsPage = () => {
  const { token } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create a separate function for fetching groups, so we can call it after creating a new group
  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/groups/my-groups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) { 
        const transformedGroups = response.data.data.map(group => ({
          id: group._id,
          name: group.name,
          // Use the group's icon and iconBg if provided, otherwise use defaults
          icon: group.icon || "Users",
          iconBg: group.iconBg || "bg-mint-500",
          totalExpenses: group.totalExpenses || 0,
          yourBalance: group.yourBalance,
          members: group.members.map(member => ({
            id: member._id,
            name: member.name,
            avatar: member.avatar
          })),
          lastActive: new Date(group.updatedAt || group.createdAt).toLocaleDateString(),
          description: group.description || "",
          isArchived: false // Default to false
        }));
        setGroups(transformedGroups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  // Filter groups based on active filter and search query
  const filteredGroups = groups.filter(group => {
    const matchesFilter = activeFilter === "all" || activeFilter === "active";
    const matchesSearch = 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort groups based on selected sort option
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "balance":
        return Math.abs(b.yourBalance) - Math.abs(a.yourBalance);
      case "recent":
      default:
        return a.id < b.id ? 1 : -1;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Icon name="Loader" className="animate-spin h-8 w-8 text-mint-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 bg-gradient-to-r from-lavender-200 to-mint-300 rounded-xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Groups</h1>
            <p className="text-gray-700 mt-1">Manage your expense sharing groups with friends and family</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center px-5 py-2.5 bg-lavender-500 hover:bg-lavender-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-opacity-50"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Create Group
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Groups Grid */}
      {sortedGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {sortedGroups.map((group, index) => (
            <div key={group.id} className="transform transition-all duration-300 hover:-translate-y-2" 
                 style={{ animationDelay: `${index * 0.1}s` }}>
              <GroupCard group={group} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 animate-fade-in">
          <EmptyState 
            onCreateGroup={() => setIsCreateModalOpen(true)} 
            isFiltered={searchQuery !== "" || activeFilter !== "all"}
            onClearFilters={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}
          />
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <CreateGroupModal 
          isOpen={isCreateModalOpen} 
          onClose={(shouldRefresh) => {
            setIsCreateModalOpen(false);
            if (shouldRefresh) {
              fetchGroups();
            }
          }} 
        />
      )}
    </div>
  );
};

export default GroupsPage;