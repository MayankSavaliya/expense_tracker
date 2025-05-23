import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import TransactionsList from "./components/TransactionsList";
import FilterPanel from "./components/FilterPanel";
import ExportOptions from "./components/ExportOptions";
import SearchBar from "./components/SearchBar";

const TransactionsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    dateRange: "all",
    group: "all",
    person: "all",
    type: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const filterDialogRef = useRef(null);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting transactions in ${format} format`);
    setShowExportOptions(false);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dateRange: "all",
      group: "all",
      person: "all",
      type: "all",
    });
    setSearchQuery("");
  };

  // Effect to manage dialog visibility based on state
  useEffect(() => {
    const dialogNode = filterDialogRef.current;
    if (dialogNode) {
      if (showFilterDialog) {
        dialogNode.showModal();
      } else {
        dialogNode.close();
      }
    }
  }, [showFilterDialog]);

  // Called by UI elements (e.g., 'X' button, FilterPanel's apply/close)
  const handleCloseFilterDialog = () => {
    setShowFilterDialog(false);
  };

  // Called by the "Filters" button
  const handleOpenFilterDialog = () => {
    setShowFilterDialog(true);
  };

  // Count active filters (excluding 'all' values)
  const activeFilterCount = Object.values(activeFilters).filter(
    (value) => value !== "all"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 bg-gradient-to-r from-mint-300 to-soft-blue-200 rounded-xl p-6 sm:p-8 shadow-lg border border-mint-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-12 h-12 rounded-lg bg-mint-500 flex items-center justify-center mr-4 shadow-md">
                <Icon name="FileText" size={22} className="text-white" />
              </span>
              Transactions
            </h1>
            <p className="text-gray-700 mt-2 ml-16">
              View and manage all your financial activities
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              to="/add-expense-page"
              className="inline-flex items-center px-5 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 hover:shadow-md transition-all shadow-sm font-medium"
            >
              <Icon name="Plus" size={18} className="mr-2.5" />
              Add Expense
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50 shadow-sm font-medium"
              >
                <Icon name="Download" size={18} className="mr-2.5" />
                Export
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`ml-2 text-gray-500 transition-transform duration-200 ${showExportOptions ? 'rotate-180' : ''}`}
                />
              </button>
              {showExportOptions && <ExportOptions onExport={handleExport} />}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="flex-1 mb-4 md:mb-0">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>
          <button
            onClick={handleOpenFilterDialog}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50 font-medium border border-gray-200 hover:border-gray-300 shadow-sm"
          >
            <Icon name="SlidersHorizontal" size={18} className="mr-2.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-mint-500 text-white text-xs rounded-full h-6 min-w-6 px-1.5 flex items-center justify-center font-bold shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Icon name="Filter" size={14} className="mr-1.5" />
              Active filters:
            </span>
            {Object.entries(activeFilters).map(
              ([key, value]) =>
                value !== "all" && (
                  <div
                    key={key}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-mint-50 text-sm text-mint-700 border border-mint-100 hover:bg-mint-100 transition-colors shadow-sm"
                  >
                    <span className="capitalize font-medium">
                      {key === "dateRange" ? "Date" : key}:{" "}
                      <span className="font-normal">{value.replace(/-/g, " ")}</span>
                    </span>
                    <button
                      onClick={() => handleFilterChange(key, "all")}
                      className="ml-2 text-mint-500 hover:text-mint-700 hover:bg-mint-200 rounded-full p-0.5"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                )
            )}
            <button
              onClick={clearAllFilters}
              className="text-mint-600 hover:text-mint-800 text-sm ml-1 py-1 px-2.5 hover:bg-mint-50 rounded-md transition-colors font-medium flex items-center"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Transactions Timeline */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-mint-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-mint-300 animate-spin animation-delay-150"></div>
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <Icon name="Wallet" size={20} className="text-mint-500" />
              </div>
            </div>
            <p className="text-center text-gray-500 mt-4 font-medium">
              Loading transactions...
            </p>
          </div>
        ) : (
          <TransactionsList
            filters={activeFilters}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Filter Drawer (Dialog) */}
      {showFilterDialog && (
        <dialog
          ref={filterDialogRef}
          className="modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClose={() => setShowFilterDialog(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-10 h-10 rounded-lg bg-mint-100 flex items-center justify-center mr-3 shadow-sm">
                    <Icon name="SlidersHorizontal" size={20} className="text-mint-600" />
                  </span>
                  Filter Transactions
                </h3>
                <button
                  onClick={handleCloseFilterDialog}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <FilterPanel
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClose={handleCloseFilterDialog}
              />
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TransactionsPage;