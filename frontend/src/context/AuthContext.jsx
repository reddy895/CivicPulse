import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

// Demo users for quick access
export const DEMO_USERS = {
  citizen: {
    id: 'usr_citizen_demo',
    name: 'Rajesh Sharma',
    email: 'citizen@civicpulse.local',
    role: 'citizen',
    country_code: 'IND',
    country_name: 'India',
    district: 'Bengaluru Urban',
    clearance_level: null,
  },
  government: {
    id: 'usr_gov_demo',
    name: 'Dr. Sunita Rao',
    email: 'govdemo@civicpulse.local',
    role: 'government',
    country_code: 'IND',
    country_name: 'India',
    department: 'Ministry of Housing & Urban Infrastructure',
    clearance_level: 'Level 4 - National Director',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('cp_token');
      const savedUser = localStorage.getItem('cp_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');
    }
    setLoading(false);
  }, []);

  const _persist = (tokenVal, userVal) => {
    localStorage.setItem('cp_token', tokenVal);
    localStorage.setItem('cp_user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  };

  const login = async (email, password, role = 'citizen') => {
    try {
      const res = await loginUser(email, password, role);
      _persist(res.token, res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (payload) => {
    try {
      const res = await registerUser(payload);
      _persist(res.token, res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const loginAsDemo = (role) => {
    const demoUser = DEMO_USERS[role] || DEMO_USERS.citizen;
    const demoToken = `demo_tok_${Date.now()}`;
    _persist(demoToken, demoUser);
    return demoUser;
  };

  const logout = () => {
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    setToken(null);
    setUser(null);
  };

  // Legacy: used by old components
  const switchRoleDemo = (role) => loginAsDemo(role);

  const isAuthenticated = !!user && !!token;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{
      user, token, role, loading,
      isAuthenticated,
      login, register, logout,
      loginAsDemo, switchRoleDemo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
