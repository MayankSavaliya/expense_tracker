import React, { useState, useContext } from "react";
import Icon from "../../../components/AppIcon";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SettleUpModal = ({ isOpen, onClose, groupId, balancesData, onSettlementComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSettlement, setProcessingSettlement] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, token } = useContext(AuthContext);

  if (!isOpen || !balancesData) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'auto'
    }).format(amount);
  };

  // Get current user's settlements (debts they owe to others)
  const getCurrentUserDebts = () => {
    const currentUserMember = balancesData.members?.find(member => member.id === user._id);
    if (!currentUserMember || !currentUserMember.settlements) return [];

    // Filter for settlements where current user owes money (negative amounts)
    return currentUserMember.settlements
      .filter(settlement => settlement.amount < 0)
      .map(settlement => {
        const otherMember = balancesData.members.find(m => m.id === settlement.id);
        return {
          toUserId: settlement.id,
          toUserName: otherMember?.name || 'Unknown',
          toUserAvatar: otherMember?.avatar || null,
          amount: Math.abs(settlement.amount)
        };
      });
  };

  const userDebts = getCurrentUserDebts();

  // Handle individual settlement
  const handleSettle = async (debt) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setProcessingSettlement(debt.toUserId);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Call the group settlement API
      const response = await axios.post(
        `${API_BASE_URL}/api/transactions/settlement/group`,
        {
          groupId: groupId,
          toUserId: debt.toUserId,
          amount: debt.amount
        },
        { headers }
      );      if (response.data.success) {
        // Show success message
        setSuccessMessage(`Successfully settled ${formatCurrency(debt.amount)} with ${debt.toUserName}!`);
        setShowSuccessToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
          setShowSuccessToast(false);
          setSuccessMessage('');
        }, 3000);
        
        // Trigger parent component to refresh data
        if (onSettlementComplete) {
          onSettlementComplete();
        }
        
        // Close modal after successful settlement (with small delay for toast)
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Settlement failed');
      }
    } catch (error) {
      console.error('Settlement error:', error);
      alert(error.response?.data?.message || error.message || 'Settlement failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingSettlement(null);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-mint-50 to-lavender-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-mint-500 to-lavender-500 flex items-center justify-center mr-3 shadow-sm">
              <Icon name="ArrowLeftRight" size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Settle Up</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white hover:bg-opacity-80 rounded-xl transition-all duration-200 group"
            disabled={isProcessing}
          >
            <Icon name="X" size={20} className="text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>        {/* Content */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50">
          {userDebts.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center mb-2">
                  <Icon name="Info" size={16} className="text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Outstanding Debts</span>
                </div>
                <p className="text-blue-600 text-sm">
                  You have {userDebts.length} outstanding {userDebts.length === 1 ? 'debt' : 'debts'} in this group.
                </p>
              </div>              <div className="space-y-4">
                {userDebts.map((debt, index) => (
                  <div 
                    key={index} 
                    className={`bg-white border border-gray-200 rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1 ${
                      isProcessing && processingSettlement === debt.toUserId
                        ? 'border-mint-300 shadow-lg scale-105 bg-gradient-to-r from-mint-50 to-white'
                        : 'hover:border-mint-300 hover:shadow-lg'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-sm ring-2 ring-white">
                            {debt.toUserAvatar ? (
                              <img 
                                src={debt.toUserAvatar} 
                                alt={debt.toUserName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="User" size={22} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                            <Icon name="ArrowUp" size={12} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{debt.toUserName}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Icon name="Clock" size={12} className="mr-1" />
                            You owe
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Amount</div>
                          <span className="text-xl font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                            {formatCurrency(debt.amount)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSettle(debt)}
                          disabled={isProcessing}
                          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center shadow-sm ${
                            isProcessing && processingSettlement === debt.toUserId
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-mint-500 to-mint-600 text-white hover:from-mint-600 hover:to-mint-700 hover:shadow-md transform hover:scale-105'
                          }`}
                        >
                          {isProcessing && processingSettlement === debt.toUserId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Settling...
                            </>
                          ) : (
                            <>
                              <Icon name="Check" size={16} className="mr-2" />
                              Settle
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Icon name="CheckCircle" size={36} className="text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-mint-400 to-mint-500 rounded-full flex items-center justify-center">
                  <Icon name="Sparkles" size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">All Settled Up!</h3>
              <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                You don't owe anyone money in this group. Great job staying on top of your expenses!
              </p>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-green-700 text-sm font-medium">🎉 Your balance is clear!</p>
              </div>
            </div>
          )}
        </div>        {/* Footer */}
        {userDebts.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mr-3">
                  <Icon name="Calculator" size={16} className="text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Total Outstanding:</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                  {formatCurrency(userDebts.reduce((sum, debt) => sum + debt.amount, 0))}
                </span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700 flex items-center">
                <Icon name="Shield" size={12} className="mr-1.5" />
                Settlements are processed securely and will update balances immediately.
              </p>
            </div>          </div>
        )}
        
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 animate-fadeIn">
            <div className="bg-white border border-green-200 rounded-xl shadow-2xl p-4 max-w-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-sm">
                  <Icon name="CheckCircle" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Settlement Complete!</p>
                  <p className="text-xs text-gray-600 mt-0.5">{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettleUpModal;
