import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const DateRangePicker = ({ onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange("custom");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <Icon name="Calendar" size={16} className="mr-2" />
        <span>Custom Range</span>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm rounded-md bg-mint-500 text-white hover:bg-mint-700"
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;