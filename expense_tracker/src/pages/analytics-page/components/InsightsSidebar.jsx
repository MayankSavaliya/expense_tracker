import React from "react";
import Icon from "../../../components/AppIcon";

const InsightsSidebar = () => {
  // Mock data for insights
  const insights = [
    {
      id: 1,
      title: "Spending Pattern",
      description: "Your highest expenses are on weekends, mostly on dining and entertainment.",
      icon: "TrendingUp",
      color: "mint"
    },
    {
      id: 2,
      title: "Unusual Expense",
      description: "Your utility bill this month is 15% higher than your 3-month average.",
      icon: "AlertTriangle",
      color: "warning"
    },
    {
      id: 3,
      title: "Potential Savings",
      description: "You could save $120/month by reducing food delivery expenses.",
      icon: "PiggyBank",
      color: "success"
    },
    {
      id: 4,
      title: "Category Growth",
      description: "Your entertainment spending has increased by 22% compared to last month.",
      icon: "BarChart2",
      color: "lavender"
    },
    {
      id: 5,
      title: "Group Expense Insight",
      description: "In \'Roommates\' group, you\'ve contributed 5% more than the group average.",
      icon: "Users",
      color: "soft-blue"
    }
  ];

  // Helper function to get color classes based on insight type
  const getColorClasses = (color) => {
    switch (color) {
      case "mint":
        return {
          bg: "bg-mint-500 bg-opacity-10",
          text: "text-mint-500",
          iconBg: "bg-mint-500"
        };
      case "warning":
        return {
          bg: "bg-warning bg-opacity-10",
          text: "text-warning",
          iconBg: "bg-warning"
        };
      case "success":
        return {
          bg: "bg-success bg-opacity-10",
          text: "text-success",
          iconBg: "bg-success"
        };
      case "lavender":
        return {
          bg: "bg-lavender-500 bg-opacity-10",
          text: "text-lavender-500",
          iconBg: "bg-lavender-500"
        };
      case "soft-blue":
        return {
          bg: "bg-soft-blue-500 bg-opacity-10",
          text: "text-soft-blue-500",
          iconBg: "bg-soft-blue-500"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          iconBg: "bg-gray-500"
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Insights</h2>
      <div className="space-y-4">
        {insights.map((insight) => {
          const colorClasses = getColorClasses(insight.color);
          
          return (
            <div 
              key={insight.id} 
              className={`p-4 rounded-md ${colorClasses.bg} hover:bg-opacity-20 transition-colors`}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full ${colorClasses.iconBg} flex items-center justify-center mr-3`}>
                  <Icon name={insight.icon} size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="font-medium text-gray-800 mb-3">Recommendations</h3>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-600">
            <Icon name="Check" size={16} className="text-success mr-2" />
            Set a monthly budget for each category
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <Icon name="Check" size={16} className="text-success mr-2" />
            Schedule regular expense reviews
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <Icon name="Check" size={16} className="text-success mr-2" />
            Settle outstanding balances with Emily
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InsightsSidebar;