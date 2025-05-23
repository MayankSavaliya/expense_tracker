import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const NotificationGroup = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="notification-group">
      <div 
        className="px-4 py-2 bg-gray-50 flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <button className="p-1 rounded-full hover:bg-gray-200 transition-colors">
          <Icon 
            name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
            size={16} 
            className="text-gray-500"
          />
        </button>
      </div>
      {!isCollapsed && (
        <div className="divide-y divide-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default NotificationGroup;