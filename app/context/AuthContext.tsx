"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  name: string;
  email: string;
  role: "student" | "teacher";
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string, email: string, role: "student" | "teacher") => void;
  logout: () => void;
}

// Create context with a default value to avoid null issues
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user:data");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  function login(name: string, email: string, role: "student" | "teacher") {
    const userData = { name, email, role };
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user:data", JSON.stringify(userData));
      localStorage.setItem("user:name", name);
    }
  }

  function logout() {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user:data");
      localStorage.removeItem("user:name");
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: mounted && !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
