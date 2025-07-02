import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import TransactionDetails from './TransactionDetails';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    // Add keydown listener for escape key
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Focus trap and scroll lock
    const previouslyFocusedElement = document.activeElement;
    if (modalRef.current) {
      modalRef.current.focus();
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);
  
  if (!transaction) {
    return null;
  }

  // Determine accent color based on transaction type
  const accentColor = transaction.type === "expense" 
    ? "from-lavender-500 to-lavender-600" 
    : transaction.type === "payment" 
      ? "from-mint-500 to-mint-600" 
      : "from-green-500 to-green-600";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className={`h-3 w-full bg-gradient-to-r ${accentColor}`}></div>
        
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all"
            aria-label="Close transaction details"
          >
            <Icon name="X" size={20} />
          </button>
          <TransactionDetails transaction={transaction} />
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
