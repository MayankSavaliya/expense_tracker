import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null); // Changed: Added export
const API_BASE_URL = 'http://localhost:5000/api/users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(`${API_BASE_URL}/profile`);
          setUser(response.data.data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      // console.log(response);
      // const newToken= response.data.token; // Assuming backend sends token
      // const userData = response.data.data; // Assuming backend sends user data

      const { token: newToken, data: userData } = response.data; // Assuming backend sends token and user
      console.log(userData);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData || null); // Adjust if user data is not directly in response.data.user
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/`, { name, email, password });
      // Assuming registration does not automatically log in the user.
      // If it does, handle token and user state here similar to login.
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
