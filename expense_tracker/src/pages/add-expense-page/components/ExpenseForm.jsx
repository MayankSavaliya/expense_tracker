import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import DatePicker from "./DatePicker";
import SplitMethodSelector from "./SplitMethodSelector";

const ExpenseForm = ({ formData, onChange, categories, group, expenseType, currentUser, availableFriends }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [multiplePayersMode, setMultiplePayersMode] = useState(false);
  console.log(formData);
  useEffect(() => {
    // This effect ONLY runs if multiplePayersMode or expenseType changes.
    // It aims to sanitize participant state for the new mode.
    if (expenseType === 'group') {
        if (!multiplePayersMode) { // Switched TO Single Payer Mode
            const currentParticipants = formData.participants;
            // Ensure currentParticipants is an array before filtering
            const payersInParticipants = Array.isArray(currentParticipants) 
                ? currentParticipants.filter(p => p && p.isPayer) 
                : [];

            if (payersInParticipants.length > 1) {
                // Had multiple payers, now in single mode. Force user to pick one by clearing.
                const clearedParticipants = currentParticipants.map(p => ({
                    ...p,
                    isPayer: false,
                    paidAmount: 0,
                }));
                onChange("participants", clearedParticipants);
            }
        }
        // When switching TO multiplePayersMode, no immediate change to participants is forced by this useEffect.
    }
}, [multiplePayersMode, expenseType, onChange]); // formData.participants removed from deps to prevent loops

  const handleParticipantToggle = (participantUserId) => {
    onChange(
      "participants",
      formData.participants.map((p) =>
        p.user._id === participantUserId ? { ...p, isIncluded: !p.isIncluded } : p
      )
    );
  };

  const handlePayerSelect = (payerId) => {
    if (!payerId) return;

    const currentAmount = parseFloat(formData.amount) || 0;
    let updatedParticipants;

    if (multiplePayersMode) {
      updatedParticipants = formData.participants.map(p => {
        if (p.user && p.user._id === payerId) {
          const willBePayer = !p.isPayer;
          return {
            ...p,
            isPayer: willBePayer,
            paidAmount: willBePayer ? currentAmount : 0 // Or some other logic for multi-payer default
          };
        }
        return p;
      });
    } else {
      // Single payer mode
      updatedParticipants = formData.participants.map(p => {
        const isSelectedPayer = p.user && p.user._id === payerId;
        return {
          ...p,
          isPayer: isSelectedPayer,
          paidAmount: isSelectedPayer ? currentAmount : 0
        };
      });
    }
    onChange("participants", updatedParticipants);
    // NO onChange("paidBy", ...) call
  };

  const handlePayerAmountChange = (payerUserId, amountStr) => {
    if (!payerUserId) return;

    const amount = parseFloat(amountStr) || 0;
    const updatedParticipants = formData.participants.map(p => {
      if (p.user && p.user._id === payerUserId) {
        return { ...p, paidAmount: amount };
      }
      return p;
    });

    onChange("participants", updatedParticipants);
    // NO onChange("paidBy", ...) call
  };

  const selectedCategory = categories.find(c => c.id === formData.category);
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].substring(0, 1).toUpperCase() + names[names.length - 1].substring(0, 1).toUpperCase();
  };

  // Calculate total paid amount in multiple payers mode
  const totalPaidInMultipleMode = formData.participants
    .filter(p => p.isPayer)
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  // Check if total matches expense amount (with small tolerance for floating point)
  const expenseAmount = parseFloat(formData.amount) || 0;
  const isTotalMismatch = multiplePayersMode && expenseAmount > 0 && 
    Math.abs(totalPaidInMultipleMode - expenseAmount) > 0.01;

  return (
    <form className="mt-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="expense-title" className="block text-sm font-medium text-gray-700 mb-2">
            Expense Title
          </label>
          <input
            id="expense-title"
            type="text"
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="What was this expense for?"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="expense-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => onChange("amount", e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
              required
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange("category", category.id)}
              className={`flex items-center p-3 border rounded-md transition-colors ${
                formData.category === category.id
                  ? "border-mint-500 bg-mint-500 bg-opacity-10" :"border-gray-200 hover:border-mint-500 hover:bg-mint-500 hover:bg-opacity-5"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center mr-3`}>
                <Icon name={category.icon} size={16} className="text-white" />
              </div>
              <span className="font-medium text-gray-800">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <DatePicker
          selectedDate={formData.date}
          onChange={(date) => onChange("date", date)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Recurring Expense</span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="toggle-recurring"
              checked={formData.isRecurring}
              onChange={() => onChange("isRecurring", !formData.isRecurring)}
              className="sr-only"
            />
            <label
              htmlFor="toggle-recurring"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                formData.isRecurring ? "bg-mint-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  formData.isRecurring ? "translate-x-4" : "translate-x-0"
                }`}
              ></span>
            </label>
          </div>
        </div>
        
        {formData.isRecurring && (
          <select
            value={formData.recurringFrequency}
            onChange={(e) => onChange("recurringFrequency", e.target.value)}
            className="border border-gray-300 rounded-md text-sm focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>

      {formData.participants && formData.participants.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Who Paid?
            </label>
            {formData.participants.length > 1 && (
              <button
                type="button"
                onClick={() => setMultiplePayersMode(!multiplePayersMode)}
                className="text-mint-500 text-sm font-medium hover:text-mint-700 flex items-center"
              >
                {multiplePayersMode ? "Single Payer" : "Multiple Payers"}
                <Icon name={multiplePayersMode ? "User" : "Users"} size={16} className="ml-1" />
              </button>
            )}
          </div>

          {!multiplePayersMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.participants.map((participant) => {
                if (!participant || !participant.user) {
                  return null; 
                }

                const isCurrentUser = currentUser && currentUser._id === participant.user._id;
                const payerName = participant.user.name || "Unknown";
                
                // Properly check if this participant is the selected payer
                const isSelected = participant.isPayer || 
                  (formData.paidBy && 
                   formData.paidBy[0] && 
                   formData.paidBy[0].user === participant.user._id);

                return (
                  <button
                    key={participant.user._id}
                    type="button"
                    onClick={() => handlePayerSelect(participant.user._id)}
                    className={`flex items-center p-3 border rounded-md transition-colors ${
                      isSelected ? "border-mint-500 bg-mint-500 bg-opacity-10" : "border-gray-200 hover:border-mint-500 hover:bg-mint-500 hover:bg-opacity-5"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {participant.user.avatar && participant.user.avatar !== 'default_avatar_url' ? (
                          <Image
                            src={participant.user.avatar}
                            alt={payerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {getInitials(participant.user.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{payerName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 border border-gray-200 rounded-md p-4">
              {formData.participants.map((participant) => {
                if (!participant || !participant.user) {
                  return null;
                }

                const isCurrentUser = currentUser && currentUser._id === participant.user._id;
                const payerName = participant.user.name || "Unknown";
                const currentParticipantData = formData.participants.find(p => p && p.user && p.user._id === participant.user._id);

                return (
                  <div key={participant.user._id || Math.random().toString()} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`payer-${participant.user._id || Math.random()}`}
                        checked={currentParticipantData?.isPayer || false}
                        onChange={() => handlePayerSelect(participant.user._id)}
                        className="h-4 w-4 text-mint-500 border-gray-300 rounded focus:ring-mint-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          {participant.user.avatar && participant.user.avatar !== 'default_avatar_url' ? (
                            <Image
                              src={participant.user.avatar}
                              alt={payerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {getInitials(participant.user.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{payerName}</span>
                      </div>
                    </div>
                    
                    {currentParticipantData?.isPayer && (
                      <div className="w-32">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={currentParticipantData?.paidAmount || ""}
                            onChange={(e) => handlePayerAmountChange(participant.user._id, e.target.value)}
                            className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none text-sm"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Total Paid</span>
                <span className="text-sm font-medium text-gray-900">
                  ${totalPaidInMultipleMode.toFixed(2)}
                </span>
              </div>
              
              {isTotalMismatch && (
                <div className="text-xs text-error">
                  Total paid amount (${totalPaidInMultipleMode.toFixed(2)}) must equal the expense amount (${parseFloat(formData.amount).toFixed(2) || '0.00'})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {formData.participants && formData.participants.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Method
          </label>
          <SplitMethodSelector
            splitMethod={formData.splitMethod}
            onChange={(method, updatedParticipants) => {
              onChange("splitMethod", method);
              if (updatedParticipants) {
                onChange("participants", updatedParticipants);
              }
            }}
            participants={formData.participants}
            onParticipantsChange={(updatedParticipants) => onChange("participants", updatedParticipants)}
            amount={parseFloat(formData.amount) || 0}
            currentUser={currentUser}
          />
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center text-mint-500 hover:text-mint-700"
        >
          <Icon name={showNotes ? "ChevronDown" : "ChevronRight"} size={18} className="mr-1" />
          <span className="font-medium">Add Notes</span>
        </button>
        
        {showNotes && (
          <div className="mt-3">
            <textarea
              value={formData.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Add any additional details about this expense..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
              rows={3}
            ></textarea>
          </div>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;