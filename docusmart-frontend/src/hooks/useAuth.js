import { useState, useCallback } from 'react';
import axios from 'axios';

const TOKEN_KEY = 'docusmart_token';
const USER_KEY = 'docusmart_user';
const API_BASE = 'http://localhost:8000';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // LOGIN — calls POST /auth/login, stores token
  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(access_token);
    setUser(userData || null);
    return res.data;
  }, []);

  // REGISTER — calls POST /auth/register, stores token
  const register = useCallback(async (email, password, full_name) => {
    const res = await axios.post(`${API_BASE}/auth/register`, { email, password, full_name });
    const { access_token, user: userData } = res.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(access_token);
    setUser(userData || null);
    return res.data;
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, login, register, logout };
}
