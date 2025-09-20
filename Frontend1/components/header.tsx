"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, X, User, Settings, LogOut, Bell, Shield } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com", role: "citizen" })
  const pathname = usePathname()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Set scrolled state for styling
      setIsScrolled(currentScrollY > 10)

      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMenuOpen && !target.closest("header")) {
        setIsMenuOpen(false)
      }
      if (isProfileOpen && !target.closest(".profile-dropdown")) {
        setIsProfileOpen(false)
      }
    }

    if (isMenuOpen || isProfileOpen) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [isMenuOpen, isProfileOpen])

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const userData = localStorage.getItem("userData")
      if (authStatus === "true" && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      }
    }
    checkAuthStatus()
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userData")
    setIsAuthenticated(false)
    setIsProfileOpen(false)
    window.location.href = "/"
  }

  const isActiveLink = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href))
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5"
          : "bg-white/95 backdrop-blur-md border-b border-gray-200/30"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
            <MapPin className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Civic Connect
            </span>
            <span className="text-xs text-gray-500 font-medium">AI-Powered Governance</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/services"
            className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 relative group ${
              isActiveLink("/services") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/grievances"
            className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 relative group ${
              isActiveLink("/grievances") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            File Grievance
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/track"
            className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 relative group ${
              isActiveLink("/track") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Track Status
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 relative group ${
              isActiveLink("/about") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 relative group ${
              isActiveLink("/contact") ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100/80 hover:scale-105 transition-all duration-300"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              </Button>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-gray-100/80 hover:scale-105 transition-all duration-300"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </Button>

                {/* Profile Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-xl transition-all duration-300 ${
                    isProfileOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {user.role === "admin" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href={`/dashboard/${user.role}`}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-gray-100/80 hover:scale-105 transition-all duration-300"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-gray-100/80 hover:scale-105 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg transition-all duration-500 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="container py-4 space-y-2">
          <Link
            href="/services"
            className={`block py-3 px-4 text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg ${
              isActiveLink("/services") ? "text-blue-600 bg-blue-50/80" : "text-gray-600"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/grievances"
            className={`block py-3 px-4 text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg ${
              isActiveLink("/grievances") ? "text-blue-600 bg-blue-50/80" : "text-gray-600"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            File Grievance
          </Link>
          <Link
            href="/track"
            className={`block py-3 px-4 text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg ${
              isActiveLink("/track") ? "text-blue-600 bg-blue-50/80" : "text-gray-600"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Track Status
          </Link>
          <Link
            href="/about"
            className={`block py-3 px-4 text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg ${
              isActiveLink("/about") ? "text-blue-600 bg-blue-50/80" : "text-gray-600"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`block py-3 px-4 text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg ${
              isActiveLink("/contact") ? "text-blue-600 bg-blue-50/80" : "text-gray-600"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <div className="border-t border-gray-200/50 pt-4 mt-4">
              <Link
                href={`/dashboard/${user.role}`}
                className="block py-3 px-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile/settings"
                className="block py-3 px-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left py-3 px-4 text-sm font-medium text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200/50 pt-4 mt-4 space-y-2">
              <Link
                href="/login"
                className="block py-3 px-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block py-3 px-4 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
