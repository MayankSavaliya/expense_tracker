import React from "react";
import Icon from "../../../components/AppIcon";

const FilterBar = ({ filterGroup, setFilterGroup, dateRange, setDateRange }) => {
  // Mock data for groups
  const groups = [
    { id: "all", name: "All Groups" },
    { id: "1", name: "Roommates" },
    { id: "2", name: "Weekend Trip" },
    { id: "3", name: "Lunch Club" },
    { id: "4", name: "Office Party" }
  ];

  // Handle date range change
  const handleDateChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex items-center">
          <label htmlFor="group-filter" className="text-sm text-gray-600 mr-2">
            Filter by:
          </label>
          <select
            id="group-filter"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <label htmlFor="date-from" className="text-sm text-gray-600 mr-2">
              From:
            </label>
            <input
              id="date-from"
              type="date"
              value={dateRange.start || ""}
              onChange={(e) => handleDateChange(e, "start")}
              className="rounded-md border-gray-300 text-sm focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="date-to" className="text-sm text-gray-600 mr-2">
              To:
            </label>
            <input
              id="date-to"
              type="date"
              value={dateRange.end || ""}
              onChange={(e) => handleDateChange(e, "end")}
              className="rounded-md border-gray-300 text-sm focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setDateRange({ start: null, end: null })}
            className="text-gray-500 hover:text-gray-700"
            title="Clear date filters"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;