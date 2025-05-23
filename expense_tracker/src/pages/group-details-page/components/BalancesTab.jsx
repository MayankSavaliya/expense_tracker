import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { Link, useParams } from "react-router-dom";
const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Format currency with proper sign display
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: amount < 0 ? 'always' : 'auto'
  }).format(amount);
};

// Generate a color for categories without one
const generateCategoryColor = (category) => {
  const colors = [
    '#4ECCA3', // mint
    '#A78BFA', // lavender
    '#60A5FA', // blue
    '#F59E0B', // amber
    '#EF4444', // red
    '#10B981', // emerald
    '#6366F1', // indigo
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#34D399', // green
  ];
  
  // Handle undefined or null category
  if (!category) {
    return colors[0]; // Default to first color
  }
  
  // Simple hash function to consistently assign a color
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const MemberCard = ({ member, user, toggleMember, isExpanded, data }) => {
  const isCurrentUser = member.id === user.id;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col transition-all duration-200 hover:shadow-md">
      {/* Member Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => toggleMember(member.id)}
      >
        <div className="flex items-center space-x-3">
          <img 
            src={member.avatar || DEFAULT_AVATAR} 
            alt={member.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium text-gray-900">
              {member.name}
              {isCurrentUser && ' (You)'}
            </h3>
            <p className={`text-sm ${member.balance > 0 ? 'text-success' : member.balance < 0 ? 'text-error' : 'text-gray-500'}`}>
              {member.balance > 0 
                ? `Is owed ${formatCurrency(member.balance)}`
                : member.balance < 0 
                ? `Owes ${formatCurrency(Math.abs(member.balance))}`
                : 'All settled up'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm text-gray-500">
            <div>Paid: {formatCurrency(member.paid || 0)}</div>
            <div>{member.balance > 0 ? 'Owed by others' : 'Owes to others'}: {formatCurrency(Math.abs(member.balance || 0))}</div>
          </div>
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="text-gray-400"
          />
        </div>
      </div>

      {/* Settlements Dropdown */}
      {isExpanded && member.settlements && member.settlements.length > 0 && (
        <div className="border-t border-gray-200 p-4 flex-grow">
          <h4 className="font-medium text-gray-800 mb-3">Settlement Details</h4>
          <div className="space-y-3">
            {member.settlements.map((settlement, index) => {
              const otherMember = data.members.find(m => m.id === settlement.id);
              if (!otherMember) return null;
              
              const amount = settlement.amount;
              // If current member balance is negative, they owe money
              const isOwing = member.balance < 0;

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={otherMember.avatar || DEFAULT_AVATAR} 
                      alt={otherMember.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{otherMember.name}</p>
                      <p className="text-sm text-gray-500">
                        {isOwing 
                          ? `${member.name} owes ${otherMember.name}`
                          : `${otherMember.name} owes ${member.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${isOwing ? 'text-error' : 'text-success'}`}>
                      {formatCurrency(amount)}
                    </span>
                    <Icon 
                      name={isOwing ? 'ArrowUpRight' : 'ArrowDownRight'} 
                      size={16} 
                      className={isOwing ? 'text-error' : 'text-success'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ categoryDistribution }) => {
  // Ensure categoryDistribution is valid and filter out invalid entries
  const validCategories = categoryDistribution.filter(category => 
    category && typeof category === 'object' && category.amount !== undefined);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Expense Categories</h3>
        <div className="space-y-4">
          {validCategories.map((category, index) => {
            const categoryName = category.category || category.name || 'Other';
            const color = category.color || generateCategoryColor(categoryName);
            const percentage = category.percentage ? `${Math.round(category.percentage)}%` : ''; 
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 font-medium capitalize">{categoryName}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(category.amount)} {percentage && <span className="text-gray-500 text-xs ml-1">({percentage})</span>}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: percentage || '0%',
                      backgroundColor: color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {validCategories.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BalancesTab = ({ data }) => {
  const { user } = useAuth();
  const { id: groupId } = useParams();
  const [expandedMember, setExpandedMember] = useState(null);

  const toggleMember = (memberId) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  if (!data || !data.members) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-1">No data available</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  // Calculate total expenses for percentage calculation if not already provided
  let totalExpenses = 0;
  if (data.categoryDistribution && data.categoryDistribution.length > 0) {
    if (!data.categoryDistribution[0].percentage) {
      totalExpenses = data.categoryDistribution.reduce((sum, cat) => sum + cat.amount, 0);
      // Add percentage to each category
      data.categoryDistribution = data.categoryDistribution.map(cat => ({
        ...cat,
        percentage: (cat.amount / totalExpenses) * 100
      }));
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Balances Summary</h2>
      
      {/* Two column layout for larger screens, stacked on mobile */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Members List */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Member Balances</h3>
          <div className="space-y-4">
            {data.members.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                user={user}
                toggleMember={toggleMember}
                isExpanded={expandedMember === member.id}
                data={data}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Category Distribution */}
        <div>
          {data.categoryDistribution && data.categoryDistribution.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Expense Categories</h3>
              <CategoryCard categoryDistribution={data.categoryDistribution} />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8 text-center">
              <Icon name="PieChart" size={40} className="mx-auto text-gray-300 mb-2" />
              <h4 className="text-base font-medium text-gray-800 mb-1">No category data</h4>
              <p className="text-gray-500">No expense categories have been recorded yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Settlement Suggestions - Show if there are any balances to settle */}
      {data.members.some(member => member.balance !== 0) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Suggested Settlements</h3>
          
          {/* Find members who owe money */}
          {data.members.some(member => member.balance < 0) ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {data.members.filter(member => member.balance < 0).map((debtor) => {
                  const creditors = debtor.settlements?.filter(settlement => settlement.amount > 0) || [];
                  
                  return creditors.length > 0 ? (
                    <div key={debtor.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center mb-3">
                        <img 
                          src={debtor.avatar || DEFAULT_AVATAR} 
                          alt={debtor.name} 
                          className="w-10 h-10 rounded-full mr-2"
                        />
                        <h4 className="font-medium text-gray-900">{debtor.name} should pay:</h4>
                      </div>
                      
                      <div className="ml-12 space-y-3">
                        {creditors.map((settlement, idx) => {
                          const creditor = data.members.find(m => m.id === settlement.id);
                          if (!creditor) return null;
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <img 
                                  src={creditor.avatar || DEFAULT_AVATAR} 
                                  alt={creditor.name} 
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                <span className="text-sm font-medium text-gray-800">{creditor.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-error">
                                  {formatCurrency(settlement.amount)}
                                </span>
                                <button className="ml-4 px-3 py-1 bg-mint-500 text-white text-xs rounded hover:bg-mint-600 transition-colors">
                                  Mark as Paid
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <Icon name="Check" size={40} className="mx-auto text-success mb-2" />
              <h4 className="text-lg font-medium text-gray-800 mb-1">All settled up!</h4>
              <p className="text-gray-600">There are no outstanding balances in this group.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalancesTab;