import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const FriendCard = ({ friend, onRemoveFriend }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const menuRef = useRef(null);
  
  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);
  
  // Format currency
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  }).format(friend.balance || 0);

  // Determine balance color
  const balanceColor = friend.balance > 0 
    ? "text-success" 
    : friend.balance < 0 
      ? "text-error" : "text-gray-600";

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-100 shadow-sm ring-2 ring-white">
          <Image 
            src={friend.avatar} 
            alt={friend.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-base">{friend.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {friend.lastActivity ? `Last active: ${friend.lastActivity}` : 'Friend'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="mr-4 text-right">
          <p className="text-xs text-gray-500 mb-0.5">Balance</p>
          <p className={`font-semibold ${balanceColor} whitespace-nowrap`}>{formattedBalance}</p>
        </div>
        
        <div className="flex space-x-1.5">
          <button className="p-2 rounded-full hover:bg-mint-50 active:bg-mint-100 transition-all group" title="View shared expenses">
            <Icon name="Receipt" size={16} className="text-gray-600 group-hover:text-mint-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-mint-50 active:bg-mint-100 transition-all group" title="Settle up">
            <Icon name="ArrowLeftRight" size={16} className="text-gray-600 group-hover:text-mint-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-mint-50 active:bg-mint-100 transition-all group" title="Add expense">
            <Icon name="Plus" size={16} className="text-gray-600 group-hover:text-mint-600" />
          </button>
          <div className="relative" ref={menuRef}>
            <button 
              className={`p-2 rounded-full ${showMenu ? 'bg-mint-100 text-mint-600' : 'hover:bg-mint-50 active:bg-mint-100'} transition-all group`}
              title="More options"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Icon name="MoreVertical" size={16} className={`${showMenu ? 'text-mint-600' : 'text-gray-600 group-hover:text-mint-600'}`} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden animate-fadeIn">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-mint-50 active:bg-mint-100 transition-all flex items-center">
                    <Icon name="MessageSquare" size={15} className="mr-2.5 text-mint-500" />
                    Message
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-mint-50 active:bg-mint-100 transition-all flex items-center">
                    <Icon name="BellOff" size={15} className="mr-2.5 text-mint-500" />
                    Mute notifications
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-mint-50 active:bg-mint-100 transition-all flex items-center"
                    onClick={() => {
                      if (onRemoveFriend) {
                        setIsRemoving(true);
                        onRemoveFriend(friend.id);
                        setShowMenu(false);
                      }
                    }}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <>
                        <Icon name="Loader" size={15} className="mr-2.5 text-mint-500 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Icon name="UserMinus" size={15} className="mr-2.5 text-mint-500" />
                        Remove friend
                      </>
                    )}
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-red-50 active:bg-red-100 transition-all flex items-center">
                    <Icon name="Ban" size={15} className="mr-2.5" />
                    Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;