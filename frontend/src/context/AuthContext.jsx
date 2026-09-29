import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/http';
import jwtDecode from 'jwt-decode';
import { getApiUrl, ENDPOINTS } from '../utils/config';
const AuthContext = createContext();
const client = axios;
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('user'));
      const payload = saved?.token ? jwtDecode(saved.token) : null;
      if (payload?.exp * 1000 > Date.now()) setUser(saved);
      else localStorage.removeItem('user');
    } catch { localStorage.removeItem('user'); }
    setLoading(false);
    // Wake a sleeping backend while the user fills in the form.
    client.get(getApiUrl('/health')).catch(() => {});
  }, []);
  const authenticate = async (endpoint, body) => {
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await client.post(getApiUrl(endpoint), body);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Server is taking too long to respond. Please retry shortly.' : 'Unable to reach the server. Please try again.');
      setError(message);
      throw new Error(message);
    } finally { setSubmitting(false); }
  };
  const register = data => authenticate(ENDPOINTS.REGISTER, data);
  const login = (email, password) => authenticate(ENDPOINTS.LOGIN, { email: email.trim(), password });
  const googleLogin = credential => authenticate(ENDPOINTS.GOOGLE_AUTH, { credential });
  const logout = useCallback(() => { localStorage.removeItem('user'); setUser(null); }, []);
  const handleAuthError = useCallback(err => { if (err.response?.status === 401) logout(); }, [logout]);
  const clearError = () => setError(null);
  return <AuthContext.Provider value={{ user, setUser, loading, submitting, error, register, login, googleLogin, logout, clearError, handleAuthError }}>{children}</AuthContext.Provider>;
};
export default AuthContext;
