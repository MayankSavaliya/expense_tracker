import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transaction related API calls
export const transactionAPI = {
  getBalanceSummary: () => api.get('/api/transactions/summary'),
  getSimpleBalanceSummary: () => api.get('/api/transactions/simple-summary'),
  getTransactions: () => api.get('/api/transactions'),
  getTransactionById: (id) => api.get(`/api/transactions/${id}`),
  getBalanceBetweenUsers: (userId1, userId2) => api.get(`/api/transactions/debts/between/${userId1}/${userId2}`),
  createSettlement: (data) => api.post('/api/transactions/settlement', data),
};

// Expense related API calls
export const expenseAPI = {
  createExpense: (data) => api.post('/api/expenses', data),
  getMyExpenses: () => api.get('/api/expenses/my-expenses'),
  getExpenseById: (id) => api.get(`/api/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/api/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/api/expenses/${id}`),
  settleUp: (data) => api.post('/api/expenses/settle-up', data),
  getFriendExpenses: (friendId) => api.get(`/api/expenses/friend/${friendId}`),
};

// Group related API calls
export const groupAPI = {
  createGroup: (data) => api.post('/api/groups', data),
  getMyGroups: () => api.get('/api/groups/my-groups'),
  getGroupById: (id) => api.get(`/api/groups/${id}`),
  addMember: (groupId, data) => api.post(`/api/groups/${groupId}/members`, data),
  removeMember: (groupId, memberId) => api.delete(`/api/groups/${groupId}/members/${memberId}`),
  deleteGroup: (id) => api.delete(`/api/groups/${id}`),
};

// User related API calls
export const userAPI = {
  register: (data) => api.post('/api/users', data),
  login: (data) => api.post('/api/users/login', data),
  getUsers: () => api.get('/api/users'),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  requestPasswordReset: (data) => api.post('/api/users/reset-password-request', data),
  resetPassword: (data) => api.post('/api/users/reset-password', data),
};

// Friend related API calls
export const friendAPI = {
  // Get all friends
  getFriends: () => api.get('/api/friends'),
  
  // Send friend request
  sendFriendRequest: (data) => api.post('/api/friends/request', data),
  
  // Get incoming friend requests
  getIncomingRequests: () => api.get('/api/friends/incoming'),
  
  // Get outgoing friend requests
  getOutgoingRequests: () => api.get('/api/friends/outgoing'),
  
  // Accept friend request
  acceptFriendRequest: (requestId) => api.put(`/api/friends/accept/${requestId}`),
  
  // Reject friend request
  rejectFriendRequest: (requestId) => api.put(`/api/friends/reject/${requestId}`),
  
  // Remove friend
  removeFriend: (friendshipId) => api.delete(`/api/friends/${friendshipId}`),
  
  // Search users (potential friends)
  searchUsers: (query) => api.get(`/api/users/search?query=${query}`),
};

export default api;