import React from "react";
import Icon from "../../../components/AppIcon";

const SummaryCard = ({ title, amount, icon, colorClass, bgColorClass, isPositive = false }) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl transform hover:-translate-y-1.5 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <div className={`w-14 h-14 rounded-full ${bgColorClass} shadow flex items-center justify-center`}>
          <Icon name={icon} size={24} className={colorClass} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${isPositive ? 'text-success' : title === 'You Owe' ? 'text-error' : 'text-gray-800'}`}>
        {formattedAmount}
      </p>
      <div className="mt-4 flex items-center bg-gray-50 px-4 py-2.5 rounded-lg">
        <Icon 
          name={isPositive ? "TrendingUp" : "TrendingDown"} 
          size={18} 
          className={isPositive ? "text-success" : "text-error"} 
        />
        <span className={`ml-2 text-sm font-medium ${isPositive ? "text-success" : "text-error"}`}>
          {isPositive ? "Positive" : "Negative"} balance
        </span>
      </div>
    </div>
  );
};

export default SummaryCard;