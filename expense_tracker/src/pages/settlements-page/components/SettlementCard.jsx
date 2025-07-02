import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const SettlementCard = ({ settlement, isSelected, onSelect, onSettle, formatCurrency, currentUserId }) => {
  const { payer, recipient, amount, group, simplification } = settlement;
  
  // Determine if current user is payer or recipient
  const isUserPayer = payer.id === currentUserId;
  
  return (
    <div className={`border rounded-lg transition-all ${isSelected ? 'border-mint-500 bg-mint-500 bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-5 w-5 rounded border-gray-300 text-mint-500 focus:ring-mint-500 focus:ring-2 focus:outline-none"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-3 md:mb-0">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={isUserPayer ? payer.avatar : recipient.avatar} 
                        alt={isUserPayer ? payer.name : recipient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Icon name="ArrowRight" size={16} className="mx-2 text-gray-400" />
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={isUserPayer ? recipient.avatar : payer.avatar} 
                        alt={isUserPayer ? recipient.name : payer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">
                      {isUserPayer ? (
                        <>You owe <span className="font-medium text-gray-800">{recipient.name}</span></>
                      ) : (
                        <><span className="font-medium text-gray-800">{payer.name}</span> owes you</>
                      )}
                    </p>
                    {group && (
                      <Link to={`/group-details-page?id=${group.id}`} className="text-xs text-mint-500 hover:text-mint-700">
                        {group.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-semibold ${isUserPayer ? 'text-error' : 'text-success'}`}>
                  {formatCurrency(amount)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-3 md:mb-0">
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="TrendingDown" size={16} className="text-soft-blue-500 mr-2" />
                  <span>{simplification}</span>
                </div>
              </div>
              
              <button
                onClick={onSettle}
                className="bg-mint-500 hover:bg-mint-700 text-white py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center"
              >
                <Icon name="CheckCircle" size={16} className="mr-2" />
                {isUserPayer ? "Pay" : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementCard;