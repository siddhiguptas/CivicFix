"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, CheckCircle, AlertCircle, XCircle, Lock } from "lucide-react"

export default function TrackPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      if (authStatus === "true") {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/track")
    }
  }, [isAuthenticated, isLoading, router])

  const sampleGrievances = [
    {
      id: "GRV-2024-001",
      subject: "Street Light Not Working",
      status: "In Progress",
      priority: "Medium",
      submittedDate: "2024-01-15",
      lastUpdate: "2024-01-18",
      department: "Public Works",
    },
    {
      id: "GRV-2024-002",
      subject: "Water Supply Issue",
      status: "Resolved",
      priority: "High",
      submittedDate: "2024-01-10",
      lastUpdate: "2024-01-16",
      department: "Water Department",
    },
    {
      id: "GRV-2024-003",
      subject: "Road Pothole Repair",
      status: "Under Review",
      priority: "Low",
      submittedDate: "2024-01-20",
      lastUpdate: "2024-01-20",
      department: "Transportation",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Under Review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "In Progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Under Review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background grid-bg">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
          <Card className="glass max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to track your grievances and view status updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => router.push("/login?redirect=/track")} className="w-full">
                Sign In to Continue
              </Button>
              <Button variant="outline" onClick={() => router.push("/register?redirect=/track")} className="w-full">
                Create Account
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Status</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor the progress of your grievances and applications in real-time
          </p>
        </div>

        {/* Search Section */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search Your Grievances
            </CardTitle>
            <CardDescription>Enter your grievance ID or email to track status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input id="search" placeholder="Enter Grievance ID (e.g., GRV-2024-001) or Email" className="w-full" />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Grievances</h2>

          <div className="grid gap-6">
            {sampleGrievances.map((grievance) => (
              <Card key={grievance.id} className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(grievance.status)}
                        {grievance.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        ID: {grievance.id} • Department: {grievance.department}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                      <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{grievance.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Update</p>
                      <p className="font-medium">{grievance.lastUpdate}</p>
                    </div>
                    <div className="sm:text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Card className="glass mt-12">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Need Help Tracking Your Grievance?</h3>
              <p className="text-muted-foreground mb-4">
                If you're having trouble finding your grievance or need assistance, our support team is here to help.
              </p>
              <Button variant="outline">Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
