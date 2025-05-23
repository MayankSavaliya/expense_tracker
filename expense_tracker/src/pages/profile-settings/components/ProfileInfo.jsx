import React from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const ProfileInfo = ({ userData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
            <Image
              src={userData.avatar}
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-mint-500 text-white p-1 rounded-full shadow-sm hover:bg-mint-700 transition-colors">
            <Icon name="Camera" size={16} />
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
        <p className="text-gray-500 mb-4">{userData.username}</p>
        
        <div className="w-full border-t border-gray-100 pt-4 mt-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <p className="text-2xl font-semibold text-gray-800">{userData.stats.groups}</p>
              <p className="text-sm text-gray-500">Groups</p>
            </div>
            <div className="p-2 border-l border-r border-gray-100">
              <p className="text-2xl font-semibold text-gray-800">{userData.stats.friends}</p>
              <p className="text-sm text-gray-500">Friends</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-semibold text-gray-800">{userData.stats.transactions}</p>
              <p className="text-sm text-gray-500">Transactions</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <Icon name="Mail" size={16} className="text-gray-500 mr-2" />
          <span className="text-gray-700">{userData.email}</span>
        </div>
        <div className="flex items-center mb-3">
          <Icon name="Phone" size={16} className="text-gray-500 mr-2" />
          <span className="text-gray-700">{userData.phone}</span>
        </div>
        <div className="flex items-center mb-3">
          <Icon name="MapPin" size={16} className="text-gray-500 mr-2" />
          <span className="text-gray-700">{userData.location}</span>
        </div>
        <div className="flex items-center">
          <Icon name="Calendar" size={16} className="text-gray-500 mr-2" />
          <span className="text-gray-700">Joined {userData.joinDate}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;