import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import TransactionDetails from "./TransactionDetails";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const TransactionsList = ({ filters, searchQuery }) => {
  const { token } = useAuth(); // Get the auth token
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false); // Set to false initially until we know there's more

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
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return Object.entries(grouped).map(([date, transactions]) => ({
      date,
      formattedDate: transactions[0].formattedDate.split(',')[0],
      transactions
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
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

        // Create transaction objects from the API data
        const formattedExpenses = rawExpenses.map((item) => {
          // Get recipient for payments/settlements if available
          const recipient = item.paidBy?.find(p => p.user?._id !== item.createdBy?._id)?.user;
          
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
            user: item.createdBy
              ? { id: item.createdBy._id, name: item.createdBy.name, avatar: item.createdBy.avatar || "/assets/images/no_image.png" }
              : { id: "unknownUser", name: "Unknown User", avatar: "/assets/images/no_image.png" },
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
            receipt: item.receiptImage,
            notes: item.notes,
            isPaid: item.status === "settled" || Math.random() > 0.3, // Randomly assign for demo, should come from API
          };
        });
        // console.log(formattedExpenses);
        setTransactions(formattedExpenses);
        // setHasMore(formattedExpenses.length >= 10); // Example logic to determine if there might be more
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
    
    // In a real implementation, you would fetch more data from the API here
    // For this implementation, we'll just simulate a delay and then say no more
    setTimeout(() => {
      setIsLoadingMore(false);
      setHasMore(false); // No more data to load for demo
    }, 1500);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    // Filter by group
    if (filters.group !== "all") {
      filtered = filtered.filter(t => t.groupId === filters.group);
    }
    
    // Filter by person
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
    
    // Filter by date range
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
    
    // Apply search query
    if (searchQuery) {
      // console.log(searchQuery);
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

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
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
          onClick={() => window.location.reload()} // Simple reload to clear filters for demo
          className="mt-4 px-5 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200 z-0"></div>
        
        {/* Transactions by date */}
        <div className="space-y-10">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="relative">
              {/* Date header */}
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mint-400 to-mint-500 flex items-center justify-center z-10 shadow-md">
                  <Icon name="Calendar" size={20} className="text-white" />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-800">{group.formattedDate}</h3>
              </div>
              
              {/* Transactions for this date */}
              <div className="ml-6 space-y-5">
                {group.transactions.map((transaction) => (
                  <div key={transaction.id} className="relative">
                    <div 
                      className={`
                        bg-white border rounded-xl shadow-md hover:shadow-lg transition-all p-5
                        transform hover:-translate-y-0.5
                        ${expandedTransaction === transaction.id ? 'border-mint-500 ring-1 ring-mint-200' : 'border-gray-100'}
                      `}
                    >
                      <div className="flex items-start">
                        {/* Transaction icon with appropriate styling based on type */}
                        {transaction.type === "expense" ? (
                          <div className="w-14 h-14 rounded-xl bg-lavender-500 bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                            <Icon name="Receipt" size={24} className="text-lavender-500" />
                          </div>
                        ) : transaction.type === "payment" ? (
                          <div className="w-14 h-14 rounded-xl bg-mint-500 bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                            <Icon name="CreditCard" size={24} className="text-mint-500" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-success bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                            <Icon name="CheckCircle" size={24} className="text-success" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800 text-lg">{transaction.title}</h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1.5">
                                {transaction.group && transaction.groupId && (
                                  <>
                                    <Link to={`/group-details-page/${transaction.groupId}`} className="text-mint-500 hover:underline flex items-center">
                                      <Icon name="Users" size={14} className="mr-1" />
                                      {transaction.group}
                                    </Link>
                                    <span className="mx-1.5">•</span>
                                  </>
                                )}
                                <span className="flex items-center">
                                  <Icon name="Clock" size={14} className="mr-1" />
                                  {transaction.formattedDate.split(",")[1]}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800 text-lg">{formatCurrency(transaction.amount)}</p>
                              <span className={`text-xs px-2.5 py-1 rounded-full inline-block mt-1.5 font-medium
                                ${transaction.isPaid ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}
                              >
                                {transaction.isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              {transaction.type === "expense" ? (
                                <>
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                      <Image 
                                        src={transaction.user?.avatar} 
                                        alt={transaction.user?.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700">{transaction.user?.name} paid</span>
                                  </div>
                                  
                                  <div className="ml-3 flex -space-x-2">
                                    {transaction.participants.slice(0, 3).map((participant) => (
                                      <div key={participant.id} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                        <Image 
                                          src={participant.avatar} 
                                          alt={participant.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                    {transaction.participants.length > 3 && (
                                      <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                        +{transaction.participants.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                                      <Image 
                                        src={transaction.user?.avatar} 
                                        alt={transaction.user?.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Icon name="ArrowRight" size={16} className="mx-2 text-mint-500" />
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                                      <Image 
                                        src={transaction.recipient?.avatar || "/assets/images/no_image.png"} 
                                        alt={transaction.recipient?.name || "Recipient"} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center">
                              <button
                                onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Icon 
                                  name={expandedTransaction === transaction.id ? "ChevronUp" : "ChevronDown"} 
                                  size={18} 
                                  className="text-gray-500"
                                />
                              </button>
                            </div>
                          </div>
                          
                          {/* Expanded details */}
                          {expandedTransaction === transaction.id && (
                            <TransactionDetails transaction={transaction} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
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
    </div>
  );
};

export default TransactionsList;