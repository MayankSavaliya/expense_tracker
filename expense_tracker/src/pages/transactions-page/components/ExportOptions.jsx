import React from "react";
import Icon from "../../../components/AppIcon";

const ExportOptions = ({ onExport }) => {
  const exportFormats = [
    { id: "pdf", name: "PDF Document", icon: "FileText", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-100" },
    { id: "csv", name: "CSV Spreadsheet", icon: "FileSpreadsheet", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-100" },
    { id: "excel", name: "Excel Spreadsheet", icon: "FileSpreadsheet", color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-100" }
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg z-10 py-2 border border-gray-200 animate-fadeIn overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <span className="w-7 h-7 rounded-lg bg-mint-50 flex items-center justify-center mr-2.5 shadow-sm border border-mint-100">
            <Icon name="Download" size={14} className="text-mint-600" />
          </span>
          Export Options
        </h3>
      </div>
      <div className="p-2.5">
        {exportFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => onExport(format.id)}
            className="w-full text-left px-3.5 py-3 flex items-center hover:bg-gray-50 text-sm text-gray-700 rounded-lg transition-all mb-1.5 last:mb-0 hover:shadow-sm border border-transparent hover:border-gray-200"
          >
            <div className={`w-10 h-10 rounded-lg ${format.bgColor} flex items-center justify-center mr-3.5 shadow-sm border ${format.borderColor}`}>
              <Icon name={format.icon} size={18} className={format.color} />
            </div>
            <div>
              <span className="font-medium">{format.name}</span>
              <span className="block text-xs text-gray-500 mt-1">Export all filtered transactions</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExportOptions;