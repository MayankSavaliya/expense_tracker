import React, { useState } from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const FriendRequestCard = ({ request, type, onAccept, onDecline, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept(request.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await onDecline(request.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
      <div className="flex items-center">
        <div className="w-11 h-11 rounded-full overflow-hidden mr-3.5 border border-gray-100 shadow-sm">
          <Image 
            src={request.avatar} 
            alt={request.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-base">{request.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {request.mutualFriends} mutual {request.mutualFriends === 1 ? 'friend' : 'friends'} • {request.requestDate}
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center text-gray-500 bg-gray-50 py-1.5 px-3 rounded-lg">
          <Icon name="Loader" size={16} className="animate-spin mr-2" />
          <span className="text-sm">Processing...</span>
        </div>
      ) : type === "incoming" ? (
        <div className="flex space-x-2">
          <button 
            className="py-1.5 px-4 bg-mint-500 hover:bg-mint-600 active:bg-mint-700 text-white text-sm rounded-lg transition-all shadow-sm"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button 
            className="py-1.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 text-sm rounded-lg transition-all shadow-sm"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      ) : (
        <div className="flex">
          <button 
            className="py-1.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 text-sm rounded-lg transition-all shadow-sm"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendRequestCard;