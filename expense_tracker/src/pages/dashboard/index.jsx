import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SummaryCard from "./components/SummaryCard";
import GroupCard from "./components/GroupCard";
import RecentActivity from "./components/RecentActivity";
import InsightCard from "./components/InsightCard";
import { useAuth } from "../../context/AuthContext";
import { transactionAPI, groupAPI } from "../../services/api";
import { group } from "d3";

const Dashboard = () => {
  const { user } = useAuth();
  const [balanceSummary, setBalanceSummary] = useState({
    youOwe: 0,
    youAreOwed: 0,
    netBalance: 0
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance summary
        const balanceResponse = await transactionAPI.getSimpleBalanceSummary();
        const { totalOwed, totalOwes, netBalance } = balanceResponse.data.data;
        setBalanceSummary({
          youOwe: totalOwes,
          youAreOwed: totalOwed,
          netBalance: netBalance
        });

        // Fetch groups
        const groupsResponse = await groupAPI.getMyGroups();
        setGroups(groupsResponse.data.data);
        console.log(groups);
        //print the gorups id
        groups.forEach(group => {
          console.log(group.name);
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const monthlySpendingData = [
    { name: "Jan", amount: 420 },
    { name: "Feb", amount: 380 },
    { name: "Mar", amount: 510 },
    { name: "Apr", amount: 350 },
    { name: "May", amount: 490 },
    { name: "Jun", amount: 610 },
    { name: "Jul", amount: 520 },
    { name: "Aug", amount: 750 },
    { name: "Sep", amount: 680 },
    { name: "Oct", amount: 590 },
    { name: "Nov", amount: 480 },
    { name: "Dec", amount: 620 }
  ];

  const insights = [
    {
      id: 1,
      title: "Spending Pattern",
      description: "Your highest expenses are on weekends, mostly on dining and entertainment.",
      icon: "TrendingUp"
    },
    {
      id: 2,
      title: "Frequent Co-payers",
      description: "You split expenses most often with Emily and Michael from your Roommates group.",
      icon: "Users"
    },
    {
      id: 3,
      title: "Settlement Suggestion",
      description: "Settling with Sarah would clear 3 outstanding balances at once.",
      icon: "Lightbulb"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">Error loading balance summary: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 bg-gradient-to-r from-mint-300 to-soft-blue-200 rounded-xl p-6 sm:p-8 shadow-lg border border-mint-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-12 h-12 rounded-lg bg-mint-500 flex items-center justify-center mr-4 shadow-md">
                <Icon name="Home" size={22} className="text-white" />
              </span>
              Dashboard
            </h1>
            <p className="text-gray-700 mt-2 ml-16">Welcome back, <span className="font-medium">{user?.name || 'User'}</span>! Here's your expense summary.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              to="/add-expense-page" 
              className="inline-flex items-center px-5 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 hover:shadow-md transition-all shadow-sm font-medium"
            >
              <Icon name="Plus" size={18} className="mr-2.5" />
              Add Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          title="You Are Owed" 
          amount={balanceSummary.youAreOwed} 
          icon="ArrowDownRight" 
          colorClass="text-white" 
          bgColorClass="bg-success"
          isPositive={true}
        />
        <SummaryCard 
          title="You Owe" 
          amount={balanceSummary.youOwe} 
          icon="ArrowUpRight" 
          colorClass="text-white" 
          bgColorClass="bg-error"
          isPositive={false}
        />
        <SummaryCard 
          title="Net Balance" 
          amount={Math.abs(balanceSummary.netBalance)} 
          icon="DollarSign" 
          colorClass="text-white" 
          bgColorClass={balanceSummary.netBalance >= 0 ? "bg-success" : "bg-error"}
          isPositive={balanceSummary.netBalance >= 0}
        />
      </div>

      {/* Active Groups Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="w-10 h-10 rounded-lg bg-lavender-500 flex items-center justify-center mr-3 shadow-sm">
              <Icon name="Users" size={20} className="text-white" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Active Groups</h2>
          </div>
          <Link 
            to="/groups-page" 
            className="text-mint-500 hover:text-mint-700 flex items-center px-4 py-2 rounded-lg hover:bg-mint-50 transition-all font-medium"
          >
            <span>View All</span>
            <Icon name="ChevronRight" size={16} className="ml-1.5" />
          </Link>
        </div>
        
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon name="Users" size={30} className="text-lavender-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">No Active Groups</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Create a group to start tracking shared expenses with friends or colleagues.</p>
            <Link 
              to="/groups-page" 
              className="inline-flex items-center px-5 py-2.5 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-all shadow-sm"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              New Group
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex space-x-5" style={{ minWidth: "max-content" }}>
              {groups.map((group) => (
                <GroupCard 
                  key={group._id} 
                  group={{
                    id: group._id,
                    name: group.name,
                    totalExpenses: group.totalExpenses,
                    yourBalance: group.yourBalance,
                    members: group.members.map(member => ({
                      id: member._id,
                      name: member.name,
                      avatar: member.avatar
                    })),
                    icon: group.icon || "Users",
                    iconBg: group.iconBg || "bg-mint-500",
                    lastActive: new Date(group.updatedAt).toLocaleDateString()
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-lg bg-mint-500 flex items-center justify-center mr-3 shadow-sm">
                  <Icon name="Clock" size={20} className="text-white" />
                </span>
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              </div>
              <Link 
                to="/transactions-page" 
                className="text-mint-500 hover:text-mint-700 flex items-center px-4 py-2 rounded-lg hover:bg-mint-50 transition-all font-medium"
              >
                <span>View All</span>
                <Icon name="ChevronRight" size={16} className="ml-1.5" />
              </Link>
            </div>
            <RecentActivity />
          </div>
        </div>

        {/* Quick Actions and Insights */}
        <div className="lg:col-span-1">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center mb-5">
              <span className="w-10 h-10 rounded-lg bg-warning bg-opacity-20 flex items-center justify-center mr-3 shadow-sm">
                <Icon name="Zap" size={18} className="text-warning" />
              </span>
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="space-y-3.5">
              <Link 
                to="/add-expense-page" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-xl hover:shadow-lg hover:from-mint-600 hover:to-mint-700 transition-all transform hover:-translate-y-0.5"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <Icon name="Plus" size={18} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium">Add Expense</span>
                </div>
                <Icon name="ChevronRight" size={18} className="text-white" />
              </Link>
              
              <Link 
                to="/settlements-page" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-soft-blue-500 to-soft-blue-600 text-white rounded-xl hover:shadow-lg hover:from-soft-blue-600 hover:to-soft-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <Icon name="ArrowLeftRight" size={18} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium">Settle All</span>
                </div>
                <Icon name="ChevronRight" size={18} className="text-white" />
              </Link>
              
              <Link 
                to="/groups-page" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:shadow-lg hover:from-lavender-600 hover:to-lavender-700 transition-all transform hover:-translate-y-0.5"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <Icon name="Users" size={18} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium">Manage Groups</span>
                </div>
                <Icon name="ChevronRight" size={18} className="text-white" />
              </Link>
            </div>
          </div>

          {/* Insights Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <span className="w-10 h-10 rounded-lg bg-warning bg-opacity-20 flex items-center justify-center mr-3 shadow-sm">
                <Icon name="Lightbulb" size={18} className="text-warning" />
              </span>
              <h2 className="text-xl font-semibold text-gray-800">Insights</h2>
            </div>
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spending Graph */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="w-10 h-10 rounded-lg bg-soft-blue-100 flex items-center justify-center mr-3 shadow-sm">
              <Icon name="BarChart2" size={20} className="text-soft-blue-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Monthly Spending</h2>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium">
              This Year
            </button>
            <button className="px-4 py-2 text-sm bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-all shadow-sm font-medium">
              Last 12 Months
            </button>
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  borderRadius: "0.75rem", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  padding: "12px" 
                }}
                formatter={(value) => [`$${value}`, "Amount"]}
                cursor={{ fill: 'rgba(78, 204, 163, 0.1)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="url(#colorGradient)" 
                radius={[8, 8, 0, 0]} 
                barSize={36}
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ECCA3" stopOpacity={1} />
                  <stop offset="100%" stopColor="#7EDFC0" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-mint-400 to-mint-600 mr-2"></div>
            <span className="text-gray-600 font-medium">Monthly Spending</span>
          </div>
          <div className="text-gray-700 px-4 py-1.5 bg-white rounded-full shadow-sm">
            <span className="font-semibold">Average: </span>
            ${Math.round(monthlySpendingData.reduce((sum, item) => sum + item.amount, 0) / monthlySpendingData.length)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;