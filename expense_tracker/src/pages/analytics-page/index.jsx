import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, ZAxis
} from "recharts";
import DateRangePicker from "./components/DateRangePicker";
import AnalyticsCard from "./components/AnalyticsCard";
import TransactionsTable from "./components/TransactionsTable";
import InsightsSidebar from "./components/InsightsSidebar";

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for spending trends
  const spendingTrendsData = [
    { date: "Jan 1", total: 420, personal: 250, group: 170 },
    { date: "Jan 8", total: 380, personal: 200, group: 180 },
    { date: "Jan 15", total: 510, personal: 300, group: 210 },
    { date: "Jan 22", total: 350, personal: 150, group: 200 },
    { date: "Jan 29", total: 490, personal: 240, group: 250 },
    { date: "Feb 5", total: 610, personal: 350, group: 260 },
    { date: "Feb 12", total: 520, personal: 270, group: 250 },
    { date: "Feb 19", total: 750, personal: 400, group: 350 },
    { date: "Feb 26", total: 680, personal: 380, group: 300 },
    { date: "Mar 5", total: 590, personal: 290, group: 300 },
    { date: "Mar 12", total: 480, personal: 230, group: 250 },
    { date: "Mar 19", total: 620, personal: 320, group: 300 },
    { date: "Mar 26", total: 580, personal: 280, group: 300 }
  ];

  // Mock data for spending categories
  const categoryData = [
    { name: "Food & Dining", value: 1250, color: "#4ECCA3" },
    { name: "Rent & Utilities", value: 2100, color: "#A78BFA" },
    { name: "Entertainment", value: 580, color: "#60A5FA" },
    { name: "Transportation", value: 450, color: "#F59E0B" },
    { name: "Shopping", value: 720, color: "#EF4444" }
  ];

  // Mock data for co-payers
  const coPayers = [
    { name: "Emily Johnson", value: 850, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Michael Brown", value: 720, avatar: "https://randomuser.me/api/portraits/men/59.jpg" },
    { name: "Sarah Wilson", value: 520, avatar: "https://randomuser.me/api/portraits/women/63.jpg" },
    { name: "David Lee", value: 380, avatar: "https://randomuser.me/api/portraits/men/86.jpg" }
  ];

  // Mock data for monthly comparison
  const monthlyComparisonData = [
    { name: "Food", lastMonth: 420, thisMonth: 380 },
    { name: "Rent", lastMonth: 1200, thisMonth: 1200 },
    { name: "Utilities", lastMonth: 180, thisMonth: 210 },
    { name: "Transport", lastMonth: 150, thisMonth: 120 },
    { name: "Shopping", lastMonth: 280, thisMonth: 350 }
  ];

  // Mock data for group expenses
  const groupExpenseData = [
    { name: "Roommates", average: 450, frequency: 12, total: 5400 },
    { name: "Weekend Trip", average: 280, frequency: 8, total: 2240 },
    { name: "Lunch Club", average: 120, frequency: 16, total: 1920 },
    { name: "Office Party", average: 350, frequency: 4, total: 1400 }
  ];

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setChartData(spendingTrendsData);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const COLORS = ['#4ECCA3', '#A78BFA', '#60A5FA', '#F59E0B', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics</h1>
        <p className="text-gray-600">Visualize your spending patterns and financial insights.</p>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Spending Trends</h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="flex space-x-2">
              <button 
                onClick={() => handleTimeRangeChange("30days")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "30days" ?"bg-mint-500 text-white" :"bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Last 30 Days
              </button>
              <button 
                onClick={() => handleTimeRangeChange("3months")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "3months" ?"bg-mint-500 text-white" :"bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                3 Months
              </button>
              <button 
                onClick={() => handleTimeRangeChange("year")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "year" ?"bg-mint-500 text-white" :"bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Year
              </button>
              <button 
                onClick={() => handleTimeRangeChange("all")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "all" ?"bg-mint-500 text-white" :"bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Time
              </button>
            </div>
            
            <DateRangePicker onDateRangeChange={handleTimeRangeChange} />
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint-500"></div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                  formatter={(value) => [`$${value}`, "Amount"]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#4ECCA3" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="personal" 
                  stroke="#A78BFA" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Personal Spending"
                />
                <Line 
                  type="monotone" 
                  dataKey="group" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Group Contributions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Spending Categories */}
        <AnalyticsCard title="Top Spending Categories">
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Amount"]}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        {/* Most Frequent Co-payers */}
        <AnalyticsCard title="Most Frequent Co-payers">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={coPayers}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <image 
                          x={-30} 
                          y={-10} 
                          width={20} 
                          height={20} 
                          xlinkHref={coPayers.find(p => p.name === payload.value)?.avatar} 
                          clipPath="url(#clipCircle)" 
                        />
                        <text x={-5} y={4} textAnchor="end" fill="#666" fontSize={12}>
                          {payload.value}
                        </text>
                        <defs>
                          <clipPath id="clipCircle">
                            <circle cx={10} cy={10} r={10} />
                          </clipPath>
                        </defs>
                      </g>
                    );
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Amount"]}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                />
                <Bar dataKey="value" fill="#A78BFA" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        {/* Monthly Comparison */}
        <AnalyticsCard title="Monthly Comparison">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyComparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Amount"]}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="lastMonth" 
                  name="Last Month" 
                  fill="#60A5FA" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                />
                <Bar 
                  dataKey="thisMonth" 
                  name="This Month" 
                  fill="#4ECCA3" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        {/* Average Expense by Group */}
        <AnalyticsCard title="Average Expense by Group">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="frequency" 
                  name="Frequency" 
                  axisLine={false} 
                  tickLine={false}
                  label={{ value: 'Frequency', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="average" 
                  name="Average" 
                  axisLine={false} 
                  tickLine={false}
                  label={{ value: 'Average ($)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="total" 
                  range={[60, 400]} 
                  name="Total" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    if (name === "Average") return [`$${value}`, "Avg. Expense"];
                    if (name === "Frequency") return [value, "# of Expenses"];
                    if (name === "Total") return [`$${value}`, "Total Spent"];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    borderRadius: "0.5rem", 
                    border: "none", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                  wrapperStyle={{ zIndex: 100 }}
                  labelFormatter={(value) => {
                    const item = groupExpenseData.find(
                      (d) => d.frequency === value.frequency && d.average === value.average
                    );
                    return item ? item.name : "";
                  }}
                />
                <Scatter 
                  name="Groups" 
                  data={groupExpenseData} 
                  fill="#A78BFA"
                  shape={(props) => {
                    const { cx, cy, r } = props;
                    const item = groupExpenseData.find(
                      (d) => d.frequency === props.payload.frequency && d.average === props.payload.average
                    );
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={r} fill="#A78BFA" />
                        <text x={cx} y={cy} textAnchor="middle" fill="#fff" fontSize={10} dy=".3em">
                          {item?.name.substring(0, 2)}
                        </text>
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>
      </div>

      {/* Transactions and Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Transactions Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
              <Link to="/transactions-page" className="text-mint-500 hover:text-mint-700 flex items-center">
                <span>View All</span>
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Link>
            </div>
            <TransactionsTable />
          </div>
        </div>

        {/* Insights Sidebar */}
        <div className="lg:col-span-1">
          <InsightsSidebar />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center p-4 bg-mint-500 bg-opacity-10 rounded-md hover:bg-opacity-20 transition-all"
          >
            <Icon name="LayoutDashboard" size={20} className="text-mint-500 mr-2" />
            <span className="font-medium text-gray-800">Dashboard</span>
          </Link>
          
          <Link 
            to="/add-expense-page" 
            className="flex items-center justify-center p-4 bg-lavender-500 bg-opacity-10 rounded-md hover:bg-opacity-20 transition-all"
          >
            <Icon name="Plus" size={20} className="text-lavender-500 mr-2" />
            <span className="font-medium text-gray-800">Add Expense</span>
          </Link>
          
          <Link 
            to="/transactions-page" 
            className="flex items-center justify-center p-4 bg-soft-blue-500 bg-opacity-10 rounded-md hover:bg-opacity-20 transition-all"
          >
            <Icon name="Receipt" size={20} className="text-soft-blue-500 mr-2" />
            <span className="font-medium text-gray-800">Transactions</span>
          </Link>
          
          <button 
            className="flex items-center justify-center p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
            onClick={() => {
              // Export functionality would go here
              alert("Exporting analytics data...");
            }}
          >
            <Icon name="Download" size={20} className="text-gray-600 mr-2" />
            <span className="font-medium text-gray-800">Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;