import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const SettlementHistoryItem = ({ settlement, formatCurrency }) => {
  const [expanded, setExpanded] = useState(false);
  const { payer, recipient, amount, group, status, method, date, notes } = settlement;
  
  // Determine if current user is payer or recipient
  const isUserPayer = payer.id === 1; // Assuming user ID is 1
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
  
  // Status badge styling
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success bg-opacity-10 text-success">
            <Icon name="Check" size={12} className="mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning bg-opacity-10 text-warning">
            <Icon name="Clock" size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error bg-opacity-10 text-error">
            <Icon name="X" size={12} className="mr-1" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image 
                  src={payer.avatar} 
                  alt={payer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Icon name="ArrowRight" size={16} className="mx-2 text-gray-400" />
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image 
                  src={recipient.avatar} 
                  alt={recipient.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">{payer.name}</span> paid{' '}
                <span className="font-medium text-gray-800">{recipient.name}</span>
              </p>
              <div className="flex items-center mt-1">
                <Link to={`/group-details-page?id=${group.id}`} className="text-xs text-mint-500 hover:text-mint-700 mr-2">
                  {group.name}
                </Link>
                <span className="text-xs text-gray-500">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {formatCurrency(amount)}
            </p>
            <div className="flex items-center">
              {getStatusBadge()}
              <button 
                onClick={() => setExpanded(!expanded)}
                className="ml-3 text-gray-400 hover:text-gray-600"
              >
                <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm font-medium text-gray-800">{method}</p>
              </div>
              {notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-800">{notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center">
                <Icon name="FileText" size={16} className="mr-1" />
                Generate Receipt
              </button>
              {status !== 'revoked' && new Date() - date < 86400000 * 2 && ( // Only show revoke option for settlements less than 2 days old
                <button className="text-error hover:text-error text-sm flex items-center">
                  <Icon name="XCircle" size={16} className="mr-1" />
                  Revoke Settlement
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