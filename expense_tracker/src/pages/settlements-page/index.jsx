import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { transactionAPI, settlementAPI } from "../../services/api";

import Icon from "../../components/AppIcon";

import SettlementCard from "./components/SettlementCard";
import SettlementHistoryItem from "./components/SettlementHistoryItem";
import SettlementMethodModal from "./components/SettlementMethodModal";
import FilterBar from "./components/FilterBar";

const SettlementsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("suggested");
  const [selectedSettlements, setSelectedSettlements] = useState([]);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [currentSettlement, setCurrentSettlement] = useState(null);
  const [filterGroup, setFilterGroup] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [suggestedSettlements, setSuggestedSettlements] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0); // Trigger for refreshing history

  // Fetch settlement suggestions from backend
  useEffect(() => {
    const fetchSettlementSuggestions = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await transactionAPI.getSettlementSuggestions(user._id);
        
        if (response.data.success) {
          // Transform the data to match our component structure
          const transformedSuggestions = response.data.data.suggestions.map(suggestion => ({
            id: suggestion.id,
            transactionId: suggestion.transactionId,
            payer: {
              id: suggestion.from.id,
              name: suggestion.from.name,
              avatar: suggestion.from.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`
            },
            recipient: {
              id: suggestion.to.id,
              name: suggestion.to.name,
              avatar: suggestion.to.avatar || `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 99)}.jpg`
            },
            amount: suggestion.amount,
            type: suggestion.type,
            group: suggestion.groupId ? {
              id: suggestion.groupId,
              name: suggestion.groupName,
              avatar: suggestion.groupAvatar
            } : null,
            simplification: suggestion.description,
            date: new Date()
          }));
          
          setSuggestedSettlements(transformedSuggestions);
        }
      } catch (error) {
        console.error('Error fetching settlement suggestions:', error);
        setError('Failed to load settlement suggestions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettlementSuggestions();
  }, [user?._id]);

  // Fetch settlement history from backend
  useEffect(() => {
    const fetchSettlementHistory = async () => {
      if (!user?._id) return;
      
      try {
        const response = await settlementAPI.getAllSettlements();
        
        if (response.data && response.data.success && response.data.data) {
          // Transform the settlement data to match our component structure
          const transformedHistory = response.data.data.map(settlement => ({
            id: settlement._id,
            payer: {
              id: settlement.fromUser._id,
              name: settlement.fromUser.name,
              avatar: settlement.fromUser.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`
            },
            recipient: {
              id: settlement.toUser._id,
              name: settlement.toUser.name,
              avatar: settlement.toUser.avatar || `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 99)}.jpg`
            },
            amount: settlement.amount,
            group: settlement.group ? {
              id: settlement.group._id,
              name: settlement.group.name
            } : null,
            status: "completed", // All settlements in the database are completed
            method: settlement.method || "cash",
            date: new Date(settlement.createdAt),
            notes: settlement.notes || settlement.description
          }));
          
          setSettlementHistory(transformedHistory);
        }
      } catch (error) {
        console.error('Error fetching settlement history:', error);
        // If error, keep using empty array - don't show error to user for history
        setSettlementHistory([]);
      }
    };

    fetchSettlementHistory();
  }, [user?._id, refreshHistory]); // Refresh when user changes or after new settlement

  // Filter settlements based on selected group
  const filteredHistory = settlementHistory.filter(settlement => {
    if (filterGroup === "all") return true;
    return settlement.group?.id?.toString() === filterGroup;
  });

  // Handle settlement selection
  const toggleSettlementSelection = (id) => {
    if (selectedSettlements.includes(id)) {
      setSelectedSettlements(selectedSettlements.filter(settlementId => settlementId !== id));
    } else {
      setSelectedSettlements([...selectedSettlements, id]);
    }
  };

  // Handle settle button click
  const handleSettleClick = (settlement) => {
    setCurrentSettlement(settlement);
    setShowSettlementModal(true);
  };

  // Handle settle all button click
  const handleSettleAll = () => {
    // If there are selected settlements, settle those
    // Otherwise, show modal for the first suggested settlement
    if (selectedSettlements.length > 0) {
      const firstSelected = suggestedSettlements.find(s => s.id === selectedSettlements[0]);
      setCurrentSettlement(firstSelected);
    } else if (suggestedSettlements.length > 0) {
      setCurrentSettlement(suggestedSettlements[0]);
    }
    setShowSettlementModal(true);
  };

  // Handle settlement confirmation
  const handleSettlementConfirm = async (settlementData) => {
    try {
      if (currentSettlement.type === 'group') {
        // Group settlement
        await transactionAPI.createGroupSettlement({
          groupId: currentSettlement.group.id,
          toUserId: currentSettlement.recipient.id,
          amount: currentSettlement.amount,
          method: settlementData.method,
          notes: settlementData.notes || ''
        });
      } else {
        // Personal settlement
        await transactionAPI.createSettlement({
          fromUserId: currentSettlement.payer.id,
          toUserId: currentSettlement.recipient.id,
          amount: currentSettlement.amount,
          method: settlementData.method,
          notes: settlementData.notes || ''
        });
      }

      // Remove the settled item from suggestions
      setSuggestedSettlements(prev => prev.filter(s => s.id !== currentSettlement.id));
      setSelectedSettlements(prev => prev.filter(id => id !== currentSettlement.id));
      
      // Show success message
      alert(`Successfully settled with ${currentSettlement.recipient.id === user._id ? currentSettlement.payer.name : currentSettlement.recipient.name}!`);
      
      // Close modal
      setShowSettlementModal(false);
      setCurrentSettlement(null);
      
      // Trigger refresh of settlement history
      setRefreshHistory(prev => prev + 1);
      
      // Refresh suggestions
      const response = await transactionAPI.getSettlementSuggestions(user._id);
      if (response.data.success) {
        const transformedSuggestions = response.data.data.suggestions.map(suggestion => ({
          id: suggestion.id,
          transactionId: suggestion.transactionId,
          payer: {
            id: suggestion.from.id,
            name: suggestion.from.name,
            avatar: suggestion.from.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`
          },
          recipient: {
            id: suggestion.to.id,
            name: suggestion.to.name,
            avatar: suggestion.to.avatar || `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 99)}.jpg`
          },
          amount: suggestion.amount,
          type: suggestion.type,
          group: suggestion.groupId ? {
            id: suggestion.groupId,
            name: suggestion.groupName,
            avatar: suggestion.groupAvatar
          } : null,
          simplification: suggestion.description,
          date: new Date()
        }));
        
        setSuggestedSettlements(transformedSuggestions);
      }
    } catch (error) {
      console.error('Error creating settlement:', error);
      alert('Failed to create settlement. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total amount to settle
  const totalToSettle = suggestedSettlements.reduce((sum, settlement) => {
    if (!user?._id) return sum;
    
    if (settlement.recipient.id === user._id) {
      return sum + settlement.amount;
    } else if (settlement.payer.id === user._id) {
      return sum - settlement.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settlements</h1>
        <p className="text-gray-600">Manage and track all your expense settlements</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Settlement Summary</h2>
            <p className="text-gray-600 mb-4 md:mb-0">
              {totalToSettle > 0 ? (
                <span>You are owed <span className="font-medium text-success">{formatCurrency(totalToSettle)}</span> in total</span>
              ) : totalToSettle < 0 ? (
                <span>You owe <span className="font-medium text-error">{formatCurrency(Math.abs(totalToSettle))}</span> in total</span>
              ) : (
                <span>You're all settled up!</span>
              )}
            </p>
          </div>
          <button 
            onClick={handleSettleAll}
            className="bg-mint-500 hover:bg-mint-700 text-white py-3 px-6 rounded-md transition-colors flex items-center justify-center"
            disabled={suggestedSettlements.length === 0}
          >
            <Icon name="CheckCircle" size={18} className="mr-2" />
            Settle All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "suggested" ?"border-b-2 border-mint-500 text-mint-700" :"text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("suggested")}
            >
              Suggested Settlements
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "history" ?"border-b-2 border-mint-500 text-mint-700" :"text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Settlement History
            </button>
          </div>
        </div>

        {/* Filter Bar - Only show for history tab */}
        {activeTab === "history" && (
          <FilterBar 
            filterGroup={filterGroup}
            setFilterGroup={setFilterGroup}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "suggested" ? (
            <>
              {/* Batch Actions */}
              {selectedSettlements.length > 0 && (
                <div className="bg-gray-50 rounded-md p-4 mb-6 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{selectedSettlements.length}</span> settlements selected
                  </span>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedSettlements([])}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleSettleAll}
                      className="bg-mint-500 hover:bg-mint-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                    >
                      Settle Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Loader" size={24} className="text-gray-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Loading Settlements...</h3>
                  <p className="text-gray-600">Please wait while we fetch your settlement suggestions.</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="AlertTriangle" size={24} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Settlements</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-mint-500 hover:bg-mint-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : suggestedSettlements.length > 0 ? (
                <div className="space-y-4">
                  {suggestedSettlements.map((settlement) => (
                    <SettlementCard 
                      key={settlement.id}
                      settlement={settlement}
                      isSelected={selectedSettlements.includes(settlement.id)}
                      onSelect={() => toggleSettlementSelection(settlement.id)}
                      onSettle={() => handleSettleClick(settlement)}
                      formatCurrency={formatCurrency}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Check" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">All Settled Up!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any pending settlements at the moment. When you do, they'll appear here.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Settlement History List */}
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((settlement) => (
                    <SettlementHistoryItem 
                      key={settlement.id}
                      settlement={settlement}
                      formatCurrency={formatCurrency}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="History" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Settlement History</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any settlement history matching your filters. Try changing your filter criteria or settle some expenses.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Settlement Method Modal */}
      {showSettlementModal && currentSettlement && (
        <SettlementMethodModal 
          settlement={currentSettlement}
          onClose={() => {
            setShowSettlementModal(false);
            setCurrentSettlement(null);
          }}
          onConfirm={handleSettlementConfirm}
          formatCurrency={formatCurrency}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
};

export default SettlementsPage;