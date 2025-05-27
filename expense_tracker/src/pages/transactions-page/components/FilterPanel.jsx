import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // Assuming useAuth provides the token
import axios from "axios";
import Icon from "../../../components/AppIcon";

const FilterPanel = ({ activeFilters, onFilterChange, onClose }) => {
  const { token } = useAuth(); // Get the auth token
  const [groups, setGroups] = useState([{ id: "all", name: "All Groups" }]);
  const [people, setPeople] = useState([{ id: "all", name: "All People" }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        setIsLoading(true);
        // Fetch groups
        try {
          const groupResponse = await axios.get("http://localhost:5000/api/groups/my-groups", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedGroups = groupResponse.data.data.map(group => ({ id: group._id, name: group.name }));
          setGroups([{ id: "all", name: "All Groups" }, ...fetchedGroups]);
        } catch (error) {
          console.error("Failed to fetch groups", error);
        }

        // Fetch friends (people)
        try {
          const peopleResponse = await axios.get("http://localhost:5000/api/users", { // Assuming this endpoint returns all users/friends
            headers: { Authorization: `Bearer ${token}` },
          });
          // Assuming the API returns an array of users under a 'data' or similar key
          // And each user object has _id and name properties
          const fetchedPeople = peopleResponse.data.data.map(user => ({ id: user._id, name: user.name }));
          setPeople([{ id: "all", name: "All People" }, ...fetchedPeople]);
        } catch (error) {
          console.error("Failed to fetch people", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [token]);

  // Mock data for filters - Date Ranges are kept as mock for now
  const dateRanges = [
    { id: "all", name: "All Time" },
    { id: "this-week", name: "This Week" },
    { id: "this-month", name: "This Month" },
    { id: "last-month", name: "Last Month" },
    { id: "last-3-months", name: "Last 3 Months" }
  ];

  const applyFilters = () => {
    if (onClose) {
      onClose();
    }
  };

  const resetFilters = () => {
    onFilterChange("dateRange", "all");
    onFilterChange("group", "all");
    onFilterChange("person", "all");
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-mint-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-b-2 border-l-2 border-mint-300 animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">Loading filter options...</p>
        </div>
      ) : (
        <>
          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-mint-100 flex items-center justify-center mr-2.5 shadow-sm">
                <Icon name="Calendar" size={16} className="text-mint-600" />
              </span>
              Date Range
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dateRanges.map((range) => (
                <label
                  key={range.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${
                    activeFilters.dateRange === range.id 
                      ? "border-mint-500 bg-mint-50 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="dateRange"
                    checked={activeFilters.dateRange === range.id}
                    onChange={() => onFilterChange("dateRange", range.id)}
                    className="text-mint-500 focus:ring-mint-500 focus:ring-2 focus:outline-none"
                  />
                  <span className={`text-sm ml-2.5 ${activeFilters.dateRange === range.id ? "font-medium text-mint-700" : "text-gray-700"}`}>
                    {range.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-lavender-100 flex items-center justify-center mr-2.5 shadow-sm">
                <Icon name="Users" size={16} className="text-lavender-600" />
              </span>
              Groups
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${
                    activeFilters.group === group.id 
                      ? "border-lavender-500 bg-lavender-50 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="group"
                    checked={activeFilters.group === group.id}
                    onChange={() => onFilterChange("group", group.id)}
                    className="text-lavender-500 focus:ring-lavender-500 focus:ring-2 focus:outline-none"
                  />
                  <span className={`text-sm ml-2.5 ${activeFilters.group === group.id ? "font-medium text-lavender-700" : "text-gray-700"}`}>
                    {group.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Person Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-soft-blue-100 flex items-center justify-center mr-2.5 shadow-sm">
                <Icon name="User" size={16} className="text-soft-blue-600" />
              </span>
              People
            </h4>
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 styled-scrollbar">
              {people.map((person) => (
                <label
                  key={person.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${
                    activeFilters.person === person.id 
                      ? "border-soft-blue-500 bg-soft-blue-50 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="person"
                    checked={activeFilters.person === person.id}
                    onChange={() => onFilterChange("person", person.id)}
                    className="text-soft-blue-500 focus:ring-soft-blue-500 focus:ring-2 focus:outline-none"
                  />
                  <span className={`text-sm ml-2.5 ${activeFilters.person === person.id ? "font-medium text-soft-blue-700" : "text-gray-700"}`}>
                    {person.name}
                  </span>
                </label>
              ))}
            </div>
          </div>


          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 flex space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 px-4 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-all shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;