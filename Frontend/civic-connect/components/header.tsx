"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Civic Connect</span>
            <span className="text-xs text-muted-foreground">AI-Powered Governance</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Services
          </Link>
          <Link
            href="/grievances"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            File Grievance
          </Link>
          <Link
            href="/track"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Track Status
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get Started</Link>
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-2">
            <Link
              href="/services"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="/grievances"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              File Grievance
            </Link>
            <Link href="/track" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Track Status
            </Link>
            <Link href="/about" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/login"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
