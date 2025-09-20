"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff, User, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation for demo
    if (email && password) {
      toast({
        title: "Login Successful",
        description: "Welcome back to Civic Connect!",
      })
      // Redirect to dashboard based on email domain or role
      if (email.includes("admin") || email.includes("gov")) {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard/citizen")
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleDemoLogin = (role: "citizen" | "admin") => {
    setIsLoading(true)
    setTimeout(() => {
      toast({
        title: "Demo Access Granted",
        description: `Welcome to the ${role} demo!`,
      })
      router.push(`/dashboard/${role}`)
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <Card className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-transform hover:scale-110"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Demo Access */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Try Demo</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => handleDemoLogin("citizen")}
            disabled={isLoading}
          >
            <User className="mr-2 h-4 w-4" />
            Demo Citizen
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-500 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => handleDemoLogin("admin")}
            disabled={isLoading}
          >
            <Shield className="mr-2 h-4 w-4" />
            Demo Admin
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline transition-colors duration-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
