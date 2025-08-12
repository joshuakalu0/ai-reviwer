"use client";
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { githubAPI, GitHubUser } from "@/lib/github";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("github_access_token");
      if (storedToken) {
        githubAPI.setAccessToken(storedToken);
        const userData = await githubAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken) => {
    setIsLoading(true);
    try {
      if (!accessToken) {
        throw new Error('No access token provided');
      }

      console.log('Attempting login with token...');
      githubAPI.setAccessToken(accessToken);
      const userData = await githubAPI.getCurrentUser();
      console.log('User data received:', userData.login);

      localStorage.setItem("github_access_token", accessToken);
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      // Clear any stored token on failure
      localStorage.removeItem("github_access_token");
      githubAPI.setAccessToken("");
      throw new Error(`Authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("github_access_token");
    setUser(null);
    githubAPI.setAccessToken("");
  };

  const refreshUser = async () => {
    if (!githubAPI.isAuthenticated()) {
      return;
    }

    try {
      const userData = await githubAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
