import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getAuthUser } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  citizen: {
    id: 'usr_cit_ind_01',
    name: 'Rajesh Sharma',
    email: 'citizen.india@civicpulse.org',
    role: 'citizen',
    country_code: 'IND',
    country_name: 'India',
    district: 'Varanasi Rural, Uttar Pradesh',
    clearance_level: 'Verified Citizen Voice',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  government: {
    id: 'usr_gov_ind_01',
    name: 'Dr. Sunita Rao',
    email: 'director.infra@gov.in',
    role: 'government',
    country_code: 'IND',
    country_name: 'India',
    district: 'New Delhi Central',
    department: 'Ministry of Housing & Urban Infrastructure',
    clearance_level: 'Level 4 - National Infrastructure Director',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage or set default initial demo user
    const savedToken = localStorage.getItem('civicpulse_auth_token');
    const savedUser = localStorage.getItem('civicpulse_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setToken(null);
        setUser(null);
      }
    } else {
      // Default initial state: Citizen portal active
      const defaultUser = DEMO_USERS.citizen;
      const defaultToken = 'civic_token_citizen_usr_cit_ind_01';
      setUser(defaultUser);
      setToken(defaultToken);
      localStorage.setItem('civicpulse_auth_token', defaultToken);
      localStorage.setItem('civicpulse_auth_user', JSON.stringify(defaultUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'citizen') => {
    setLoading(true);
    try {
      const res = await loginUser(email, password, role);
      if (res && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('civicpulse_auth_token', res.token);
        localStorage.setItem('civicpulse_auth_user', JSON.stringify(res.user));
        setLoading(false);
        return { success: true, user: res.user };
      }
      throw new Error('Invalid credentials');
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await registerUser(payload);
      if (res && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('civicpulse_auth_token', res.token);
        localStorage.setItem('civicpulse_auth_user', JSON.stringify(res.user));
        setLoading(false);
        return { success: true, user: res.user };
      }
      throw new Error('Registration failed');
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicpulse_auth_token');
    localStorage.removeItem('civicpulse_auth_user');
  };

  const switchRoleDemo = (targetRole) => {
    const demoUser = DEMO_USERS[targetRole] || DEMO_USERS.citizen;
    const demoToken = `civic_token_${targetRole}_${demoUser.id}`;
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('civicpulse_auth_token', demoToken);
    localStorage.setItem('civicpulse_auth_user', JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
