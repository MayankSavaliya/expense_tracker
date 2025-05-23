import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const SplitMethodSelector = ({ 
  splitMethod, 
  onChange, 
  participants, 
  onParticipantsChange, 
  amount,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState(splitMethod);
  
  useEffect(() => {
    setActiveTab(splitMethod);
  }, [splitMethod]);
  
  const handleTabChange = (method) => {
    setActiveTab(method);
    onChange(method);
    
    let updatedParticipants = [...participants];
    const includedParticipants = updatedParticipants.filter(p => p.isIncluded);
    
    if (method === "equal" && includedParticipants.length > 0) {
      const equalShare = amount / includedParticipants.length;
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        share: p.isIncluded ? equalShare : 0
      }));
    } else if (method === "percentage" && includedParticipants.length > 0) {
      const equalPercent = 100 / includedParticipants.length;
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        share: p.isIncluded ? equalPercent : 0,
        percentShare: p.isIncluded ? equalPercent : 0
      }));
    }
    
    onParticipantsChange(updatedParticipants);
  };
  
  const handleParticipantToggle = (participantUserId) => {
    // Skip if participantUserId is undefined
    if (!participantUserId) return;
    
    const updatedParticipants = participants.map(p => 
      p.user && p.user._id === participantUserId ? { ...p, isIncluded: !p.isIncluded } : p
    );
    
    // Recalculate shares based on the current split method
    const includedParticipants = updatedParticipants.filter(p => p.isIncluded);
    
    if (activeTab === "equal" && includedParticipants.length > 0) {
      const equalShare = amount / includedParticipants.length;
      updatedParticipants.forEach(p => {
        if (p.isIncluded) {
          p.share = equalShare;
        } else {
          p.share = 0;
        }
      });
    } else if (activeTab === "percentage" && includedParticipants.length > 0) {
      // Redistribute percentages
      const totalPercent = updatedParticipants.reduce((sum, p) => sum + (p.isIncluded ? (p.percentShare || 0) : 0), 0);
      
      if (totalPercent !== 100) {
        const equalPercent = 100 / includedParticipants.length;
        updatedParticipants.forEach(p => {
          if (p.isIncluded) {
            p.percentShare = equalPercent;
            p.share = (equalPercent / 100) * amount;
          } else {
            p.percentShare = 0;
            p.share = 0;
          }
        });
      }
    }
    
    onParticipantsChange(updatedParticipants);
  };
  
  const handleShareChange = (participantUserId, value) => {
    // Skip if participantUserId is undefined
    if (!participantUserId) return;
    
    const updatedParticipants = [...participants];
    
    if (activeTab === "exact") {
      // Update exact amount
      updatedParticipants.forEach(p => {
        if (p.user && p.user._id === participantUserId) {
          p.share = parseFloat(value) || 0;
        }
      });
    } else if (activeTab === "percentage") {
      // Update percentage and calculate corresponding amount
      updatedParticipants.forEach(p => {
        if (p.user && p.user._id === participantUserId) {
          p.percentShare = parseFloat(value) || 0;
          p.share = ((parseFloat(value) || 0) / 100) * amount;
        }
      });
    }
    
    onParticipantsChange(updatedParticipants);
  };
  
  const totalShares = participants.reduce((sum, p) => sum + (p.share || 0), 0);
  const totalPercent = participants.reduce((sum, p) => sum + (p.percentShare || 0), 0);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].substring(0, 1).toUpperCase() + names[names.length - 1].substring(0, 1).toUpperCase();
  };
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "equal" ?"bg-mint-500 bg-opacity-10 text-mint-700 border-b-2 border-mint-500" :"bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => handleTabChange("equal")}
        >
          <div className="flex items-center justify-center">
            <Icon name="SplitSquareHorizontal" size={16} className="mr-2" />
            <span>Equal</span>
          </div>
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "exact" ?"bg-mint-500 bg-opacity-10 text-mint-700 border-b-2 border-mint-500" :"bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => handleTabChange("exact")}
        >
          <div className="flex items-center justify-center">
            <Icon name="DollarSign" size={16} className="mr-2" />
            <span>Exact</span>
          </div>
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "percentage" ?"bg-mint-500 bg-opacity-10 text-mint-700 border-b-2 border-mint-500" :"bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => handleTabChange("percentage")}
        >
          <div className="flex items-center justify-center">
            <Icon name="Percent" size={16} className="mr-2" />
            <span>Percent</span>
          </div>
        </button>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {participants.map((participant) => {
            if (!participant || !participant.user) {
              return null;
            }
            
            const isCurrentUserParticipant = currentUser && currentUser._id === participant.user._id;
            const participantName = participant.user.name || "Unknown User";

            return (
              <div key={participant.user._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`participant-${participant.user._id}`}
                    checked={participant.isIncluded || false}
                    onChange={() => handleParticipantToggle(participant.user._id)}
                    className="h-4 w-4 text-mint-500 border-gray-300 rounded focus:ring-mint-500"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      {participant.user.avatar && participant.user.avatar !== 'default_avatar_url' ? (
                        <Image
                          src={participant.user.avatar}
                          alt={participantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{getInitials(participant.user.name)}</span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{participantName}</span>
                  </div>
                </div>
                
                {participant.isIncluded && (
                  <div className="w-32">
                    {activeTab === "equal" ? (
                      <div className="text-right font-medium">
                        ${(amount / participants.filter(p => p.isIncluded).length).toFixed(2)}
                      </div>
                    ) : activeTab === "exact" ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={participant.share || ""}
                          onChange={(e) => handleShareChange(participant.user._id, e.target.value)}
                          className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none text-sm"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={participant.percentShare || ""}
                          onChange={(e) => handleShareChange(participant.user._id, e.target.value)}
                          className="w-full pr-7 py-1 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none text-sm"
                          placeholder="0"
                          step="1"
                          min="0"
                          max="100"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <div className="text-right">
              <span className="font-medium text-gray-900">
                ${totalShares.toFixed(2)}
              </span>
              {activeTab === "percentage" && (
                <span className="text-sm text-gray-500 ml-2">
                  ({totalPercent.toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
          
          {activeTab === "exact" && Math.abs(totalShares - amount) > 0.01 && (
            <div className="mt-1 text-xs text-error">
              Total shares must equal the expense amount (${amount.toFixed(2)})
            </div>
          )}
          
          {activeTab === "percentage" && Math.abs(totalPercent - 100) > 0.01 && (
            <div className="mt-1 text-xs text-error">
              Total percentage must equal 100%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitMethodSelector;