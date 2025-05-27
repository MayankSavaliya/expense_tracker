import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Icon from "../../components/AppIcon";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

import ExpensesTab from "./components/ExpensesTab";
import BalancesTab from "./components/BalancesTab";
import ChartsTab from "./components/ChartsTab";
import MembersTab from "./components/MembersTab";
import GroupSettingsTab from "./components/GroupSettingsTab";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GroupDetailsPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [balancesData, setBalancesData] = useState(null);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setError("Group ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Set authorization header
        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch group details
        const groupResponse = await axios.get(`${API_BASE_URL}/api/groups/${groupId}`, { headers });

        if (!groupResponse.data.success) {
          throw new Error(groupResponse.data.error || "Failed to fetch group details");
        }

        const group = groupResponse.data.data;

        // Fetch group balances
        const balancesResponse = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/balances`, { headers });

        if (!balancesResponse.data.success) {
          throw new Error(balancesResponse.data.error || "Failed to fetch group balances");
        }

        const balances = balancesResponse.data.data;
        // Transform the data to match the frontend structure
        const transformedData = {
          id: group._id,
          name: group.name,
          description: group.description,
          icon: "Home",
          iconBg: "bg-lavender-500",
          createdAt: new Date(group.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          currency: "USD",
          totalExpenses: group.expenses?.length || 0,
          // Save creator data for membership management
          creator: group.creator,
          yourBalance: balances.members?.find(member => member.id === user?._id)?.balance || 0,
          members: group.members?.map(member => ({
            id: member._id,
            name: member.name,
            avatar: member.avatar || '',
            role: member._id === group.creator?._id ? "Admin" : "Member",
            isYou: member._id === user?._id
          })) || [],
          expenses: group.expenses?.map(expense => ({
            id: expense._id,
            title: expense.description,
            amount: expense.amount,
            date: expense.date,
            category: expense.category,
            categoryIcon: getCategoryIcon(expense.category),
            paidBy: expense.paidBy?.map(payment => ({
              id: payment.user._id,
              name: payment.user.name,
              avatar: payment.user.avatar || '',
              amount: payment.amount
            })) || [],
            owedBy: expense.owedBy?.map(debt => ({
              id: debt.user._id,
              name: debt.user.name,
              avatar: debt.user.avatar || '',
              amount: debt.amount
            })) || [],
            notes: expense.notes,
            receiptImage: expense.receiptImage
          })) || [],
          balances: balances.balances?.map(balance => ({
            from: balance.from,
            to: balance.to,
            amount: balance.amount
          })) || [],
          categoryDistribution: balances.categoryDistribution || [],
          memberExpenses: balances.memberExpenses || []
        };
        // console.log(balances);
        setGroupData(transformedData);
        setBalancesData(balances);
      } catch (err) {
        console.error('Error fetching group data:', err);
        setError(err.response?.data?.error || err.message || "Failed to fetch group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, user, token]);

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Drink': 'Utensils',
      'Shopping': 'ShoppingCart',
      'Housing': 'Home',
      'Transportation': 'Car',
      'Entertainment': 'Film',
      'Utilities': 'Wifi',
      'Health': 'Heart',
      'Travel': 'Plane',
      'Other': 'MoreHorizontal'
    };
    return icons[category] || 'MoreHorizontal';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: amount < 0 ? 'always' : 'auto'
    }).format(amount);
  };

  // Tabs configuration
  const tabs = [
    { id: "expenses", label: "Expenses", icon: "Receipt" },
    { id: "balances", label: "Balances", icon: "ArrowLeftRight" },
    { id: "charts", label: "Charts", icon: "PieChart" },
    { id: "members", label: "Members", icon: "Users" },
    { id: "settings", label: "Group Settings", icon: "Settings" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-mint-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Users" size={20} className="text-mint-500" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading group details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-100">
          <div className="w-16 h-16 mx-auto bg-error bg-opacity-10 rounded-full flex items-center justify-center mb-6">
            <Icon name="AlertCircle" size={32} className="text-error" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Error loading group</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/groups-page')}
            className="px-5 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-700 transition-all shadow-sm flex items-center mx-auto"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Icon name="Search" size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Group not found</h3>
          <p className="text-gray-600 mb-6">The group you're looking for doesn't exist or you don't have access to it.</p>
          <button 
            onClick={() => navigate('/groups-page')}
            className="px-5 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-700 transition-all shadow-sm flex items-center mx-auto"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm mb-6">
        <Link to="/dashboard" className="text-gray-500 hover:text-mint-500 transition-colors flex items-center">
          <Icon name="Home" size={14} className="mr-1" />
          Dashboard
        </Link>
        <Icon name="ChevronRight" size={14} className="mx-2 text-gray-400" />
        <Link to="/groups-page" className="text-gray-500 hover:text-mint-500 transition-colors">Groups</Link>
        <Icon name="ChevronRight" size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-700 font-medium">{groupData.name}</span>
      </div>

      {/* Group Header with Hero Banner */}
      <div className="mb-8">
        <div className={`bg-gradient-to-r from-lavender-200 to-mint-300 rounded-xl p-6 sm:p-8 shadow-md`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center">
              <div className={`w-16 h-16 rounded-xl shadow-md ${groupData.iconBg} flex items-center justify-center mr-5`}>
                <Icon name={groupData.icon} size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{groupData.name}</h1>
                <p className="text-gray-700 mt-1">{groupData.description || "Shared expenses group"}</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className="text-sm font-medium text-gray-700">Created on {groupData.createdAt}</p>
              <div className="mt-2 px-4 py-2 bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">YOUR BALANCE</p>
                <p className={`text-xl font-bold ${groupData.yourBalance >= 0 ? "text-success" : "text-error"}`}>
                  {formatCurrency(groupData.yourBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link 
          to={`/add-expense-page?groupId=${groupId}`}
          className="inline-flex items-center px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-700 transition-all shadow-sm hover:shadow"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Expense
        </Link>
        <Link 
          to={`/settlements-page?groupId=${groupId}`}
          className="inline-flex items-center px-4 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-700 transition-all shadow-sm hover:shadow"
        >
          <Icon name="ArrowLeftRight" size={16} className="mr-2" />
          Settle Up
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-4 border-b border-gray-200">
          <nav className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-4 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "text-mint-600 border-b-2 border-mint-500"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon name={tab.icon} size={18} className={`mr-2 ${activeTab === tab.id ? "text-mint-600" : "text-gray-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "expenses" && <ExpensesTab groupId={groupId} />}
          {activeTab === "balances" && (
            <BalancesTab 
              data={balancesData}
            />
          )}
          {activeTab === "charts" && <ChartsTab categoryDistribution={groupData.categoryDistribution} memberExpenses={groupData.memberExpenses} />}
          {activeTab === "members" && (
            <MembersTab 
              members={groupData.members} 
              creator={groupData.creator} 
              currentUser={user} 
              groupId={groupId}
              token={token}
            />
          )}
          {activeTab === "settings" && <GroupSettingsTab groupId={groupId} />}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsPage;