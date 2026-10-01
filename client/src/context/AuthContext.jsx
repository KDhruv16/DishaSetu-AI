import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('dishasetu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dishasetu_token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user details & profile on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dishasetu_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('dishasetu_user', JSON.stringify(res.data.user));

            // Fetch candidate profile if already onboarded and user is a candidate
            if (res.data.user.isOnboarded && res.data.user.role === 'user') {
              try {
                const profileRes = await api.get('/profile');
                if (profileRes.data?.success) {
                  setProfile(profileRes.data.profile);
                }
              } catch (profileErr) {
                console.warn('Profile fetch note:', profileErr.message);
              }
            }
          }
        } catch (err) {
          console.error('Session verify error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('dishasetu_token', token);
        localStorage.setItem('dishasetu_user', JSON.stringify(user));
        setToken(token);
        setUser(user);

        if (user.isOnboarded && user.role === 'user') {
          try {
            const profileRes = await api.get('/profile');
            if (profileRes.data?.success) {
              setProfile(profileRes.data.profile);
            }
          } catch (e) {
            // ignore
          }
        }
        return { success: true, user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('dishasetu_token', token);
        localStorage.setItem('dishasetu_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const saveOnboarding = async (onboardingData) => {
    try {
      const res = await api.post('/profile/onboarding', onboardingData);
      if (res.data?.success) {
        setProfile(res.data.profile);
        const updatedUser = { ...user, isOnboarded: true };
        setUser(updatedUser);
        localStorage.setItem('dishasetu_user', JSON.stringify(updatedUser));
        return { success: true, profile: res.data.profile };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save onboarding profile.';
      return { success: false, message: msg };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data?.success) {
        setProfile(res.data.profile);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  const demoLogin = async () => {
    try {
      const res = await api.post('/auth/demo-login');
      if (res.data?.success) {
        const { token, user } = res.data;
        localStorage.setItem('dishasetu_token', token);
        localStorage.setItem('dishasetu_user', JSON.stringify(user));
        setToken(token);
        setUser(user);

        if (user.role === 'user') {
          try {
            const profileRes = await api.get('/profile');
            if (profileRes.data?.success) {
              setProfile(profileRes.data.profile);
            }
          } catch (e) {
            // ignore
          }
        }
        return { success: true, user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Demo login failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('dishasetu_token');
    localStorage.removeItem('dishasetu_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        login,
        demoLogin,
        register,
        logout,
        saveOnboarding,
        refreshProfile,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
