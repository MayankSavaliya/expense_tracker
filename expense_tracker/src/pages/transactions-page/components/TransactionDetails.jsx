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

  // Helper to format date and time
  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-1">
      {/* Header Section */}
      <div className="flex items-start mb-8">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mr-5 shadow-lg flex-shrink-0 
          ${transaction.type === "expense" 
            ? "bg-gradient-to-br from-lavender-400 to-lavender-600" 
            : transaction.type === "payment" 
              ? "bg-gradient-to-br from-mint-400 to-mint-600" 
              : "bg-gradient-to-br from-green-400 to-green-600"}
        `}>
          <Icon 
            name={transaction.type === "expense" ? "Receipt" : transaction.type === "payment" ? "CreditCard" : "CheckCircle"} 
            size={32} 
            className="text-white"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">{transaction.title}</h2>
          <p className={`text-3xl font-bold ${transaction.amount >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
            {formatCurrency(transaction.amount)}
          </p>
          <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2">
            <div className="flex items-center mr-3 mb-1">
              <Icon name="Calendar" size={14} className="mr-1.5" />
              <span>{formatDateTime(transaction.date)}</span>
            </div>
            {transaction.group && transaction.groupId && (
              <Link 
                to={`/group-details-page/${transaction.groupId}`} 
                className="text-mint-600 hover:text-mint-700 hover:underline flex items-center mb-1"
              >
                <Icon name="Users" size={14} className="mr-1" />
                {transaction.group}
              </Link>
            )}
          </div>
        </div>
        <span className={`flex-shrink-0 text-sm px-4 py-2 rounded-full font-semibold whitespace-nowrap shadow-sm
          ${transaction.isPaid 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-amber-100 text-amber-800 border border-amber-200'}`}
        >
          {transaction.isPaid ? 'Paid' : 'Pending'}
        </span>
      </div>

      {/* Payer & Participants Information */}
      {transaction.type === "expense" && (
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <Icon name="Users" size={16} className="mr-2 text-gray-500" />
            Participants
          </h5>
          <div className="bg-gray-50 p-5 rounded-xl space-y-4 border border-gray-100 shadow-sm">
            {transaction.payers && transaction.payers.length > 0 && (
              <div className="flex items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex -space-x-2 mr-3">
                  {transaction.payers.slice(0, 3).map((payer, index) => (
                    <div key={`payer-detail-${index}`} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                      <Image src={payer.avatar} alt={payer.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {transaction.payers.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow">
                      +{transaction.payers.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-500 block">Paid by</span>
                  <span className="font-medium text-gray-800">
                    {transaction.payers.length === 1 
                      ? transaction.payers[0].name 
                      : `${transaction.payers[0].name} and ${transaction.payers.length - 1} other${transaction.payers.length > 2 ? 's' : ''}`}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-800">{formatCurrency(transaction.amount)}</span>
              </div>
            )}
            {transaction.participants && transaction.participants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Split between {transaction.participants.length} people</p>
                  <span className="text-xs text-mint-600 bg-mint-50 px-2 py-1 rounded-full">Equal Split</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {transaction.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-mint-200 transition-colors">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border-2 border-white shadow">
                          <Image src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{participant.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(participant.share)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Flow (for payments/settlements) */}
      {(transaction.type === "payment" || transaction.type === "settlement") && transaction.user && transaction.recipient && (
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <Icon name="Repeat" size={16} className="mr-2 text-gray-500" />
            Payment Flow
          </h5>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-md mb-2 bg-white">
                  <Image src={transaction.user.avatar} alt={transaction.user.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-gray-700">{transaction.user.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">Sender</span>
              </div>
              
              <div className="flex flex-col items-center mx-2">
                <div className="relative w-32 h-0.5 bg-mint-300 my-4">
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-mint-500 rounded-full p-1.5">
                    <Icon name="ArrowRight" size={18} className="text-white" />
                  </div>
                </div>
                <div className="bg-mint-50 text-mint-700 font-medium px-3 py-1 rounded-md text-sm border border-mint-200 shadow-sm">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-md mb-2 bg-white">
                  <Image src={transaction.recipient.avatar} alt={transaction.recipient.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-gray-700">{transaction.recipient.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">Recipient</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transaction Date</span>
                <span className="font-medium text-gray-800">{formatDateTime(transaction.date)}</span>
              </div>
              {transaction.isPaid && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes section */}
      {transaction.notes && (
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <Icon name="FileText" size={16} className="mr-2 text-gray-500" />
            Notes
          </h5>
          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm whitespace-pre-wrap">{transaction.notes}</p>
        </div>
      )}
      
      {/* Receipt image */}
      {transaction.receipt && (
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <Icon name="Image" size={16} className="mr-2 text-gray-500" />
            Receipt
          </h5>
          <div className="relative group w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 shadow-sm cursor-pointer">
            <Image 
              src={transaction.receipt} 
              alt="Receipt" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button 
                onClick={() => window.open(transaction.receipt, '_blank')} 
                className="p-3 bg-white bg-opacity-80 rounded-full shadow-xl hover:bg-opacity-100 transition-all transform hover:scale-110 focus:outline-none"
                aria-label="View full receipt"
              >
                <Icon name="ZoomIn" size={24} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
        {transaction.type === "expense" && (
          <>
            <Link 
              to={`/add-expense-page?edit=${transaction.id}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-mint-500 rounded-lg text-sm font-medium text-white hover:bg-mint-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
            >
              <Icon name="Edit3" size={16} className="mr-2" />
              Edit Expense
            </Link>
            <Link
              to={`/settlements-page?settle=${transaction.id}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-lavender-500 rounded-lg text-sm font-medium text-white hover:bg-lavender-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-opacity-50"
            >
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Mark as Settled
            </Link>
          </>
        )}
        
        {(transaction.type === "payment" || transaction.type === "settlement") && (
          <>
            <button className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-mint-50 hover:bg-mint-100 text-mint-700 rounded-lg text-sm font-medium transition-all border border-mint-200 hover:border-mint-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-30">
              <Icon name="DownloadCloud" size={16} className="mr-2" />
              Download Receipt
            </button>
            <button className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-all border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50">
              <Icon name="Share2" size={16} className="mr-2" />
              Share
            </button>
          </>
        )}
        
        <button className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all border border-red-100 hover:border-red-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-30 mt-2 sm:mt-0">
          <Icon name="Trash2" size={16} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TransactionDetails;