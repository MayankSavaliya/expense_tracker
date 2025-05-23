import React from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const ExpensePreview = ({ formData, categories, currentUser }) => {
  const selectedCategory = categories.find(c => c.id === formData.category);
  
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].substring(0, 1).toUpperCase() + names[names.length - 1].substring(0, 1).toUpperCase();
  };

  const getPayerName = (userId) => {
    if (!userId) return "Not selected";
    if (currentUser && currentUser._id === userId) return "You";
    const participant = formData.participants.find(p => p.user._id === userId);
    return participant ? participant.user.name : "Unknown";
  };

  const getPayerAvatar = (userId) => {
    if (!userId) return null;
    const participant = formData.participants.find(p => p.user._id === userId);
    return participant ? participant.user.avatar : null;
  };

  const getPayerInitials = (userId) => {
    if (!userId) return "";
    const participant = formData.participants.find(p => p.user._id === userId);
    return participant ? getInitials(participant.user.name) : "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full ${selectedCategory?.color || 'bg-gray-200'} flex items-center justify-center`}>
          <Icon name={selectedCategory?.icon || 'QuestionMark'} size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{formData.title || "Untitled Expense"}</h3>
          <p className="text-sm text-gray-500">{selectedCategory?.name || "Uncategorized"}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="font-medium text-gray-900">${parseFloat(formData.amount || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Paid by</span>
          <div className="flex items-center">
            {formData.paidBy && formData.paidBy.length > 0 ? (
              formData.paidBy.length === 1 ? (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    {getPayerAvatar(formData.paidBy[0].user) ? (
                      <Image
                        src={getPayerAvatar(formData.paidBy[0].user)}
                        alt={getPayerName(formData.paidBy[0].user)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{getPayerInitials(formData.paidBy[0].user)}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{getPayerName(formData.paidBy[0].user)}</span>
                </>
              ) : (
                // Multiple payers display
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    {formData.paidBy.slice(0, 2).map((payer, index) => (
                      <div key={index} className="w-6 h-6 rounded-full overflow-hidden border border-white">
                        {getPayerAvatar(payer.user) ? (
                          <Image
                            src={getPayerAvatar(payer.user)}
                            alt={getPayerName(payer.user)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{getPayerInitials(payer.user)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {formData.paidBy.length > 2 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">+{formData.paidBy.length - 2}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Multiple payers</span>
                </div>
              )
            ) : (
              // Fallback to participants with isPayer=true if paidBy is empty but participants have payers
              formData.participants && formData.participants.some(p => p.isPayer) ? (
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {formData.participants.filter(p => p.isPayer).length > 1 ? 
                      "Multiple payers" : 
                      getPayerName(formData.participants.find(p => p.isPayer)?.user?._id)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Not selected</span>
              )
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Split method</span>
          <span className="font-medium text-gray-900 capitalize">{formData.splitMethod || "Equal"}</span>
        </div>
      </div>

      {formData.participants && formData.participants.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Split between</h4>
          <div className="space-y-2">
            {formData.participants.filter(p => p.isIncluded).map((participant) => {
              const isCurrentUser = currentUser && currentUser._id === participant.user._id;
              const participantName = isCurrentUser ? "You" : participant.user.name;
              const shareAmount = formData.splitMethod === "equal" 
                ? (parseFloat(formData.amount) / formData.participants.filter(p => p.isIncluded).length).toFixed(2)
                : participant.share || 0;

              return (
                <div key={participant.user._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      {participant.user.avatar && participant.user.avatar !== 'default_avatar_url' ? (
                        <Image
                          src={participant.user.avatar}
                          alt={participantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-lavender-500 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{getInitials(participant.user.name)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{participantName}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${shareAmount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {formData.notes && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
          <p className="text-sm text-gray-600">{formData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ExpensePreview;