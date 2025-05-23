import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const DatePicker = ({ selectedDate, onChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handleQuickSelect = (option) => {
    const today = new Date();
    
    switch (option) {
      case 'today':
        onChange(today);
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        onChange(yesterday);
        break;
      default:
        break;
    }
    
    setShowCalendar(false);
  };
  
  const handleDateSelect = (e) => {
    onChange(new Date(e.target.value));
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <div className="flex items-center">
          <Icon name="Calendar" size={18} className="text-gray-500 mr-3" />
          <span>{formatDate(selectedDate)}</span>
        </div>
        <Icon name={showCalendar ? "ChevronUp" : "ChevronDown"} size={18} className="text-gray-500" />
      </div>
      
      {showCalendar && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('today')}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('yesterday')}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
              >
                Yesterday
              </button>
            </div>
          </div>
          
          <div className="p-3">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateSelect}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;