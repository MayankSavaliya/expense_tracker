import React, { useState } from "react";

import Icon from "../../components/AppIcon";

import SettlementCard from "./components/SettlementCard";
import SettlementHistoryItem from "./components/SettlementHistoryItem";
import SettlementMethodModal from "./components/SettlementMethodModal";
import FilterBar from "./components/FilterBar";

const SettlementsPage = () => {
  const [activeTab, setActiveTab] = useState("suggested");
  const [selectedSettlements, setSelectedSettlements] = useState([]);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [currentSettlement, setCurrentSettlement] = useState(null);
  const [filterGroup, setFilterGroup] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Mock data for suggested settlements
  const suggestedSettlements = [
    {
      id: 1,
      payer: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      recipient: {
        id: 2,
        name: "Emily Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      amount: 125.75,
      group: {
        id: 1,
        name: "Roommates"
      },
      simplification: "This payment will clear 3 separate debts",
      date: new Date()
    },
    {
      id: 2,
      payer: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      recipient: {
        id: 4,
        name: "Sarah Wilson",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
      },
      amount: 85.50,
      group: {
        id: 2,
        name: "Weekend Trip"
      },
      simplification: "This payment will clear your debt to Sarah",
      date: new Date()
    },
    {
      id: 3,
      payer: {
        id: 5,
        name: "David Lee",
        avatar: "https://randomuser.me/api/portraits/men/86.jpg"
      },
      recipient: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      amount: 45.00,
      group: {
        id: 1,
        name: "Roommates"
      },
      simplification: "You\'ll receive this payment from David",
      date: new Date()
    }
  ];

  // Mock data for settlement history
  const settlementHistory = [
    {
      id: 101,
      payer: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      recipient: {
        id: 3,
        name: "Michael Brown",
        avatar: "https://randomuser.me/api/portraits/men/59.jpg"
      },
      amount: 450.00,
      group: {
        id: 1,
        name: "Roommates"
      },
      status: "completed",
      method: "Bank Transfer",
      date: new Date(Date.now() - 86400000), // Yesterday
      notes: "Rent payment for May"
    },
    {
      id: 102,
      payer: {
        id: 6,
        name: "Jessica Taylor",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg"
      },
      recipient: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      amount: 95.30,
      group: {
        id: 2,
        name: "Weekend Trip"
      },
      status: "completed",
      method: "Cash",
      date: new Date(Date.now() - 172800000), // 2 days ago
      notes: "Hotel expenses"
    },
    {
      id: 103,
      payer: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      recipient: {
        id: 4,
        name: "Sarah Wilson",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
      },
      amount: 35.25,
      group: {
        id: 2,
        name: "Weekend Trip"
      },
      status: "pending",
      method: "UPI",
      date: new Date(Date.now() - 259200000), // 3 days ago
      notes: "Dinner at restaurant"
    },
    {
      id: 104,
      payer: {
        id: 5,
        name: "David Lee",
        avatar: "https://randomuser.me/api/portraits/men/86.jpg"
      },
      recipient: {
        id: 1,
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      amount: 120.00,
      group: {
        id: 3,
        name: "Lunch Club"
      },
      status: "revoked",
      method: "Google Pay",
      date: new Date(Date.now() - 432000000), // 5 days ago
      notes: "Payment revoked due to error"
    }
  ];

  // Filter settlements based on selected group
  const filteredHistory = settlementHistory.filter(settlement => {
    if (filterGroup === "all") return true;
    return settlement.group.id.toString() === filterGroup;
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total amount to settle
  const totalToSettle = suggestedSettlements.reduce((sum, settlement) => {
    if (settlement.recipient.id === 1) {
      return sum + settlement.amount;
    } else if (settlement.payer.id === 1) {
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

              {/* Suggested Settlements List */}
              {suggestedSettlements.length > 0 ? (
                <div className="space-y-4">
                  {suggestedSettlements.map((settlement) => (
                    <SettlementCard 
                      key={settlement.id}
                      settlement={settlement}
                      isSelected={selectedSettlements.includes(settlement.id)}
                      onSelect={() => toggleSettlementSelection(settlement.id)}
                      onSettle={() => handleSettleClick(settlement)}
                      formatCurrency={formatCurrency}
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
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default SettlementsPage;