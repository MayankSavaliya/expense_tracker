import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MembersTab = ({ members, creator, currentUser, groupId, token }) => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };
  
  // Determine member activity based on the current member data
  // In a real implementation, this would come from the API
  const getMemberActivity = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return {
      lastActive: "Recently", // This would come from backend in a real app
      expenseCount: member?.expenseCount || 0,
      totalPaid: member?.totalPaid || 0
    };
  };

  // Handle add member form submission
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Call the API to add a member
      const response = await axios.post(
        `${API_BASE_URL}/api/groups/${groupId}/members`, 
        { email: newMemberEmail },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        toast.success(`Invitation sent to ${newMemberEmail}`);
        setNewMemberEmail("");
        setShowAddMemberForm(false);
        
        // In a real app, we would refresh the members list
        // window.location.reload();
      } else {
        toast.error(response.data.error || "Failed to add member");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Group Members ({members.length})</h3>
        <button 
          className="inline-flex items-center px-3 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-700 transition-colors"
          onClick={() => setShowAddMemberForm(!showAddMemberForm)}
        >
          <Icon name={showAddMemberForm ? "X" : "UserPlus"} size={16} className="mr-1" />
          {showAddMemberForm ? "Cancel" : "Add Member"}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMemberForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h4 className="text-base font-medium text-gray-800 mb-3">Invite a new member</h4>
          <form onSubmit={handleAddMember}>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-700 transition-colors disabled:bg-gray-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              An email invitation will be sent with instructions to join this group.
            </p>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expenses
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => {
              const activity = getMemberActivity(member.id);
              const isCreator = creator && creator._id === member.id;
              const isCurrentUser = currentUser && currentUser._id === member.id;
              
              return (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <Image 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name} {isCurrentUser && <span className="text-xs text-gray-500">(You)</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isCreator ?'bg-lavender-500 bg-opacity-10 text-lavender-700' :'bg-gray-100 text-gray-800'
                    }`}>
                      {isCreator ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.expenseCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(activity.totalPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {!isCurrentUser && (
                        <>
                          <button className="text-gray-400 hover:text-gray-500">
                            <Icon name="Mail" size={16} />
                          </button>
                          {currentUser && creator && currentUser._id === creator._id && !isCreator && (
                            <button 
                              className="text-red-400 hover:text-red-500" 
                              onClick={() => {
                                if (confirm(`Remove ${member.name} from this group?`)) {
                                  // This would call the API to remove the member in a real application
                                  // removeMember(member.id);
                                  toast.success(`${member.name} has been removed from the group`);
                                }
                              }}
                            >
                              <Icon name="UserMinus" size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Member Permissions Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-base font-medium text-gray-800 mb-2">Member Permissions</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <Icon name="Check" size={16} className="text-mint-500 mr-2 mt-0.5" />
            <span>All members can add expenses and view the group's transaction history</span>
          </li>
          <li className="flex items-start">
            <Icon name="Check" size={16} className="text-mint-500 mr-2 mt-0.5" />
            <span>All members can edit or delete expenses they created</span>
          </li>
          <li className="flex items-start">
            <Icon name="Check" size={16} className="text-mint-500 mr-2 mt-0.5" />
            <span>Only admins can remove members or change group settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MembersTab;