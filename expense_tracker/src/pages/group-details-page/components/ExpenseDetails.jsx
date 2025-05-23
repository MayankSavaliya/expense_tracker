import React from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

const ExpenseDetails = ({ expense }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Expense Details */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Details</h4>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Category</span>
                <span className="font-medium text-gray-800">{expense.category}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-gray-100">
                <span className="text-gray-600">Split Method</span>
                <span className="font-medium text-gray-800">{expense.splitType}</span>
              </div>
              {expense.notes && (
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <p className="text-sm text-gray-600 mb-1">Notes:</p>
                  <p className="text-gray-800">{expense.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Image (if available) */}
          {expense.receiptImage && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Receipt</h4>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <img 
                  src={expense.receiptImage} 
                  alt="Receipt" 
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Paid By */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Paid By</h4>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              {expense.paidBy.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <Image 
                        src={payment.avatar || DEFAULT_AVATAR} 
                        alt={payment.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-gray-800">{payment.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owed By */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Owed By</h4>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              {expense.owedBy.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <Image 
                        src={debt.avatar || DEFAULT_AVATAR} 
                        alt={debt.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-gray-800">{debt.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{formatCurrency(debt.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;