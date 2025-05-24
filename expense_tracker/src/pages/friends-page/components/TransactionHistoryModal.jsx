import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import Button from "../../../components/Button";
import { groupAPI } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const TransactionHistoryModal = ({ 
  isOpen, 
  onClose, 
  transactions, 
  friend, 
  balance, 
  isUser1Debtor, 
  onOpenSettleModal 
}) => {
  const [groupByDate, setGroupByDate] = useState(true);
  const [transactionType, setTransactionType] = useState("all");
  const [groupDetails, setGroupDetails] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch group details for any group transactions
  useEffect(() => {
    if (!isOpen || !transactions || transactions.length === 0) return;
    
    const fetchGroupDetails = async () => {
      // Extract unique group IDs from transactions
      const groupIds = Array.from(
        new Set(
          transactions
            .filter(t => t.group)
            .map(t => t.group)
        )
      );
      
      // Fetch details for each group
      const groupDetailsObj = {};
      try {
        for (const groupId of groupIds) {
          const response = await groupAPI.getGroupById(groupId);
          if (response.data && response.data.data) {
            groupDetailsObj[groupId] = response.data.data;
          }
        }
        setGroupDetails(groupDetailsObj);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };
    
    fetchGroupDetails();
  }, [isOpen, transactions]);
  
  if (!isOpen) return null;
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Filter transactions based on selected type
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionType === "all") return true;
    if (transactionType === "you-paid") return transaction.from._id !== friend.id;
    if (transactionType === "they-paid") return transaction.from._id === friend.id;
    return true;
  });
  
  // Group transactions by date if enabled
  const groupedTransactions = groupByDate ? Object.entries(
    filteredTransactions.reduce((groups, transaction) => {
      try {
        // Safely create date object
        const dateObj = transaction.date ? new Date(transaction.date) : null;
        
        // Check if date is valid
        if (!dateObj || isNaN(dateObj.getTime())) {
          // Put invalid dates in an "Unknown date" group
          const key = "Unknown date";
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(transaction);
        } else {
          // Format valid date as a consistent string for grouping
          const key = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(transaction);
        }
      } catch (error) {
        // Handle any errors in date processing
        console.error('Error processing transaction date:', error);
        const key = "Unknown date";
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(transaction);
      }
      return groups;
    }, {})
  ).sort((a, b) => {
    // Special handling for "Unknown date" group - always put it last
    if (a[0] === "Unknown date") return 1;
    if (b[0] === "Unknown date") return -1;
    
    // Sort other dates newest to oldest
    try {
      return new Date(b[0]) - new Date(a[0]);
    } catch (error) {
      return 0; // Keep order unchanged if comparison fails
    }
  }) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-100">
              <Image 
                src={friend.avatar} 
                alt={friend.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Transactions with {friend.name}</h3>
              <p className={`text-sm font-medium ${isUser1Debtor ? 'text-green-500' : 'text-red-500'}`}>
                {isUser1Debtor 
                  ? `Owes you ${formatCurrency(balance)}` 
                  : `You owe ${formatCurrency(balance)}`}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all"
          >
            <Icon name="X" size={18} className="text-gray-600" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <select              value={transactionType} 
              onChange={(e) => setTransactionType(e.target.value)}
              className="text-sm border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-mint-500 hover:border-gray-400 transition-colors"
            >
              <option value="all">All transactions</option>
              <option value="you-paid">You paid</option>
              <option value="they-paid">They paid</option>
            </select>
          </div>
          <div className="flex items-center">            <button 
              onClick={() => setGroupByDate(!groupByDate)}
              className={`text-sm px-3 py-1.5 rounded-md flex items-center transition-colors ${groupByDate ? 'bg-mint-100 text-mint-700 hover:bg-mint-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Icon name="Calendar" size={14} className="mr-1.5" />
              Group by date
            </button>
          </div>
        </div>
        
        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileX" size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          ) : groupByDate ? (
            <div className="space-y-4">
              {groupedTransactions.map(([date, dayTransactions]) => (
                <div key={date} className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-500 px-2">
                    {date === "Unknown date" ? "Unknown date" : formatDate(date)}
                  </h5>
                  {dayTransactions.map((transaction) => {
                    const isPayment = transaction.from._id === friend.id;
                    const isSettlement = transaction.description && 
                      transaction.description.toLowerCase().includes('settlement');
                    
                    return (                      
                      <div 
                        key={transaction._id} 
                        className={`flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-all ${
                          isSettlement ? 'bg-mint-50 border-mint-100' : ''
                        }`}
                        onClick={() => {
                          // Navigate to group page if it's a group transaction
                          if (transaction.group) {
                            navigate(`/group-details-page/${transaction.group}`);
                          }
                        }}
                        style={{ cursor: transaction.group ? 'pointer' : 'default' }}
                      >
                        {/* Icon or avatar */}
                        {transaction.group ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            groupDetails[transaction.group]?.iconBg || 'bg-blue-100'
                          } text-blue-700 relative`}>
                            <Icon 
                              name={groupDetails[transaction.group]?.icon || "Users"} 
                              size={18}
                            />
                            {/* Payment indicator for group transactions */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white 
                              ${isPayment ? 'bg-red-500' : 'bg-green-500'}`}>
                            </div>
                          </div>
                        ) : (
                          // For regular transactions, show avatar of who paid
                          isPayment ? (
                            // Friend paid (their avatar)
                            friend.avatar ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                <Image 
                                  src={friend.avatar} 
                                  alt={friend.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <Icon name="User" size={18} />
                              </div>
                            )
                          ) : (
                            // You paid (your avatar)
                            user?.avatar ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                <Image 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                                <Icon name="User" size={18} />
                              </div>
                            )
                          )
                        )}
                        
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-gray-800">
                              {isSettlement ? 
                                (isPayment ? `${friend.name} settled up` : "You settled up") :
                                transaction.group ? 
                                `${groupDetails[transaction.group]?.name || 'Group expense'} (${isPayment ? `${friend.name} paid` : "You paid"})` :
                                (isPayment ? `${friend.name} paid you` : `You paid ${friend.name}`)
                              }
                            </p>
                            <p className={`font-semibold text-sm ${
                              isSettlement ? 'text-mint-700' :
                              isPayment ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                          
                          {transaction.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[250px]">
                              {transaction.description}
                            </p>
                          )}
                            <div className="flex items-center mt-1.5">
                            {transaction.group && (
                              <div className="flex items-center hover:bg-blue-200 transition-colors mr-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                <Icon name="ExternalLink" size={12} className="mr-1.5" />
                                View Group
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const isPayment = transaction.from._id === friend.id;
                const isSettlement = transaction.description && 
                  transaction.description.toLowerCase().includes('settlement');
                
                return (
                  <div 
                    key={transaction._id} 
                    className={`flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-all ${
                      isSettlement ? 'bg-mint-50 border-mint-100' : ''
                    }`}
                    onClick={() => {
                      // Navigate to group page if it's a group transaction
                      if (transaction.group) {
                        navigate(`/group-details-page/${transaction.group}`);
                      }
                    }}
                    style={{ cursor: transaction.group ? 'pointer' : 'default' }}
                  >
                    {/* Icon or avatar */}
                    {transaction.group ? (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        groupDetails[transaction.group]?.iconBg || 'bg-blue-100'
                      } text-blue-700 relative`}>
                        <Icon 
                          name={groupDetails[transaction.group]?.icon || "Users"} 
                          size={18}
                        />
                        {/* Payment indicator for group transactions */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white 
                          ${isPayment ? 'bg-green-500' : 'bg-red-500'}`}>
                        </div>
                      </div>
                    ) : (
                      // For regular transactions, show avatar of who paid
                      isPayment ? (
                        // Friend paid (their avatar)
                        friend.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                            <Image 
                              src={friend.avatar} 
                              alt={friend.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                            <Icon name="User" size={18} />
                          </div>
                        )
                      ) : (
                        // You paid (your avatar)
                        user?.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                            <Image 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                            <Icon name="User" size={18} />
                          </div>
                        )
                      )
                    )}
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-800">
                          {isSettlement ? 
                            (isPayment ? `${friend.name} settled up` : "You settled up") :
                            transaction.group ? 
                            `${groupDetails[transaction.group]?.name || 'Group expense'} (${isPayment ? `${friend.name} paid` : "You paid"})` :
                            (isPayment ? `${friend.name} paid you` : `You paid ${friend.name}`)
                          }
                        </p>
                        <p className={`font-semibold text-sm ${
                          isSettlement ? 'text-mint-700' :
                          isPayment ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[250px]">
                          {transaction.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          {transaction.group && (
                            <div className="flex items-center mr-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                              <Icon name="ExternalLink" size={10} className="mr-1" />
                              View Group
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="border-t border-gray-200 p-4 flex justify-center bg-gray-50">          
          {Math.abs(balance) > 0.01 && (
            <Button
              variant="primary"
              size="sm"
              icon="ArrowLeftRight"
              onClick={() => {
                onClose();
                if (onOpenSettleModal) onOpenSettleModal();
              }}
              className="w-full"
            >
              Settle up ({formatCurrency(balance)})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
