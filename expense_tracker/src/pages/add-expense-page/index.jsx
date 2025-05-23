import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import Image from "../../components/AppImage";
import ExpenseForm from "./components/ExpenseForm";
import ExpensePreview from "./components/ExpensePreview";
import ExpenseTypeSelector from "./components/ExpenseTypeSelector";
import ReceiptUploader from "./components/ReceiptUploader";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { friendAPI, groupAPI } from "../../services/api";

const AddExpensePage = () => {
  const { user, token } = useAuth();
  const [expenseType, setExpenseType] = useState("group");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "USD",
    category: "",
    date: new Date(),
    paidBy: [], // Initialize as empty array rather than null
    splitMethod: "equal",
    participants: [],
    notes: "",
    isRecurring: false,
    recurringFrequency: "monthly",
    receipt: []
  });

  const categories = [
    { id: "groceries", name: "Groceries", icon: "ShoppingCart", color: "bg-mint-500" },
    { id: "dining", name: "Dining", icon: "Utensils", color: "bg-lavender-500" },
    { id: "transportation", name: "Transportation", icon: "Car", color: "bg-soft-blue-500" },
    { id: "entertainment", name: "Entertainment", icon: "Film", color: "bg-warning" },
    { id: "utilities", name: "Utilities", icon: "Zap", color: "bg-info" },
    { id: "rent", name: "Rent", icon: "Home", color: "bg-success" },
    { id: "travel", name: "Travel", icon: "Plane", color: "bg-error" },
    { id: "other", name: "Other", icon: "MoreHorizontal", color: "bg-gray-500" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        // Fetch groups using the existing API
        const groupsResponse = await groupAPI.getMyGroups();
        if (groupsResponse.data && groupsResponse.data.success) {
          setAvailableGroups(groupsResponse.data.data);
        }

        // Fetch friends using the dedicated friends API
        const friendsResponse = await friendAPI.getFriends();
        if (friendsResponse.data && friendsResponse.data.success) {
          setAvailableFriends(friendsResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    // No automatic payer selection - the user must explicitly select a payer
    // This useEffect is kept just to react to changes in user or expenseType
    // but doesn't set any default values
  }, [user, expenseType]);

  const handleExpenseTypeChange = (type) => {
    setExpenseType(type);
    setSelectedGroup(null);
    
    // Reset formData but maintain existing fields
    setFormData(prev => ({
      ...prev,
      participants: [],
      paidBy: [], // Initialize as empty array rather than null
      splitMethod: "equal",
    }));
    
    if (type === "personal" && user) {
      // For personal expenses, add the current user and their friends as participants
      // Ensure user data has all necessary properties
      const completeUserData = {
        _id: user._id,
        name: user.name || "You",
        email: user.email || "",
        avatar: user.avatar || "default_avatar_url"
      };
      
      const personalParticipants = [
        // Current user as participant but not automatically selected as payer
        {
          user: completeUserData,
          isIncluded: true,      // User is included by default
          isPayer: false,        // User is NOT automatically set as payer
          paidAmount: 0,
          share: 0,
          percentShare: 0
        }
      ];
      
      // Add friends if available
      if (Array.isArray(availableFriends) && availableFriends.length > 0) {
        availableFriends.forEach(friend => {
          // Ensure friend data has all necessary properties
          const completeFriendData = {
            _id: friend._id,
            name: friend.name || "Friend",
            email: friend.email || "",
            avatar: friend.avatar || "default_avatar_url"
          };
          
          personalParticipants.push({
            user: completeFriendData,
            isIncluded: false,
            isPayer: false,
            paidAmount: 0,
            share: 0,
            percentShare: 0
          });
        });
      }
      
      setFormData(prev => ({
        ...prev,
        participants: personalParticipants
      }));
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    const currentAmount = parseFloat(formData.amount) || 0;
    
    // Always include all members but don't set any default payer
    const initialParticipants = group.members && Array.isArray(group.members) ? group.members.map(member => {
      const isCurrentUserMember = user && user._id && member._id === user._id;
      
      // Ensure the member data is complete
      const completeUserData = {
        _id: member._id || `temp-${Math.random().toString()}`,
        name: member.name || "Unknown Member",
        email: member.email || "",
        avatar: member.avatar || "default_avatar_url",
        ...member
      };
      
      // Structure each participant with a user property
      return {
        user: completeUserData,  // Put complete member data inside a user property
        isIncluded: true,        // Everyone is included by default
        isPayer: false,          // No one is set as payer by default
        paidAmount: 0,
        share: 0,
        percentShare: 0
      };
    }) : [];

    // Create a default paidBy array with empty content
    // This ensures we always have the paidBy field initialized as an array
    // It will get populated when a payer is selected
    const initialPaidBy = []; 

    setFormData(prevFormData => ({
      ...prevFormData,
      participants: initialParticipants,
      paidBy: initialPaidBy,
      splitMethod: "equal",
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData(prevFormData => {
      let newFormData = { ...prevFormData, [field]: value };

      if (field === "participants") {
        const updatedParticipants = value; // This is the new array of participants
        const payers = updatedParticipants.filter(p => p.isPayer && p.user);
        
        if (payers.length === 1) {
          // Single payer - update paidBy to match
          const singlePayer = payers[0];
          newFormData.paidBy = [{ 
            user: singlePayer.user._id, 
            amount: singlePayer.paidAmount || parseFloat(prevFormData.amount) || 0 
          }];
        } else if (payers.length > 1) {
          // Multiple payers - create paidBy array with each payer
          newFormData.paidBy = payers.map(p => ({
            user: p.user._id,
            amount: p.paidAmount || 0
          }));
        } else {
          newFormData.paidBy = null; // No payers selected
        }
        
        // Ensure participant amounts are consistent if total amount changes
        if (prevFormData.amount !== newFormData.amount && payers.length === 1) {
          const singlePayer = payers[0];
          newFormData.participants = updatedParticipants.map(p => {
            if (p.user._id === singlePayer.user._id) {
              return {...p, paidAmount: parseFloat(newFormData.amount) || 0};
            }
            return p;
          });
          newFormData.paidBy = [{ 
            user: singlePayer.user._id, 
            amount: parseFloat(newFormData.amount) || 0 
          }];
        } else if (prevFormData.amount !== newFormData.amount && payers.length > 1) {
          // For multiple payers, update their amounts proportionally
          const totalPaid = payers.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
          const newAmount = parseFloat(newFormData.amount) || 0;
          
          if (totalPaid > 0) {
            // Update proportionally
            let updatedTotal = 0;
            newFormData.participants = updatedParticipants.map((p, index) => {
              if (p.isPayer && p.user) {
                const ratio = (parseFloat(p.paidAmount) || 0) / totalPaid;
                let newPayerAmount;
                
                if (index === payers.length - 1) {
                  // Last payer gets remaining amount to ensure total matches exactly
                  newPayerAmount = Math.round((newAmount - updatedTotal) * 100) / 100;
                } else {
                  newPayerAmount = Math.round(newAmount * ratio * 100) / 100;
                  updatedTotal += newPayerAmount;
                }
                
                return {...p, paidAmount: newPayerAmount};
              }
              return p;
            });
            
            // Update paidBy with new amounts
            newFormData.paidBy = payers.map((p, idx) => {
              const updatedP = newFormData.participants.find(up => up.user._id === p.user._id);
              return {
                user: p.user._id,
                amount: updatedP ? updatedP.paidAmount : 0
              };
            });
          }
        }

      } else if (field === "amount") {
        const newAmount = parseFloat(value) || 0;
        const currentParticipants = prevFormData.participants;
        const payers = Array.isArray(currentParticipants) ? currentParticipants.filter(p => p.isPayer && p.user) : [];

        if (payers.length === 1) {
          // Single payer - assign full amount to them
          const singlePayer = payers[0];
          newFormData.paidBy = [{ user: singlePayer.user._id, amount: newAmount }];
          newFormData.participants = currentParticipants.map(p => {
            if (p.user._id === singlePayer.user._id) {
              return { ...p, paidAmount: newAmount };
            }
            return p;
          });
        } else if (payers.length > 1) {
          // Multiple payers - distribute amount proportionally
          const totalCurrentlyPaid = payers.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
          
          if (totalCurrentlyPaid > 0) {
            // Distribute proportionally based on current shares
            newFormData.participants = currentParticipants.map(p => {
              if (p.isPayer && p.user) {
                const ratio = (parseFloat(p.paidAmount) || 0) / totalCurrentlyPaid;
                return { ...p, paidAmount: Math.round(newAmount * ratio * 100) / 100 };
              }
              return p;
            });
            
            // Update paidBy array for multiple payers
            newFormData.paidBy = payers.map(payer => {
              const updatedPayer = newFormData.participants.find(p => p.user._id === payer.user._id);
              return { 
                user: payer.user._id, 
                amount: updatedPayer ? updatedPayer.paidAmount : 0 
              };
            });
          } else {
            // Equal distribution if no amounts set previously
            const equalShare = Math.round((newAmount / payers.length) * 100) / 100;
            
            // Calculate the total first to handle rounding errors
            let totalAllocated = 0;
            newFormData.participants = currentParticipants.map((p, index) => {
              if (p.isPayer && p.user) {
                let payerAmount = equalShare;
                if (index === payers.length - 1) {
                  // Last payer gets remaining amount to account for rounding
                  payerAmount = Math.round((newAmount - totalAllocated) * 100) / 100;
                } else {
                  totalAllocated += equalShare;
                }
                return { ...p, paidAmount: payerAmount };
              }
              return p;
            });
            
            // Update paidBy array
            newFormData.paidBy = payers.map(payer => {
              const updatedPayer = newFormData.participants.find(p => p.user._id === payer.user._id);
              return { 
                user: payer.user._id, 
                amount: updatedPayer ? updatedPayer.paidAmount : 0 
              };
            });
          }
        } else {
          // No payers - clear paidBy if amount is zero or invalid
          if (newAmount <= 0) {
            newFormData.paidBy = null;
          }
        }
      } else if (field === "paidBy") {
        // This case should ideally not be directly called from ExpenseForm anymore for payer selection.
        // It might still be used if there were other ways to set paidBy directly.
        const newPaidBy = value;
        if (newPaidBy && newPaidBy.length === 1) {
          const singlePayerId = newPaidBy[0].user;
          const singlePayerAmount = newPaidBy[0].amount;
          newFormData.participants = prevFormData.participants.map(p => ({
            ...p,
            isPayer: p.user._id === singlePayerId,
            paidAmount: p.user._id === singlePayerId ? singlePayerAmount : 0,
          }));
        } else {
            // No single payer or paidBy cleared
            newFormData.participants = prevFormData.participants.map(p => ({
                ...p,
                isPayer: false,
                paidAmount: 0,
            }));
        }
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !user) {
      alert("Authentication error. Please log in again.");
      return;
    }

    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
      alert("Please fill in all required fields: Title, Amount, Category, and Date.");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const totalExpenseAmount = parseFloat(formData.amount);
    let paidByPayload = [];
    
    // Handle payers from participants with isPayer flag
    const payers = formData.participants.filter(p => p.isPayer && p.user);
    console.log("Processing payers:", payers);

    if (payers.length > 0) {
      // Process and normalize payer amounts
      const totalPaidAmount = payers.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
      console.log("Total paid amount:", totalPaidAmount, "Expense amount:", totalExpenseAmount);
      
      if (totalPaidAmount === 0) {
        // No amounts were specified - distribute equally
        const equalShare = Math.round((totalExpenseAmount / payers.length) * 100) / 100;
        let allocated = 0;
        
        paidByPayload = payers.map((p, index) => {
          let amount;
          if (index === payers.length - 1) {
            // Last payer gets remaining amount to ensure total is exact
            amount = Math.round((totalExpenseAmount - allocated) * 100) / 100;
          } else {
            amount = equalShare;
            allocated += equalShare;
          }
          
          return {
            user: p.user._id,
            amount: amount
          };
        });
      } else if (Math.abs(totalPaidAmount - totalExpenseAmount) > 0.01) {
        // Paid amount doesn't match total - normalize proportionally
        let allocated = 0;
        
        paidByPayload = payers.map((p, index) => {
          let amount;
          if (index === payers.length - 1) {
            // Last payer gets any remaining amount
            amount = Math.round((totalExpenseAmount - allocated) * 100) / 100;
          } else {
            // Scale amount proportionally
            const ratio = (parseFloat(p.paidAmount) || 0) / totalPaidAmount;
            amount = Math.round(totalExpenseAmount * ratio * 100) / 100;
            allocated += amount;
          }
          
          return {
            user: p.user._id,
            amount: amount
          };
        });
      } else {
        // Paid amount matches total - use as is with proper parsing
        paidByPayload = payers.map(p => ({ 
          user: p.user._id, 
          amount: parseFloat(p.paidAmount) || 0 
        }));
      }
      console.log("Final paidByPayload:", paidByPayload);
    } else if (formData.paidBy && formData.paidBy.length > 0) {
      console.log("Using existing paidBy:", formData.paidBy);
      // Use existing paidBy if available
      if (formData.paidBy.length === 1) {
        paidByPayload = [{ 
          user: formData.paidBy[0].user, 
          amount: totalExpenseAmount 
        }];
      } else {
        // Make sure to create a new array with properly formatted objects
        paidByPayload = formData.paidBy.map(payer => ({
          user: payer.user,
          amount: parseFloat(payer.amount) || 0
        }));
      }
      console.log("Final paidByPayload from formData.paidBy:", paidByPayload);        } else {
          // Check if participants has isPayer data we can use as fallback
          const participantPayers = formData.participants.filter(p => p.isPayer && p.user);
          if (participantPayers.length > 0) {
            // Use participant payer data to recreate paidByPayload
            paidByPayload = participantPayers.map(p => ({
              user: p.user._id,
              amount: parseFloat(p.paidAmount) || 0
            }));
            
            // Normalize the amounts to ensure they add up to total
            const totalAmount = paidByPayload.reduce((sum, p) => sum + p.amount, 0);
            if (Math.abs(totalAmount - totalExpenseAmount) > 0.01) {
              let allocated = 0;
              paidByPayload = paidByPayload.map((p, i) => {
                if (i === paidByPayload.length - 1) {
                  return { ...p, amount: Math.round((totalExpenseAmount - allocated) * 100) / 100 };
                } else {
                  const ratio = p.amount / totalAmount;
                  const newAmount = Math.round(totalExpenseAmount * ratio * 100) / 100;
                  allocated += newAmount;
                  return { ...p, amount: newAmount };
                }
              });
            }
            console.log("Recreated paidByPayload from participants:", paidByPayload);
          } else {
            // No payer selected - show clear error message
            alert("Please select who paid for the expense by clicking on a person in the 'Who Paid?' section.");
            return;
          }
        }

    // Final validation for total paid amount
    const totalPaidByAmount = paidByPayload.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    if (Math.abs(totalPaidByAmount - totalExpenseAmount) > 0.01) {
      alert(`The sum of amounts paid (${totalPaidByAmount.toFixed(2)}) by each person does not match the total expense amount (${totalExpenseAmount.toFixed(2)}). Please check the 'Paid by' details.`);
      return;
    }

    // Get included participants
    const includedParticipants = formData.participants.filter(p => p.isIncluded && p.user);
    if (includedParticipants.length === 0) {
      alert("Please include at least one participant in the split by checking their checkbox in the 'Split Method' section.");
      return;
    }

    let owedByPayload = [];
    if (includedParticipants.length > 0) {
      if (formData.splitMethod === "equal") {
        const shareAmount = parseFloat((totalExpenseAmount / includedParticipants.length).toFixed(2));
        let totalCalculated = 0;
        owedByPayload = includedParticipants.map((p, index) => {
          if (index === includedParticipants.length - 1) {
            return { user: p.user._id, amount: parseFloat((totalExpenseAmount - totalCalculated).toFixed(2)) };
          }
          totalCalculated += shareAmount;
          return { user: p.user._id, amount: shareAmount };
        });
      } else if (formData.splitMethod === "exact") {
        owedByPayload = includedParticipants.map(p => ({ 
          user: p.user._id, 
          amount: parseFloat(p.share) || 0 
        }));
        const totalExactShares = owedByPayload.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(totalExactShares - totalExpenseAmount) > 0.01) {
          alert("The sum of exact shares does not match the total expense amount.");
          return;
        }
      } else if (formData.splitMethod === "percent") {
        const totalPercentage = includedParticipants.reduce((sum, p) => sum + (parseFloat(p.percentShare) || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          alert("The sum of percentages must be equal to 100%.");
          return;
        }
        let totalCalculated = 0;
        owedByPayload = includedParticipants.map((p, index) => {
          const percentageShare = parseFloat(p.percentShare) || 0;
          let amountOwed = parseFloat(((totalExpenseAmount * percentageShare) / 100).toFixed(2));
          if (index === includedParticipants.length - 1) {
            amountOwed = parseFloat((totalExpenseAmount - totalCalculated).toFixed(2));
          } else {
            totalCalculated += amountOwed;
          }
          return { user: p.user._id, amount: amountOwed };
        });
      }
    } else if (expenseType === "personal") {
      // For personal expenses, the user both pays and owes the entire amount
      owedByPayload = [{ user: paidByPayload[0].user, amount: totalExpenseAmount }];
    }

    // Log the payers data right before creating the payload
  console.log("Final payers info for API request:", {
    paidByPayload,
    paidByFromForm: formData.paidBy,
    participantPayers: formData.participants.filter(p => p.isPayer)
  });

  const expensePayload = {
      description: formData.title,
      amount: totalExpenseAmount,
      category: formData.category,
      date: formData.date,
      paidBy: paidByPayload,
      owedBy: owedByPayload,
      splitType: formData.splitMethod,
      notes: formData.notes,
      group: expenseType === "group" && selectedGroup ? selectedGroup._id : null,
    };

    // Final validation of payload before sending
    if (!Array.isArray(expensePayload.paidBy) || expensePayload.paidBy.length === 0) {
      console.error("Critical error: paidBy is invalid", expensePayload.paidBy);
      alert("An error occurred while preparing the payers data. Please try selecting the payer again.");
      return;
    }

    console.log("Sending expense request with payload:", JSON.stringify(expensePayload));
    
    try {
      const response = await axios.post("http://localhost:5000/api/expenses", expensePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        alert("Expense added successfully!");
        setExpenseType("group");
        setSelectedGroup(null);
        setFormData({
          title: "",
          amount: "",
          currency: "USD",
          category: "",
          date: new Date(),
          paidBy: null, // No default payer
          splitMethod: "equal",
          participants: [],
          notes: "",
          isRecurring: false,
          recurringFrequency: "monthly",
          receipt: []
        });
      } else {
        alert("Failed to add expense: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting expense:", error.response ? error.response.data : error.message);
      alert("Error submitting expense: " + (error.response?.data?.message || error.message || "Network error"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 bg-gradient-to-r from-mint-300 to-soft-blue-200 rounded-xl p-6 sm:p-8 shadow-lg border border-mint-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-12 h-12 rounded-lg bg-mint-500 flex items-center justify-center mr-4 shadow-md">
                <Icon name="PlusCircle" size={22} className="text-white" />
              </span>
              Add Expense
            </h1>
            <p className="text-gray-700 mt-2 ml-16">Record a new expense to split with others</p>
          </div>
          <Link 
            to="/dashboard" 
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 text-mint-600 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all shadow-sm border border-mint-200"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100 transition-all hover:shadow-lg">
            <ExpenseTypeSelector 
              expenseType={expenseType} 
              onChange={handleExpenseTypeChange} 
            />

            {expenseType === "group" && (
              <div className="mt-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Group</label>
                {isLoadingData ? (
                  <div className="flex justify-center items-center h-20">
                    <Icon name="Loader" className="animate-spin h-6 w-6 text-mint-500" />
                  </div>
                ) : selectedGroup ? (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-all hover:border-mint-300 bg-gray-50">
                    <div className="flex items-center">
                      <div className="flex -space-x-3 mr-3">
                        {selectedGroup.members.slice(0, 3).map((member) => (
                          <div key={member._id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                            <Image 
                              src={member.avatar || '/assets/images/no_image.png'}
                              alt={member.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {selectedGroup.members.length > 3 && (
                          <div key="extra-members" className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                            +{selectedGroup.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{selectedGroup.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedGroup(null);
                        setFormData(prev => ({...prev, participants: [], paidBy: null }));
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableGroups.length > 0 ? (
                      <>
                        {availableGroups.map((group) => (
                          <button
                            key={group._id}
                            onClick={() => handleGroupSelect(group)}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-mint-400 hover:bg-mint-50 transition-all"
                          >
                            <div className="flex -space-x-3 mr-3">
                              {group.members.slice(0, 3).map((member) => (
                                <div key={member._id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                  <Image 
                                    src={member.avatar || '/assets/images/no_image.png'}
                                    alt={member.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {group.members.length > 3 && (
                                <div key="extra-members-list" className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                  +{group.members.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-gray-800">{group.name}</span>
                          </button>
                        ))}
                        <Link
                          key="create-group-link"
                          to="/groups-page"
                          className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-mint-400 hover:bg-mint-50 transition-all"
                        >
                          <span className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <Icon name="Plus" size={16} className="text-mint-600" />
                          </span>
                          <span className="text-mint-600 font-medium">Create New Group</span>
                        </Link>
                      </>
                    ) : (
                      <div className="col-span-2 bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                        <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="Users" size={24} className="text-mint-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No Groups Found</h3>
                        <p className="text-gray-600 mb-4">Create a group to start splitting expenses</p>
                        <Link
                          to="/groups-page"
                          className="inline-flex items-center px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-all shadow-sm"
                        >
                          <Icon name="Plus" size={16} className="mr-2" />
                          New Group
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(expenseType === "personal" || selectedGroup) && (
              <div className="animate-fade-in">
                <ExpenseForm 
                  formData={formData}
                  onChange={handleFormChange}
                  categories={categories}
                  group={selectedGroup}
                  expenseType={expenseType}
                  availableFriends={availableFriends}
                  currentUser={user}
                />
              </div>
            )}
          </div>

          {(expenseType === "personal" || selectedGroup) && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100 transition-all hover:shadow-lg animate-fade-in">
              <ReceiptUploader 
                receipts={formData.receipt}
                onChange={(receipts) => handleFormChange('receipt', receipts)}
              />
            </div>
          )}

          {(expenseType === "personal" || selectedGroup) && (
            <div className="flex justify-end space-x-4 animate-fade-in">
              <Link 
                to={selectedGroup ? `/group-details-page?id=${selectedGroup._id}` : "/dashboard"}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
              >
                Add Expense
              </button>
            </div>
          )}
        </div>

        {(expenseType === "personal" || selectedGroup) && formData.amount && (
          <div className="lg:col-span-1 animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border border-gray-100 transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-lg bg-mint-500 flex items-center justify-center mr-3 shadow-sm">
                  <Icon name="Eye" size={16} className="text-white" />
                </span>
                <h2 className="text-lg font-semibold text-gray-800">Expense Preview</h2>
              </div>
              <ExpensePreview 
                formData={formData}
                categories={categories}
                currentUser={user}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpensePage;