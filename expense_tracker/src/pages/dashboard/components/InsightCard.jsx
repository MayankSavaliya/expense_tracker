import React from "react";
import Icon from "../../../components/AppIcon";

const InsightCard = ({ insight }) => {
  // Determine color based on insight type
  let iconColor, bgColor;
  switch (insight.icon) {
    case "TrendingUp":
      iconColor = "text-mint-500";
      bgColor = "bg-mint-500 bg-opacity-10";
      break;
    case "Users":
      iconColor = "text-lavender-500";
      bgColor = "bg-lavender-500 bg-opacity-10";
      break;
    case "Lightbulb":
      iconColor = "text-warning";
      bgColor = "bg-warning bg-opacity-10";
      break;
    default:
      iconColor = "text-soft-blue-500";
      bgColor = "bg-soft-blue-500 bg-opacity-10";
  }

  return (
    <div className="flex items-start p-4.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer bg-white transform hover:-translate-y-0.5 hover:bg-gray-50">
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mr-4 shadow-sm`}>
        <Icon name={insight.icon} size={20} className={iconColor} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1.5">{insight.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
      </div>
    </div>
  );
};

export default InsightCard;