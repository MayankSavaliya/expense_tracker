import React from 'react';
import Icon from './AppIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  loadingText = 'Loading...',
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  ...props 
}) => {
  // Base classes
  const baseClasses = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-mint-500 hover:bg-mint-600 text-white focus:ring-mint-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 focus:ring-mint-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    link: 'bg-transparent text-mint-500 hover:text-mint-600 hover:underline focus:ring-0',
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2', 
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  };
  
  // Disabled classes
  const disabledClasses = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${disabledClasses} ${widthClass} ${className} flex items-center justify-center`}
      {...props}
    >
      {loading && (
        <Icon name="Loader" size={16} className="mr-2 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon name={icon} size={16} className="mr-2" />
      )}
      
      <span>{loading ? loadingText : children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={16} className="ml-2" />
      )}
    </button>
  );
};

export default Button;
