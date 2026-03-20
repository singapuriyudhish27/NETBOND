"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load via API
    const checkUserLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/login/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Update user state with data from server
        setUser({
          _id: data.user._id,
          username: data.user.username,
          email_id: data.user.email_id,
        });
        
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          message: data?.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { 
        success: false, 
        message: 'Something went wrong. Please try again later.' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data?.message || 'Registration failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Registration Error:', error);
      return { 
        success: false, 
        message: 'Something went wrong. Please try again later.' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/login/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Update state
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Value object that will be passed to any consumer components
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}