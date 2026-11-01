"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const ThemeContext = createContext(null);

export function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Restore the chosen theme and login session once the browser is ready.
    const savedTheme = window.localStorage.getItem("studiospace-theme");
    const nextTheme = savedTheme || "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;

    api("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("studiospace-theme", nextTheme);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AppProviders.");
  return value;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside AppProviders.");
  return value;
}
