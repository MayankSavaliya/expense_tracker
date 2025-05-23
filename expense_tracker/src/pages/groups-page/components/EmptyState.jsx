import React from "react";
import Icon from "../../../components/AppIcon";

const EmptyState = ({ onCreateGroup, isFiltered, onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-xl shadow-md border border-gray-100">
      {isFiltered ? (
        <>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-inner">
            <Icon name="Search" size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No matching groups found</h3>
          <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
            We couldn't find any groups that match your current filters. Try adjusting your search criteria or clear the filters to see all your groups.
          </p>
          <button
            onClick={onClearFilters}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 shadow-sm hover:shadow font-medium"
          >
            <Icon name="RefreshCw" size={18} className="inline mr-2" />
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lavender-200 to-lavender-500 flex items-center justify-center mb-6 shadow-lg">
            <Icon name="Users" size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No groups yet</h3>
          <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
            Create your first group to start tracking shared expenses with friends, roommates, or travel companions. It makes splitting costs easy and stress-free.
          </p>
          <button
            onClick={onCreateGroup}
            className="px-6 py-3 bg-gradient-to-r from-lavender-500 to-mint-500 hover:from-lavender-700 hover:to-mint-700 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-1 font-medium"
          >
            <Icon name="Plus" size={18} className="inline mr-2" />
            Create Your First Group
          </button>
          <div className="mt-8 flex flex-col items-center">
            <div className="text-lavender-500 mb-2">
              <Icon name="Info" size={20} />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Groups help you organize expenses with different people in your life.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EmptyState;