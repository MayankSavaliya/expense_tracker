import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const SettlementHistoryItem = ({ settlement, formatCurrency, currentUserId }) => {
  const [expanded, setExpanded] = useState(false);
  const { payer, recipient, amount, group, status, method, date, notes } = settlement;
  
  // Determine if current user is payer or recipient
  const isUserPayer = currentUserId && payer?.id === currentUserId;
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
  
  // Get relative time (e.g., "2 days ago")
  const getRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    const diffInDays = Math.round((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays < -1 && diffInDays > -7) return rtf.format(diffInDays, 'day');
    return formattedDate;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      <div className="p-4">
        {/* Header with time and expand button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-mint-500 bg-opacity-10 flex items-center justify-center">
              <Icon name="DollarSign" size={14} className="text-mint-600" />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">{getRelativeTime(date)}</span>
              <span className="mx-1 text-gray-400">•</span>
              <span className="text-xs text-gray-500">{formattedTime}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success bg-opacity-10 text-success">
              <Icon name="Check" size={10} className="mr-1" />
              Completed
            </span>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex items-center justify-between">
          {/* Left side - People */}
          <div className="flex items-center">
            <div className="flex -space-x-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-mint-50">
                <Image 
                  src={payer?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'} 
                  alt={payer?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white z-10 flex items-center justify-center">
                <Icon name="ArrowRight" size={16} className="text-mint-500" />
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-mint-50">
                <Image 
                  src={recipient?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                  alt={recipient?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                <span>{payer?.name || 'User'}</span>
                <span className="mx-1 text-gray-400">→</span>
                <span>{recipient?.name || 'User'}</span>
              </p>
              <div className="mt-0.5">
                {group ? (
                  <Link to={`/group-details-page?id=${group.id}`} className="text-xs text-mint-600 hover:text-mint-700 flex items-center">
                    <Icon name="Users" size={10} className="mr-1" />
                    {group.name}
                  </Link>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Icon name="User" size={10} className="mr-1" />
                    Personal settlement
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Amount */}
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(amount)}
            </p>
            <p className="text-xs text-gray-500">
              via {method || 'Cash'}
            </p>
          </div>
        </div>
        
        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Details cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Method Card */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <Icon name="CreditCard" size={12} className="text-gray-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">PAYMENT METHOD</p>
                </div>
                <p className="text-sm font-medium text-gray-800">{method || 'Cash'}</p>
              </div>
              
              {/* Notes Card - only show if notes exist */}
              {notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      <Icon name="MessageSquare" size={12} className="text-gray-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">NOTES</p>
                  </div>
                  <p className="text-sm text-gray-800">{notes}</p>
                </div>
              )}
            </div>
            
            {/* Action buttons with modern styling */}
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center transition-colors">
                <Icon name="FileText" size={14} className="mr-1.5" />
                Receipt
              </button>
              {new Date() - date < 86400000 * 2 && ( // Only show revoke option for settlements less than 2 days old
                <button className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center transition-colors">
                  <Icon name="XCircle" size={14} className="mr-1.5" />
                  Revoke
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementHistoryItem;