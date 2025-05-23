import React from "react";
import { Link } from "react-router-dom";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const GroupCard = ({ group }) => {
  const { id, name, totalExpenses, yourBalance, members, lastActive, icon, iconBg } = group;
  
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

  // Determine balance color and background style
  const balanceColor = yourBalance > 0 
    ? "text-success" 
    : yourBalance < 0 
      ? "text-error" : "text-gray-600";
  return (
    <Link 
      to={`/group-details-page/${id}`} 
      className="block min-w-[320px] max-w-[320px] bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border border-gray-100"
    >
      <div className="p-6">
        <div className="flex items-center mb-5">
          {icon ? (
            <div className={`w-14 h-14 rounded-full ${iconBg || 'bg-gradient-to-br from-lavender-400 to-lavender-600'} flex items-center justify-center mr-4 shadow-md`}>
              <Icon name={icon} size={28} className="text-white" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-semibold text-lg">{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{name}</h3>
        </div>
        
        <div className="flex justify-between items-center mb-5 bg-gray-50 rounded-lg p-3.5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total</p>
            <p className="text-base font-medium mt-1">{formattedTotal}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Your Balance</p>
            <p className={`text-base font-bold mt-1 ${balanceColor}`}>{formattedBalance}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Members</p>
              <div className="flex -space-x-2.5">
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
                  <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                    +{members.length - 4}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-2 font-medium">Last Active</p>
              <span className="text-xs px-3 py-1.5 rounded-full bg-lavender-50 text-lavender-700 font-medium shadow-sm">{lastActive}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;