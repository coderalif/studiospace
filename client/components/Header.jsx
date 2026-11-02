"use client";

import Link from "next/link";
import { Aperture, LogOut, Menu, Moon, Plus, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth, useTheme } from "./AppProviders";

export function Header() {
  const { user, setUser, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Show account pages only after the current session has been restored.
  const links = [
    ["Studios", "/studios"],
    ["How it works", "/#how-it-works"],
    ...(user
      ? [
          ["Profile settings", "/profile"],
          ["My bookings", "/my-bookings"],
          ["My listings", "/my-listings"],
          ["Saved studios", "/saved-studios"],
        ]
      : []),
  ];

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      setMenuOpen(false);
      toast.success("You’re signed out. See you next time.");
      router.push("/");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="StudioSpace home">
          <span className="brand-mark">
            <Aperture size={23} strokeWidth={2.2} />
          </span>
          <span>
            studio<span className="brand-light">space</span>
          </span>
        </Link>
        <nav
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          {user && (
            <Link
              className="mobile-host-link"
              href="/add-studio"
              onClick={() => setMenuOpen(false)}
            >
              <Plus size={16} /> Host a space
            </Link>
          )}
          {user && (
            <button className="mobile-logout" onClick={logout}>
              <LogOut size={15} /> Sign out
            </button>
          )}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {!authLoading &&
            (user ? (
              <>
                <Link className="host-link" href="/add-studio">
                  <Plus size={16} /> Host a space
                </Link>
                <Link
                  className="avatar-link"
                  href="/profile"
                  title="Profile settings"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" />
                  ) : (
                    user.name?.slice(0, 1).toUpperCase()
                  )}
                </Link>
                <button
                  className="logout-button"
                  onClick={logout}
                  aria-label="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link className="button button-dark header-login" href="/login">
                Log in
              </Link>
            ))}
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
