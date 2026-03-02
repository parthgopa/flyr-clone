import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, signupUser, googleSignIn, verifyToken } from "../services/authApi";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  status?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on app launch
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      console.log("Checking stored authentication...");
      const storedToken = await AsyncStorage.getItem("auth_token");

      if (storedToken) {
        console.log("Token found, verifying...");
        const response = await verifyToken(storedToken);

        if (response.success) {
          setToken(storedToken);
          setUser(response.user);
          console.log("✓ User authenticated:", response.user.email);
        } else {
          // Token invalid, clear storage
          await AsyncStorage.removeItem("auth_token");
          console.log("✗ Token invalid, cleared storage");
        }
      } else {
        console.log("No stored token found");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await AsyncStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Logging in:", email);
      const response = await loginUser(email, password);

      if (response.success) {
        await AsyncStorage.setItem("auth_token", response.token);
        setToken(response.token);
        setUser(response.user);
        console.log("✓ Login successful:", response.user.email);
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    try {
      console.log("Signing up:", email);
      const response = await signupUser(name, email, phone, password);

      if (response.success) {
        await AsyncStorage.setItem("auth_token", response.token);
        setToken(response.token);
        setUser(response.user);
        console.log("✓ Signup successful:", response.user.email);
      } else {
        throw new Error(response.error || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      console.log("Google sign-in...");
      const response = await googleSignIn(idToken);

      if (response.success) {
        await AsyncStorage.setItem("auth_token", response.token);
        setToken(response.token);
        setUser(response.user);
        console.log("✓ Google sign-in successful:", response.user.email);
      } else {
        throw new Error(response.error || "Google sign-in failed");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      await AsyncStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
      console.log("✓ Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    login,
    signup,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
