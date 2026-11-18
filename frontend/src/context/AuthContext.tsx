import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  role: 'ADMIN' | 'OPERATOR';
  username: string;
  login: (token: string, role: 'ADMIN' | 'OPERATOR', username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: 'ADMIN',
  username: 'admin',
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token') || 'demo_token_123');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>((localStorage.getItem('user_role') as any) || 'ADMIN');
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || 'admin');

  const login = (newToken: string, newRole: 'ADMIN' | 'OPERATOR', newUsername: string) => {
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_role', newRole);
    localStorage.setItem('username', newUsername);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
