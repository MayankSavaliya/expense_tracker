import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const TransactionDetails = ({ transaction }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      {/* Notes section */}
      {transaction.notes && (
        <div className="mb-5">
          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Icon name="FileText" size={15} className="mr-2 text-gray-500" />
            Notes
          </h5>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{transaction.notes}</p>
        </div>
      )}
      
      {/* Split details for expenses */}
      {transaction.type === "expense" && transaction.participants && (
        <div className="mb-5">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Icon name="Users" size={15} className="mr-2 text-gray-500" />
            Split Details
          </h5>
          <div className="space-y-2.5 bg-gray-50 p-3 rounded-lg">
            {transaction.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border-2 border-white shadow-sm">
                    <Image 
                      src={participant.avatar} 
                      alt={participant.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{participant.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                  {formatCurrency(participant.share)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Receipt image */}
      {transaction.receipt && (
        <div className="mb-5">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Icon name="Image" size={15} className="mr-2 text-gray-500" />
            Receipt
          </h5>
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
            <Image 
              src={transaction.receipt} 
              alt="Receipt" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <button className="p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <Icon name="ZoomIn" size={20} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2.5 mt-4 bg-gray-50 p-3 rounded-lg">
        {transaction.type === "expense" && (
          <>
            <Link 
              to={`/add-expense-page?edit=${transaction.id}`}
              className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:shadow"
            >
              <Icon name="Edit" size={15} className="mr-2 text-gray-500" />
              Edit
            </Link>
            <button className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:shadow">
              <Icon name="MessageSquare" size={15} className="mr-2 text-gray-500" />
              Comment
            </button>
          </>
        )}
        
        {transaction.type === "expense" && (
          <Link 
            to={`/settlements-page?transaction=${transaction.id}`}
            className="inline-flex items-center px-4 py-2 bg-mint-500 rounded-lg text-sm font-medium text-white hover:bg-mint-600 transition-all shadow-sm hover:shadow-md"
          >
            <Icon name="CreditCard" size={15} className="mr-2" />
            Settle Up
          </Link>
        )}
        
        {(transaction.type === "payment" || transaction.type === "settlement") && (
          <button className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:shadow">
            <Icon name="FileText" size={15} className="mr-2 text-gray-500" />
            View Receipt
          </button>
        )}
        
        <button className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-error hover:bg-error-50 transition-all border border-gray-200 shadow-sm hover:shadow ml-auto">
          <Icon name="Trash2" size={15} className="mr-2 text-error" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TransactionDetails;