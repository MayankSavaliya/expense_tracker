import React, { useState, useContext } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./AppIcon";
import NotificationsPanel from "../pages/notifications-panel";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: "LayoutDashboard" },
    { path: "/groups-page", name: "Groups", icon: "Users" },
    { path: "/friends-page", name: "Friends", icon: "UserPlus" },
    { path: "/transactions-page", name: "Transactions", icon: "Receipt" },
    { path: "/settlements-page", name: "Settlements", icon: "ArrowLeftRight" },
    { path: "/analytics-page", name: "Analytics", icon: "BarChart" },
    { path: "/profile-settings", name: "Settings", icon: "Settings" },
  ];

  const toggleNotificationsPanel = () => {
    setIsNotificationsPanelOpen(!isNotificationsPanelOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-10 border-r border-gray-100`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          {isSidebarOpen ? (
            <h1 className="text-xl font-semibold text-gray-800 flex items-center">
              <Icon name="Wallet" className="text-mint-500 mr-2.5" />
              ExpenseTracker
            </h1>
          ) : (
            <Icon name="Wallet" className="text-mint-500 mx-auto" size={28} />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name={isSidebarOpen ? "ChevronsLeft" : "ChevronsRight"} size={20} />
          </button>
        </div>

        <nav className="flex-1 py-5">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-5 py-3 ${
                      isActive
                        ? "bg-mint-500 bg-opacity-10 text-mint-700 font-medium border-r-4 border-mint-500" :"text-gray-600 hover:bg-gray-50"
                    } ${!isSidebarOpen && "justify-center"} transition-colors`
                  }
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={location.pathname === item.path ? "text-mint-500" : ""}
                  />
                  {isSidebarOpen && <span className="ml-3.5">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-5 border-t border-gray-100">
          <NavLink
            to="/add-expense-page"
            className="flex items-center justify-center bg-mint-500 hover:bg-mint-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all mb-3"
          >
            <Icon name="PlusCircle" size={18} />
            {isSidebarOpen && <span className="ml-2.5">Add Expense</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all w-full"
          >
            <Icon name="LogOut" size={18} />
            {isSidebarOpen && <span className="ml-2.5">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-100 h-16 flex items-center px-7 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none shadow-sm"
              />
              <Icon
                name="Search"
                size={18}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <button 
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
              onClick={toggleNotificationsPanel}
            >
              <Icon name="Bell" size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-lavender-500 flex items-center justify-center text-white font-medium shadow-sm">
                {user && user.name ? user.name.substring(0, 2).toUpperCase() : "GU"} 
              </div>
              <span className="ml-2.5 text-sm font-medium text-gray-700">
                {user && user.name ? user.name : "Guest User"}
              </span>
            </div>
          </div>
        </header> 

        {/* Page Content */}
        <main className="p-7">
          <Outlet />
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsPanelOpen} 
        onClose={() => setIsNotificationsPanelOpen(false)} 
      />
    </div>
  );
};

export default Layout;