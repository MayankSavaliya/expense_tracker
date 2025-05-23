import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import ExpenseDetails from "./ExpenseDetails";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Predefined categories with their icons
const CATEGORIES = [
  { name: 'Groceries', icon: 'ShoppingCart', bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Dining', icon: 'Utensils', bg: 'bg-green-100', text: 'text-green-600' },
  { name: 'Transportation', icon: 'Car', bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Entertainment', icon: 'Film', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  { name: 'Utilities', icon: 'Wifi', bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { name: 'Rent', icon: 'Home', bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Travel', icon: 'Plane', bg: 'bg-teal-100', text: 'text-teal-600' },
  { name: 'Other', icon: 'MoreHorizontal', bg: 'bg-gray-100', text: 'text-gray-600' }
];

const ExpensesTab = ({ groupId }) => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    paidBy: "all"
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Function to get category icon and colors
  const getCategoryInfo = (category) => {
    const categoryInfo = CATEGORIES.find(cat => cat.name === category);
    return categoryInfo || CATEGORIES[CATEGORIES.length - 1];
  };

  // Fetch expenses when component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const transformedExpenses = response.data.data.expenses.map(expense => {
            const categoryInfo = getCategoryInfo(expense.category);
            return {
              id: expense._id,
              title: expense.description,
              amount: expense.amount,
              date: expense.date,
              category: expense.category,
              categoryIcon: categoryInfo.icon,
              iconBg: categoryInfo.bg,
              iconText: categoryInfo.text,
              splitType: expense.splitType,
              paidBy: expense.paidBy.map(payment => ({
                id: payment.user._id,
                name: payment.user.name,
                avatar: payment.user.avatar || DEFAULT_AVATAR,
                amount: payment.amount
              })),
              owedBy: expense.owedBy.map(debt => ({
                id: debt.user._id,
                name: debt.user.name,
                avatar: debt.user.avatar || DEFAULT_AVATAR,
                amount: debt.amount
              })),
              notes: expense.notes,
              receiptImage: expense.receiptImage
            };
          });

          setExpenses(transformedExpenses);
        } else {
          throw new Error(response.data.error || "Failed to fetch expenses");
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchExpenses();
    }
  }, [groupId, token]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Toggle expense details
  const toggleExpenseDetails = (expenseId) => {
    setExpandedExpenseId(expandedExpenseId === expenseId ? null : expenseId);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    // Search query filter
    if (searchQuery && !expense.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      if (filters.dateRange === "thisMonth") {
        if (expenseDate.getMonth() !== now.getMonth() || expenseDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (filters.dateRange === "lastMonth") {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (expenseDate.getMonth() !== lastMonth || expenseDate.getFullYear() !== lastMonthYear) {
          return false;
        }
      }
    }

    // Category filter
    if (filters.category !== "all" && expense.category !== filters.category) {
      return false;
    }

    // Paid by filter
    if (filters.paidBy !== "all" && !expense.paidBy.some(payment => payment.id === filters.paidBy)) {
      return false;
    }

    return true;
  });

  // Get unique payers with unique keys
  const uniquePayers = Array.from(new Map(
    expenses.map(expense => [expense.paidBy[0].id, expense.paidBy[0]])
  ).values());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="w-14 h-14 relative">
          <div className="absolute inset-0 rounded-full border-t-3 border-l-3 border-mint-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Receipt" size={20} className="text-mint-500" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading expenses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-1">Error loading expenses</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-8 bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Icon name="Filter" size={16} className="mr-2 text-lavender-500" />
          Filter Expenses
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {/* Date Range Filter */}
            <div className="relative">
              <select
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm appearance-none"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="all">All Dates</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
              <Icon
                name="Calendar"
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Icon
                name="ChevronDown"
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm appearance-none"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
              <Icon
                name="Tag"
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Icon
                name="ChevronDown"
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Paid By Filter */}
            <div className="relative">
              <select
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm appearance-none"
                value={filters.paidBy}
                onChange={(e) => setFilters({...filters, paidBy: e.target.value})}
              >
                <option value="all">All Payers</option>
                {uniquePayers.map((payer) => (
                  <option key={payer.id} value={payer.id}>{payer.name}</option>
                ))}
              </select>
              <Icon
                name="User"
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Icon
                name="ChevronDown"
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search expenses..."
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg text-sm bg-white focus:ring-lavender-500 focus:border-lavender-500 focus:ring-2 focus:outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={14} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Expense Header */}
              <div 
                className="p-5 cursor-pointer"
                onClick={() => toggleExpenseDetails(expense.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-lg ${expense.iconBg} flex items-center justify-center mr-4 shadow-sm`}>
                      <Icon name={expense.categoryIcon} size={20} className={expense.iconText} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{expense.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Icon name="Calendar" size={14} className="mr-1" />
                        <span>{formatDate(expense.date)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatTime(expense.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-2 justify-end">
                      <div className="w-6 h-6 rounded-full overflow-hidden mr-1.5 border border-gray-100">
                        <Image 
                          src={expense.paidBy[0].avatar} 
                          alt={expense.paidBy[0].name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{expense.paidBy[0].name} paid</span>
                    </div>
                  </div>
                </div>
                
                {/* Split Preview */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2">Split with:</span>
                    <div className="flex -space-x-2">
                      {expense.owedBy.map((debt) => (
                        <div key={debt.id} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm">
                          <Image 
                            src={debt.avatar} 
                            alt={debt.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpenseDetails(expense.id);
                    }}
                  >
                    <Icon 
                      name={expandedExpenseId === expense.id ? "ChevronUp" : "ChevronDown"} 
                      size={18} 
                    />
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedExpenseId === expense.id && (
                <ExpenseDetails expense={expense} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="Search" size={28} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No expenses found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;