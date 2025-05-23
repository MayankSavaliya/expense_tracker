import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const ChartsTab = ({ categoryDistribution, memberExpenses }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-700">{formatCurrency(payload[0].value)}</p>
          <p className="text-gray-500 text-sm">
            {Math.round((payload[0].value / categoryDistribution.reduce((sum, item) => sum + item.value, 0)) * 100)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{payload[0].payload.name}</p>
          <div className="mt-1">
            <p className="text-mint-500">
              <span className="font-medium">Paid:</span> {formatCurrency(payload[0].value)}
            </p>
            <p className="text-lavender-500">
              <span className="font-medium">Owed:</span> {formatCurrency(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Expense Categories</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => (
                    <span className="text-gray-800">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500">
              Total Expenses: {formatCurrency(categoryDistribution.reduce((sum, item) => sum + item.value, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Member Expenses Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Member Expenses</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={memberExpenses}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="paid" name="Paid" fill="#4ECCA3" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="owed" name="Owed" fill="#A78BFA" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-mint-500 rounded-full mr-1"></div>
              <span className="text-sm text-gray-600">Paid</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-lavender-500 rounded-full mr-1"></div>
              <span className="text-sm text-gray-600">Owed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Expense Trend</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: "Jan", amount: 420 },
                  { month: "Feb", amount: 380 },
                  { month: "Mar", amount: 510 },
                  { month: "Apr", amount: 350 },
                  { month: "May", amount: 490 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Amount"]}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#60A5FA" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsTab;