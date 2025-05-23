import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-100',
          icon: 'CheckCircle',
          iconColor: 'text-green-500',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          icon: 'AlertCircle',
          iconColor: 'text-red-500',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-100',
          icon: 'AlertTriangle',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          bg: 'bg-mint-50',
          border: 'border-mint-100',
          icon: 'Info',
          iconColor: 'text-mint-500',
          textColor: 'text-mint-800'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div 
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 min-w-[300px] max-w-md 
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-center
        transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <Icon name={styles.icon} size={20} className={`${styles.iconColor} mr-3 shrink-0`} />
      <p className={`${styles.textColor} text-sm flex-1`}>{message}</p>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(), 300);
        }}
        className={`ml-3 p-1.5 rounded-full hover:bg-white/50 ${styles.iconColor} shrink-0`}
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

export default Toast;
