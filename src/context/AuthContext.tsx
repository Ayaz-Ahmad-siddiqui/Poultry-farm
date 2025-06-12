import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  username: string;
  name: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, email: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("farm_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("farm_user");
      }
    }
  }, []);

  // Mock login function - in a real app, this would call an API
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // For demo purposes, accept any non-empty username/password
    if (username && password) {
      // Mock user data
      const userData: User = {
        username,
        name: username === "admin" ? "John Doe" : username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      };

      // Store user in localStorage
      localStorage.setItem("farm_user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };


    // Mock signup function - in a real app, this would call an API
  const signup = async (
    username: string,
    email:string,
    password: string,
  ): Promise<boolean> => {
    // For demo purposes, accept any non-empty username/password
    if (username && password) {
      // Mock user data
      const userData: User = {
        username,
        name: username === "admin" ? "John Doe" : username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      };

      // Store user in localStorage
      localStorage.setItem("farm_user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("farm_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup , logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
