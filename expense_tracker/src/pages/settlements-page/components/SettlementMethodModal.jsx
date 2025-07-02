import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const SettlementMethodModal = ({ settlement, onClose, onConfirm, formatCurrency, currentUserId }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  
  const { payer, recipient, amount, group } = settlement;
  
  // Determine if current user is payer or recipient
  const isUserPayer = payer.id === currentUserId;
  
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'Banknote', description: 'Record a cash payment' },
    { id: 'bank', name: 'Bank Transfer', icon: 'Building', description: 'Record a bank transfer' },
    { id: 'upi', name: 'UPI', icon: 'Smartphone', description: 'Pay using UPI' },
    { id: 'gpay', name: 'Google Pay', icon: 'CreditCard', description: 'Pay using Google Pay' }
  ];
  
  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };
  
  const handleSubmit = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    try {
      // Call the confirm callback with settlement data
      await onConfirm({
        method: selectedMethod,
        notes: notes
      });
      
      setIsCompleted(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error processing settlement:', error);
      setIsProcessing(false);
      alert('Failed to process settlement. Please try again.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!isCompleted ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isUserPayer ? 'Pay' : 'Record Payment'}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isProcessing}
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image 
                      src={isUserPayer ? payer.avatar : recipient.avatar} 
                      alt={isUserPayer ? payer.name : recipient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Icon name="ArrowRight" size={20} className="mx-3 text-gray-400" />
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image 
                      src={isUserPayer ? recipient.avatar : payer.avatar} 
                      alt={isUserPayer ? recipient.name : payer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-800">
                    {formatCurrency(amount)}
                  </p>
                  {group && (
                    <p className="text-sm text-gray-500">
                      {group.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </h4>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod === method.id 
                          ? 'border-mint-500 bg-mint-500 bg-opacity-5' :'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedMethod === method.id 
                            ? 'bg-mint-500 text-white' :'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon name={method.icon} size={18} />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        <div className="ml-auto">
                          <div className={`w-5 h-5 rounded-full border ${
                            selectedMethod === method.id 
                              ? 'border-mint-500 bg-mint-500' :'border-gray-300'
                          } flex items-center justify-center`}>
                            {selectedMethod === method.id && (
                              <Icon name="Check" size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-mint-500 focus:border-mint-500"
                  rows="3"
                  placeholder="Add any notes about this settlement..."
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedMethod || isProcessing}
                  className={`py-2 px-6 rounded-md transition-colors ${
                    !selectedMethod || isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :'bg-mint-500 hover:bg-mint-700 text-white'
                  } flex items-center justify-center`}
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader" size={18} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isUserPayer ? 'Pay Now' : 'Record Payment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isUserPayer ? 'Payment Successful!' : 'Payment Recorded!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isUserPayer 
                ? `You've successfully paid ${recipient.name} ${formatCurrency(amount)}.`
                : `You've recorded a payment of ${formatCurrency(amount)} from ${payer.name}.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementMethodModal;