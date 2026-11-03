"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Aperture, LogOut, Menu, Moon, Plus, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth, useTheme } from "./AppProviders";

export function Header() {
  const { user, setUser, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  }

  function handleMouseLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300);
  }

  function handleAvatarClick() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen((prev) => !prev);
  }

  function isActive(path) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      setMenuOpen(false);
      setDropdownOpen(false);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Failed to logout");
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="StudioSpace">
          <span className="brand-mark">
            <Aperture size={22} strokeWidth={2.2} />
          </span>
          <span>
            studio<span className="brand-light">space</span>
          </span>
        </Link>

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
          <Link
            href="/"
            className={isActive("/") ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/studios"
            className={isActive("/studios") ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Explore Studios
          </Link>
          <Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          <Link href="/#about-us" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>

          {user ? (
            <>
              <Link
                className="mobile-nav-link"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              >
                Profile Settings
              </Link>
              <Link
                className="mobile-nav-link"
                href="/my-listings"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                className="mobile-nav-link"
                href="/add-studio"
                onClick={() => setMenuOpen(false)}
              >
                <Plus size={15} /> Add New Studio
              </Link>
              <Link
                className="mobile-nav-link"
                href="/my-listings"
                onClick={() => setMenuOpen(false)}
              >
                My Studio Listings
              </Link>
              <Link
                className="mobile-nav-link"
                href="/my-bookings"
                onClick={() => setMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link
                className="mobile-nav-link"
                href="/saved-studios"
                onClick={() => setMenuOpen(false)}
              >
                Saved Studios
              </Link>
              <button className="mobile-logout" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <div className="mobile-auth-row">
              <Link
                className="button button-outline button-small"
                href="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                className="button button-dark button-small"
                href="/register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        <div className="header-actions">
          {!authLoading && user && (
            <Link className="host-link" href="/add-studio">
              <Plus size={16} /> Host a space
            </Link>
          )}

          <button
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {!authLoading &&
            (user ? (
              <div
                className="user-menu"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="avatar-button"
                  onClick={handleAvatarClick}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name || "User"} />
                  ) : (
                    user.name?.slice(0, 1).toUpperCase() || "U"
                  )}
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-user">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/my-listings"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/add-studio"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Add New Studio
                    </Link>
                    <Link
                      href="/my-listings"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Studio Listings
                    </Link>
                    <Link
                      href="/my-bookings"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/saved-studios"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Saved Studios
                    </Link>
                    <button className="dropdown-logout" onClick={handleLogout}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth-buttons">
                <Link
                  className="button button-outline header-btn"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="button button-dark header-btn"
                  href="/register"
                >
                  Register
                </Link>
              </div>
            ))}

          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
