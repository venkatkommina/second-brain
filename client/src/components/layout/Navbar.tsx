import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b border-[hsl(var(--border))] sticky top-0 z-40" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">SecondBrain</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/content/new"
                  className="text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Add Content
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-opacity-80 hover:text-opacity-100"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Login
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <ThemeToggle className="mr-2" />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-opacity-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[hsl(var(--primary))]"
              style={{ 
                color: "hsl(var(--foreground))", 
                opacity: 0.8,
                backgroundColor: "transparent"
              }}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-base font-medium"
                style={{ color: "hsl(var(--foreground))" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/content/new"
                className="block text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-base font-medium"
                style={{ color: "hsl(var(--foreground))" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Add Content
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-base font-medium"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-base font-medium"
                style={{ color: "hsl(var(--foreground))" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block text-opacity-80 hover:text-opacity-100 px-3 py-2 rounded-md text-base font-medium"
                style={{ color: "hsl(var(--foreground))" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 