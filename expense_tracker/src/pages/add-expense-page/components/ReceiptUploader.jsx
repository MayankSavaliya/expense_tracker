import React, { useRef, useState } from "react";
import Icon from "../../../components/AppIcon";

const ReceiptUploader = ({ receipts, onChange }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newReceipts = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file
    }));
    
    onChange([...receipts, ...newReceipts]);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const newReceipts = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file
    }));
    
    onChange([...receipts, ...newReceipts]);
  };
  
  const handleRemoveReceipt = (id) => {
    const updatedReceipts = receipts.filter(receipt => receipt.id !== id);
    onChange(updatedReceipts);
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attach Receipt</h3>
      
      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-mint-500 bg-mint-500 bg-opacity-5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Icon name="Upload" size={32} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 mb-2">Drag and drop your receipt here</p>
        <p className="text-gray-500 text-sm mb-4">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-700 transition-colors focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-500">
          Supported formats: JPG, PNG, PDF (max 10MB)
        </p>
      </div>
      
      {/* Receipts Preview */}
      {receipts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Files</h4>
          <div className="space-y-2">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    <Icon 
                      name={receipt.type.startsWith('image') ? "Image" : "FileText"} 
                      size={20} 
                      className="text-gray-500" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{receipt.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(receipt.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveReceipt(receipt.id)}
                  className="text-gray-400 hover:text-error"
                >
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;