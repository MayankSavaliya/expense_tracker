import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { expenseAPI } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const DEFAULT_AVATAR = "/assets/images/no_image.png";

const RecentActivity = () => {
  const { user, token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Fetch recent activities when the component mounts
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!token) {
        setLoading(false);
        setActivities([]);
        return;
      }
      
      try {
        setLoading(true);
        // Use the expense API to get the user's recent expenses
        const response = await expenseAPI.getMyExpenses();
        
        // Transform the API data into the format needed for display
        let recentExpenses = [];
        if (response.data && response.data.data) {
          recentExpenses = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        } else if (Array.isArray(response.data)) {
          recentExpenses = response.data;
        }
        
        // Format expenses for display
        const formattedExpenses = recentExpenses
          .map((item) => {
            // Get recipient for payments/settlements if available
            const recipient = item.paidBy?.find(p => p.user?._id !== item.createdBy?._id)?.user;
            
            // Calculate the user's share in this expense
            const userShare = item.owedBy?.find(o => o.user?._id === user?._id)?.amount || 0;
            
            // Determine if this is paid/settled
            const isPaid = item.status === "settled" || 
              (item.owedBy?.find(o => o.user?._id === user?._id)?.status === "paid");
            
            return {
              id: item._id,
              // Determine the transaction type based on the structure
              type: item.paidBy && item.paidBy.length > 0 && item.owedBy && item.owedBy.length > 0 ? "expense" : 
                    (item.paidBy && item.paidBy.length === 1 && item.owedBy && item.owedBy.length === 1) ? "payment" : "expense",
              title: item.description || "N/A",
              amount: item.amount || 0,
              group: item.group?.name,
              groupId: item.group?._id,
              date: formatDateDisplay(item.date),
              timestamp: item.date,
              user: item.createdBy
                ? { 
                    id: item.createdBy._id,
                    name: item.createdBy.name,
                    avatar: item.createdBy.avatar || DEFAULT_AVATAR 
                  }
                : { 
                    id: "unknownUser", 
                    name: "Unknown User",
                    avatar: DEFAULT_AVATAR 
                  },
              participants: item.owedBy?.map((p) => ({
                id: p.user?._id,
                name: p.user?.name || "Unknown",
                avatar: p.user?.avatar || DEFAULT_AVATAR,
                share: p.amount || 0,
              })) || [],
              recipient: recipient ? {
                id: recipient._id,
                name: recipient.name || "Unknown",
                avatar: recipient.avatar || DEFAULT_AVATAR
              } : null,
              yourShare: userShare,
              isPaid: isPaid,
            };
          })
          // Show only the most recent activities (limit to 5)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        
        setActivities(formattedExpenses);
      } catch (err) {
        console.error("Failed to fetch recent activities:", err);
        setError("Failed to load recent activities");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [token, user]);

  // Helper function to render activity icon based on type
  const renderActivityIcon = (type) => {
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

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mint-500"></div>
          <span className="ml-3 text-gray-500 font-medium">Loading activities...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-error bg-opacity-5 rounded-xl">
          <Icon name="AlertCircle" size={40} className="mx-auto text-error mb-3" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button className="mt-3 text-sm text-mint-500 hover:text-mint-700 font-medium">Try Again</button>
        </div>
      ) : activities.length > 0 ? (
        activities.map((activity) => (
          <div 
            key={activity.id} 
            className="border-b border-gray-100 pb-5 last:border-0 last:pb-0 hover:bg-gray-50 p-3.5 -mx-3 rounded-lg transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-start">
              {/* Activity icon with appropriate styling based on type */}
              {activity.type === "expense" ? (
                <div className="w-14 h-14 rounded-xl bg-lavender-500 bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                  <Icon name="Receipt" size={22} className="text-lavender-500" />
                </div>
              ) : activity.type === "payment" ? (
                <div className="w-14 h-14 rounded-xl bg-mint-500 bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                  <Icon name="CreditCard" size={22} className="text-mint-500" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-success bg-opacity-10 flex items-center justify-center mr-4 shadow-sm">
                  <Icon name="CheckCircle" size={22} className="text-success" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 text-lg">{activity.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1.5">
                      {activity.group && activity.groupId && (
                        <>
                          <Link to={`/group-details-page/${activity.groupId}`} className="text-mint-500 hover:underline flex items-center">
                            <Icon name="Users" size={14} className="mr-1" />
                            {activity.group}
                          </Link>
                          <span className="mx-1.5">•</span>
                        </>
                      )}
                      <span className="flex items-center">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {activity.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 text-lg">{formatCurrency(activity.amount)}</p>
                    {activity.type === "expense" && activity.yourShare > 0 && (
                      <p className="text-sm font-medium px-2.5 py-1 bg-gray-100 rounded-full inline-block mt-1.5">
                        Your share: {formatCurrency(activity.yourShare)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    {activity.type === "expense" ? (
                      <>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <Image 
                              src={activity.user.avatar} 
                              alt={activity.user.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">{activity.user.name} paid</span>
                        </div>
                        
                        {activity.participants && activity.participants.length > 0 && (
                          <div className="ml-3 flex -space-x-2">
                            {activity.participants.slice(0, 3).map((participant) => (
                              <div key={participant.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                <Image 
                                  src={participant.avatar} 
                                  alt={participant.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {activity.participants.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                +{activity.participants.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : activity.recipient ? (
                      <>
                        <div className="flex items-center bg-white px-3.5 py-1.5 rounded-full shadow-sm">
                          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                            <Image 
                              src={activity.user.avatar} 
                              alt={activity.user.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Icon name="ArrowRight" size={16} className="mx-2.5 text-mint-500" />
                          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                            <Image 
                              src={activity.recipient.avatar} 
                              alt={activity.recipient.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  
                  <Link 
                    to={`/transactions-page/${activity.id}`} 
                    className="text-xs text-mint-500 font-medium hover:text-mint-700 transition-colors px-3.5 py-1.5 bg-white rounded-full shadow-sm flex items-center hover:shadow"
                  >
                    Details
                    <Icon name="ChevronRight" size={14} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="bg-white w-20 h-20 mx-auto rounded-full shadow-sm flex items-center justify-center mb-4">
            <Icon name="Calendar" size={36} className="text-gray-300" />
          </div>
          <h3 className="text-gray-800 font-medium text-lg mb-2">No Recent Activity</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You don't have any recent transactions to display</p>
          <Link 
            to="/add-expense-page" 
            className="inline-flex items-center px-5 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors shadow-sm"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Add Your First Expense
          </Link>
        </div>
      )}

      {activities.length > 0 && (
        <div className="text-center pt-5 border-t border-gray-100 mt-6">
          <Link 
            to="/transactions-page" 
            className="inline-flex items-center px-5 py-2.5 text-mint-500 hover:text-white hover:bg-mint-500 font-medium rounded-lg border border-mint-500 transition-all hover:shadow-sm"
          >
            View all transactions
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;