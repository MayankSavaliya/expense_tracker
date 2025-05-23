import React from "react";
import Icon from "../../../components/AppIcon";

const FilterBar = ({ 
  activeFilter, 
  setActiveFilter, 
  sortBy, 
  setSortBy, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeFilter === "all" 
                ? "bg-lavender-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name="Layers" size={16} className={`inline mr-1.5 ${activeFilter === "all" ? "text-white" : "text-gray-500"}`} />
            All Groups
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeFilter === "active" 
                ? "bg-mint-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name="Activity" size={16} className={`inline mr-1.5 ${activeFilter === "active" ? "text-white" : "text-gray-500"}`} />
            Active
          </button>
          <button
            onClick={() => setActiveFilter("archived")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeFilter === "archived" 
                ? "bg-gray-500 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name="Archive" size={16} className={`inline mr-1.5 ${activeFilter === "archived" ? "text-white" : "text-gray-500"}`} />
            Archived
          </button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full sm:w-72 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm transition-all"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 bg-transparent">
              <Icon name="Search" size={18} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-11 pr-10 py-2.5 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm transition-all"
            >
              <option value="recent">Sort by: Recent Activity</option>
              <option value="alphabetical">Sort by: Alphabetical</option>
              <option value="balance">Sort by: Balance Amount</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 bg-transparent">
              <Icon name="SortDesc" size={18} />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon name="ChevronDown" size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;