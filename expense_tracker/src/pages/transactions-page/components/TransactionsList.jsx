import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import TransactionDetailsModal from "./TransactionDetailsModal";

const TransactionsList = ({ filters, searchQuery }) => {
  const { token } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Format date for display
  const formatDateDisplay = (dateString) => {
    const dateObj = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return `Today, ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return `${dateObj.toLocaleDateString([], { month: "short", day: "numeric" })}, ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };
  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    
    console.log(transactions);
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      let dateKey;
      if (transactionDate.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (transactionDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = transactionDate.toLocaleDateString([], { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    // Sort groups by actual date (most recent first)
    return Object.entries(grouped).map(([dateKey, transactions]) => ({
      dateKey,
      formattedDate: dateKey,
      transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    })).sort((a, b) => {
      // Custom sort to ensure Today comes first, then Yesterday, then chronological
      if (a.dateKey === 'Today') return -1;
      if (b.dateKey === 'Today') return 1;
      if (a.dateKey === 'Yesterday') return -1;
      if (b.dateKey === 'Yesterday') return 1;
      return new Date(b.transactions[0].date) - new Date(a.transactions[0].date);
    });
  };    // Helper function to get category-based icon
  const getCategoryIcon = (category, type) => {
    if (type === "payment") return "CreditCard";
    if (type === "settlement") return "CheckCircle";
    
    // Category-based icons for expenses
    const categoryIcons = {
      "Food": "UtensilsCrossed",
      "Transport": "Car",
      "Entertainment": "Music",
      "Shopping": "ShoppingBag", 
      "Healthcare": "Heart",
      "Education": "BookOpen",
      "Travel": "Plane",
      "Utilities": "Home",
      "Groceries": "ShoppingCart",
      "Gas": "Car",
      "Restaurant": "Coffee",
      "Movies": "Film",
      "Bills": "Receipt",
      "Rent": "Building",
      "Other": "Receipt"
    };
    
    return categoryIcons[category] || "Receipt";
  };
  
  // Helper function to render transaction icon
  const renderTransactionIcon = (type) => {
    switch (type) {
      case "expense":
        return <Icon name="Receipt" size={18} className="text-lavender-500" />;
      case "payment":
        return <Icon name="CreditCard" size={18} className="text-mint-500" />;
      case "settlement":
        return <Icon name="CheckCircle" size={18} className="text-success" />;
      default:
        return <Icon name="Activity" size={18} className="text-gray-500" />;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Fetch transactions from API
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token) {
        setIsLoading(false);
        setTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/expenses/my-expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        let rawExpenses = [];
        if (response.data && response.data.data) {
          rawExpenses = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        } else if (Array.isArray(response.data)) {
          rawExpenses = response.data;
        }
        
        const formattedExpenses = rawExpenses.map((item) => {
          const recipient = item.paidBy?.find(p => p.user?._id !== item.createdBy?._id)?.user;
          const payer = item.paidBy?.length > 0 ? item.paidBy[0].user : item.createdBy;
          return {
            id: item._id,
            type: item.paidBy && item.paidBy.length > 0 && item.owedBy && item.owedBy.length > 0 ? "expense" : 
                  (item.paidBy && item.paidBy.length === 1 && item.owedBy && item.owedBy.length === 1) ? "payment" : "expense",
            title: item.description || "N/A",
            amount: item.amount || 0,
            group: item.group?.name,
            groupId: item.group?._id,
            date: item.date,
            timestamp: item.date,
            formattedDate: item.date ? formatDateDisplay(item.date) : "N/A",
            category: item.category || "Other",
            user: payer
              ? { id: payer._id, name: payer.name, avatar: payer.avatar || "/assets/images/no_image.png" }
              : { id: "unknownUser", name: "Unknown User", avatar: "/assets/images/no_image.png" },
            payers: item.paidBy?.map(p => ({
              id: p.user?._id,
              name: p.user?.name || "Unknown",
              avatar: p.user?.avatar || "/assets/images/no_image.png",
              amount: p.amount || 0,
            })) || [],
            participants: item.owedBy?.map((p) => ({
              id: p.user?._id,
              name: p.user?.name || "Unknown",
              avatar: p.user?.avatar || "/assets/images/no_image.png",
              share: p.amount || 0,
            })) || [],
            recipient: recipient ? {
              id: recipient._id,
              name: recipient.name || "Unknown",
              avatar: recipient.avatar || "/assets/images/no_image.png"
            } : null,
            receipt: item.receiptImage,            notes: item.notes,
          };
        });
        
        setTransactions(formattedExpenses);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [token]);

  // Load more transactions
  const loadMoreTransactions = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
      setHasMore(false);
    }, 1500);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...transactions];
    
    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.group !== "all") {
      filtered = filtered.filter(t => t.groupId === filters.group);
    }
    
    if (filters.person !== "all") {
      filtered = filtered.filter(t => {
        if (t.type === "expense") {
          return t.participants.some(p => p.id === filters.person);
        } else if (t.type === "payment" || t.type === "settlement") {
          return t.user.id === filters.person || (t.recipient && t.recipient.id === filters.person);
        }
        return false;
      });
    }
    
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case "this-week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last-month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
          setFilteredTransactions(filtered);
          return;
        case "last-3-months":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(t => new Date(t.date) >= startDate);
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.user.name.toLowerCase().includes(query) ||
        (t.recipient && t.recipient.name.toLowerCase().includes(query)) ||
        (t.participants && t.participants.some(p => p.name.toLowerCase().includes(query))) ||
        (t.notes && t.notes.toLowerCase().includes(query))
      );
    }
    
    setFilteredTransactions(filtered);
  }, [filters, searchQuery, transactions]);

  const toggleTransactionDetails = (transaction) => {
    setSelectedTransaction(selectedTransaction && selectedTransaction.id === transaction.id ? null : transaction);
  };

  // Group the filtered transactions by date
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-mint-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-mint-300 animate-spin animation-delay-150"></div>
        </div>
        <p className="text-gray-500 mt-6 font-medium">Loading transactions...</p>
      </div>
    );
  }

  if (filteredTransactions.length === 0 && !isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center mb-5 shadow-sm">
          <Icon name="Search" size={36} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-3">No transactions found</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          {searchQuery 
            ? `No transactions match your search for "${searchQuery}". Try adjusting your filters or search terms.` 
            : "No transactions match your current filters. Try adjusting your filter criteria."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
        >
          Clear Filters
        </button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="space-y-10 relative">
        {/* Transactions grouped by date */}
        {groupedTransactions.map((group) => (
          <div key={group.date} className="relative">
            {/* Date header with timeline visualization and summary */}
            <div className="flex flex-col sm:flex-row sm:items-center mb-6 relative">
              <div className="flex items-center">                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mint-400 to-mint-500 flex items-center justify-center shadow-lg mr-4 z-10">
                  <Icon name="Calendar" size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{group.formattedDate}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {/* Daily summary card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:ml-auto mt-3 sm:mt-0 flex items-center space-x-4 z-10">
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Total</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatCurrency(group.transactions.reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Expenses</span>
                  <span className="font-semibold text-lavender-600 text-sm">
                    {group.transactions.filter(t => t.type === "expense").length}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Payments</span>
                  <span className="font-semibold text-mint-600 text-sm">
                    {group.transactions.filter(t => t.type === "payment").length}
                  </span>
                </div>
              </div>
              
              {/* Timeline vertical line */}
              <div className="absolute left-6 h-full w-0.5 bg-gradient-to-b from-mint-300 to-transparent top-12 -z-10"></div>
            </div>

            {/* Horizontal scrolling transaction cards */}
            <div className="relative">
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                {group.transactions.map((transaction) => (                  <div 
                    key={transaction.id} 
                    className="flex-none w-72 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
                    onClick={() => toggleTransactionDetails(transaction)}
                  >
                    {/* Gradient accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${
                      transaction.type === "expense" 
                        ? "from-lavender-400 to-lavender-600" 
                        : transaction.type === "payment" 
                        ? "from-mint-400 to-mint-600" 
                        : "from-green-400 to-green-600"
                    }`}></div>
                    
                    <div className="p-4">
                      {/* Header with icon and title */}
                      <div className="flex items-center mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 shadow-sm bg-gradient-to-br
                          ${transaction.type === "expense" 
                            ? "from-lavender-50 to-lavender-100" 
                            : transaction.type === "payment" 
                            ? "from-mint-50 to-mint-100" 
                            : "from-green-50 to-green-100"}`}>
                          <Icon 
                            name={getCategoryIcon(transaction.category, transaction.type)}
                            size={22} 
                            className={`${transaction.type === "expense" ? "text-lavender-600" : transaction.type === "payment" ? "text-mint-600" : "text-green-600"}`}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base truncate" title={transaction.title}>
                            {transaction.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <Icon name="Clock" size={12} className="mr-1" />
                            <span>{transaction.formattedDate.split(",")[1]?.trim()}</span>
                          </div>
                        </div>
                      </div>
                        
                      {/* Amount display */}
                      <div className="text-center mb-4">
                        <p className={`text-xl font-bold ${transaction.amount > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      
                      {/* Bottom section */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          {transaction.type === "expense" ? (
                            <>
                              <div className="flex -space-x-1 mr-2">
                                {transaction.participants.slice(0, 2).map((participant, index) => (
                                  <div key={`${transaction.id}-part-${index}`} className="w-6 h-6 rounded-full border border-white overflow-hidden">
                                    <Image 
                                      src={participant.avatar} 
                                      alt={participant.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {transaction.participants.length > 2 && (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                    +{transaction.participants.length - 2}
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-600 text-xs">
                                {transaction.participants.length} people
                              </span>
                            </>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-white mr-2">
                                <Image 
                                  src={transaction.user?.avatar} 
                                  alt={transaction.user?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-gray-600 text-xs">{transaction.user?.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                            {transaction.category}
                          </span>
                          
                          {transaction.group && (
                            <Link 
                              to={`/group-details-page/${transaction.groupId}`}
                              className="text-mint-600 hover:text-mint-700 text-xs flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon name="Users" size={12} className="mr-1" />
                              {transaction.group.length > 8 ? `${transaction.group.substring(0, 8)}...` : transaction.group}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll indicators */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none opacity-50"></div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none opacity-50"></div>
            </div>
          </div>
        ))}
        
        {/* Load more button */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMoreTransactions}
              disabled={isLoadingMore}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50 disabled:opacity-50 font-medium"
            >
              {isLoadingMore ? (
                <>
                  <Icon name="Loader" size={18} className="animate-spin mr-2 inline" />
                  Loading...
                </>
              ) : (
                "Load More Transactions"
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  );
};

export default TransactionsList;