import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  loading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // <-- This is the magic fix!

  useEffect(() => {
    // On refresh, check local storage before rendering the app
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      // Make sure the token is actually a real token, not a glitchy "undefined" string
      if (token && token !== 'undefined' && token !== 'null' && savedUser && savedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser?.role === 'admin');
        } catch (error) {
          console.error("Failed to parse user from local storage", error);
        }
      }
      // Tell the app it is done checking, so it can safely render the screens
      setLoading(false); 
    };

    initAuth();
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAdmin(userData?.role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};