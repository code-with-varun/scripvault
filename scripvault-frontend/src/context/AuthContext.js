import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:3001'; // Make sure this matches your backend server's address

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });
  const [authMessage, setAuthMessage] = useState(''); // For displaying login/logout/registration messages

  // Effect to handle initial authentication check and redirect
  useEffect(() => {
    if (user && user.token) {
      // If user is logged in, and not already on dashboard, navigate to dashboard
      if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
        navigate('/dashboard');
      }
    } else {
      // If no user/token, ensure they are on login/signup page if not already
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        navigate('/login');
      }
    }
  }, [user, navigate]);

  const login = async (email, password) => {
    setAuthMessage(''); // Clear previous messages
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const loggedInUser = { email, token: data.token };
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setAuthMessage('Login successful! Redirecting...');
        // Navigation handled by useEffect
      } else {
        setAuthMessage(data.message || 'Login failed. Please check your credentials.');
        console.error('Login error:', data.message);
      }
    } catch (error) {
      setAuthMessage('Network error or server unavailable.');
      console.error('Login fetch error:', error);
    }
    setTimeout(() => setAuthMessage(''), 3000);
  };

  const register = async (formData) => { // New register function
    setAuthMessage(''); // Clear previous messages
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send all form data
      });

      const data = await response.json();

      if (response.ok) {
        setAuthMessage('Registration successful! Please log in.');
        // Optionally, automatically log in the user after successful registration
        // await login(formData.email, formData.password);
        navigate('/login'); // Redirect to login page after successful registration
      } else {
        setAuthMessage(data.message || 'Registration failed. Please try again.');
        console.error('Registration error:', data.message);
      }
    } catch (error) {
      setAuthMessage('Network error or server unavailable.');
      console.error('Registration fetch error:', error);
    }
    setTimeout(() => setAuthMessage(''), 3000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setAuthMessage('Logged out successfully.');
    navigate('/login');
    setTimeout(() => setAuthMessage(''), 3000);
  };

  const getToken = () => user?.token;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, getToken, authMessage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
