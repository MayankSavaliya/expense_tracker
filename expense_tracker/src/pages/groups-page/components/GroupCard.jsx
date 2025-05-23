import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const GroupCard = ({ group }) => {
  const { 
    id, 
    name, 
    icon, 
    iconBg, 
    totalExpenses, 
    yourBalance, 
    members, 
    lastActive, 
    description,
    isArchived
  } = group;
  
  // Format currency
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  }).format(yourBalance);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalExpenses);

  // Determine balance color
  const balanceColor = yourBalance > 0 
    ? "text-success" 
    : yourBalance < 0 
      ? "text-error" :"text-gray-600";

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100 h-full ${isArchived ? 'opacity-70' : ''}`}>
      <div className={`h-3 w-full ${iconBg}`}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center">
            <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center mr-4 shadow-sm`}>
              <Icon name={icon} size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
              {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {isArchived && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              <Icon name="Archive" size={12} className="mr-1" />
              Archived
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center p-4 mb-5 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">{formattedTotal}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Balance</p>
            <p className={`text-lg font-semibold ${balanceColor} mt-1`}>{formattedBalance}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex -space-x-3">
            {members.slice(0, 4).map((member) => (
              <div key={member.id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                <Image 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {members.length > 4 && (
              <div className="w-9 h-9 rounded-full bg-lavender-500 text-white border-2 border-white flex items-center justify-center text-xs font-medium shadow-sm">
                +{members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Icon name="Clock" size={12} className="inline mr-1" />
            {lastActive}
          </span>
        </div>
        
        <div className="flex space-x-3">
          <Link 
            to={`/group-details-page/${id}`} 
            className="flex-1 py-2.5 px-4 bg-lavender-500 bg-opacity-10 hover:bg-opacity-20 text-lavender-700 rounded-lg text-center text-sm font-medium transition-all border border-lavender-200 hover:border-lavender-500"
          >
            <Icon name="Eye" size={16} className="inline mr-1.5" />
            View Details
          </Link>
          <Link 
            to={`/add-expense-page?groupId=${id}`} 
            className="flex items-center justify-center py-2.5 px-4 bg-mint-500 text-white rounded-lg text-sm font-medium transition-all hover:bg-mint-700"
          >
            <Icon name="Plus" size={16} className="mr-1.5" />
            Add Expense
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;