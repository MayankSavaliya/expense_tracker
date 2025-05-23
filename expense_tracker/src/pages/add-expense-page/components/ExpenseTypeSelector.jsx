import React from "react";

const ExpenseTypeSelector = ({ expenseType, onChange }) => {
  return (
    <div className="flex w-full rounded-md overflow-hidden border border-gray-200">
      <button
        className={`flex-1 py-3 text-center font-medium transition-colors ${
          expenseType === "group" ?"bg-mint-500 text-white" :"bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onChange("group")}
      >
        Group Expense
      </button>
      <button
        className={`flex-1 py-3 text-center font-medium transition-colors ${
          expenseType === "personal" ?"bg-mint-500 text-white" :"bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onChange("personal")}
      >
        Personal Expense
      </button>
    </div>
  );
};

export default ExpenseTypeSelector;