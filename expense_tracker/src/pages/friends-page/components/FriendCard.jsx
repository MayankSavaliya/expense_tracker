import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { transactionAPI } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/Button";
import TransactionHistoryModal from "./TransactionHistoryModal";

const FriendCard = ({ friend, onRemoveFriend, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [balanceData, setBalanceData] = useState({ 
    balance: 0, 
    isUser1Debtor: false,
    transactions: [],
    isLoading: true, 
    error: null 
  });
  const [settlementSuccess, setSettlementSuccess] = useState(false);
  const menuRef = useRef(null);
  const settleModalRef = useRef(null);
  const { user } = useAuth();
  
  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (settleModalRef.current && !settleModalRef.current.contains(event.target) && showSettleModal) {
        setShowSettleModal(false);
      }
    };
    
    if (showMenu || showSettleModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showSettleModal]);
  
  // Fetch balance data between users
  useEffect(() => {
    const fetchBalanceData = async () => {
      if (!user?._id || !friend.id) return;
      
      try {
        const response = await transactionAPI.getBalanceBetweenUsers(user._id, friend.id);
        
        console.log('Balance data response:', response.data);
        // Store complete data including transactions
        setBalanceData({
          balance: Math.abs(response.data.data.balance),
          isUser1Debtor: response.data.data.isUser1Debtor,
          transactions: response.data.data.transactions || [],
          isLoading: false,
          error: null
        });
        
        // Pre-fill settlement amount with the balance
        setSettlementAmount(Math.abs(response.data.data.balance).toFixed(2));
      } catch (error) {
        console.error('Error fetching balance data:', error);
        setBalanceData({
          balance: 0,
          isUser1Debtor: false,
          transactions: [],
          isLoading: false,
          error: 'Failed to load balance'
        });
      }
    };
    
    fetchBalanceData();
  }, [friend.id, user?._id, settlementSuccess]);
  
  // Handle settlement creation
  const handleSettleUp = async () => {
    if (!user?._id || !friend.id || !settlementAmount) return;
    
    try {
      setIsSettling(true);
      
      const amount = parseFloat(settlementAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        setIsSettling(false);
        return;
      }
      
      // Determine who owes whom
      let fromUserId, toUserId;
      if (balanceData.isUser1Debtor) {
        fromUserId = user._id;
        toUserId = friend.id;
      } else {
        fromUserId = friend.id;
        toUserId = user._id;
      }
      
      await transactionAPI.createSettlement({
        fromUserId,
        toUserId,
        amount,
        description: `Settlement between ${user.name} and ${friend.name}`
      });
      
      // Reset UI state
      setShowSettleModal(false);
      setIsSettling(false);
      setSettlementSuccess(true);
      
      // Trigger refresh in parent component
      if (onRefresh) onRefresh();
      
      // Show success message
      alert(`Successfully settled up with ${friend.name}!`);
      
      // Reset success flag after a delay
      setTimeout(() => {
        setSettlementSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating settlement:', error);
      setIsSettling(false);
      alert('Failed to create settlement. Please try again.');
    }
  };
  
  // Format currency
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balanceData.balance || 0);

  // Determine balance color and text
  const getBalanceDisplay = () => {
    if (balanceData.isLoading) return { color: "text-gray-400", text: "Loading balance..." };
    if (balanceData.error) return { color: "text-gray-400", text: "Balance unavailable" };
    
    // If balance is zero or very close to zero
    if (Math.abs(balanceData.balance) < 0.01) {
      return { color: "text-gray-600", text: "Settled up" };
    }
    
    if (balanceData.isUser1Debtor) {
      // Current user owes money to friend
      return { 
        color: "text-red-500",
        text: `You owe ${formattedBalance}` 
      };
    } else {
      // Friend owes money to current user
      return { 
        color: "text-green-500",
        text: `Owes you ${formattedBalance}` 
      };
    }
  };
  
  const balanceDisplay = getBalanceDisplay();

  return (
    <div className="flex flex-col p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
      {/* Transaction History Modal */}
      <TransactionHistoryModal 
        isOpen={showTransactionHistory} 
        onClose={() => setShowTransactionHistory(false)}
        onOpenSettleModal={() => setShowSettleModal(true)}
        transactions={balanceData.transactions}
        friend={friend}
        balance={balanceData.balance}
        isUser1Debtor={balanceData.isUser1Debtor}
      />
      
      {/* Settlement Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={settleModalRef}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Settle up with {friend.name}</h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                {balanceData.isUser1Debtor ? 
                  `You owe ${friend.name} ${formattedBalance}` : 
                  `${friend.name} owes you ${formattedBalance}`}
              </p>
              
              <div className="flex flex-col">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1">
                  Settlement amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    className="block w-full pl-7 pr-12 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-mint-500 focus:border-mint-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={balanceData.balance}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => setSettlementAmount(balanceData.balance.toFixed(2))}
                      className="px-3 py-0.5 m-1 text-xs bg-mint-100 text-mint-700 hover:bg-mint-200 rounded"
                    >
                      Full amount
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowSettleModal(false)}
                disabled={isSettling}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSettleUp}
                loading={isSettling}
                loadingText="Settling..."
                disabled={!settlementAmount || parseFloat(settlementAmount) <= 0 || parseFloat(settlementAmount) > balanceData.balance}
              >
                Settle up
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Friend info and balance section */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => {
          if (!balanceData.isLoading && !balanceData.error) {
            setShowTransactionHistory(true);
          }
        }}
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-100 shadow-sm ring-2 ring-white">
            <Image 
              src={friend.avatar} 
              alt={friend.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base">{friend.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {friend.lastActivity ? `Last active: ${friend.lastActivity}` : 'Friend'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Balance display */}
          <div className="mr-4 text-right">
            <p className="text-xs text-gray-500 mb-0.5">Balance</p>
            <p className={`text-sm font-semibold ${balanceDisplay.color} whitespace-nowrap`}>
              {balanceDisplay.text}
            </p>
          </div>
          <Icon name="ChevronRight" size={18} className="text-gray-400" />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-4">
        <div className="flex space-x-2">
          {/* View expenses button */}
          <Link 
            to={`/transactions-page?friendId=${friend.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center"
          >
            <Icon name="Receipt" size={14} className="mr-1.5" />
            View expenses
          </Link>
          
          {/* Add expense button */}
          <Link 
            to={`/add-expense-page?friendId=${friend.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center"
          >
            <Icon name="Plus" size={14} className="mr-1.5" />
            Add expense
          </Link>
        </div>
        
        <div className="flex space-x-2">
          {/* Settle up button - only show if there's a balance */}
          {Math.abs(balanceData.balance) > 0.01 && !balanceData.isLoading && !balanceData.error && (
            <button 
              onClick={() => setShowSettleModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-mint-500 hover:bg-mint-600 transition-all flex items-center"
              disabled={isSettling}
            >
              {isSettling ? (
                <>
                  <Icon name="Loader" size={14} className="mr-1.5 animate-spin" />
                  Settling...
                </>
              ) : (
                <>
                  <Icon name="ArrowLeftRight" size={14} className="mr-1.5" />
                  Settle up
                </>
              )}
            </button>
          )}
          
          {/* Menu button */}
          <div className="relative" ref={menuRef}>
            <button 
              className={`p-2 rounded-full ${showMenu ? 'bg-mint-100 text-mint-600' : 'hover:bg-gray-200 active:bg-gray-300'} transition-all`}
              title="More options"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Icon name="MoreVertical" size={16} className={`${showMenu ? 'text-mint-600' : 'text-gray-600'}`} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden">
                <div className="py-1">
                  <button 
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-mint-50 transition-all flex items-center"
                    onClick={() => setShowMenu(false)}
                  >
                    <Icon name="User" size={15} className="mr-2.5 text-mint-500" />
                    View profile
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-all flex items-center"
                    onClick={() => {
                      if (onRemoveFriend) {
                        setIsRemoving(true);
                        onRemoveFriend(friend.id);
                        setShowMenu(false);
                      }
                    }}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <>
                        <Icon name="Loader" size={15} className="mr-2.5 text-mint-500 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Icon name="UserMinus" size={15} className="mr-2.5 text-mint-500" />
                        Remove friend
                      </>
                    )}
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-red-50 active:bg-red-100 transition-all flex items-center">
                    <Icon name="Ban" size={15} className="mr-2.5" />
                    Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;