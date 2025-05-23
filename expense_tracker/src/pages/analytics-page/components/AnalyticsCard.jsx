import React from "react";

const AnalyticsCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default AnalyticsCard;