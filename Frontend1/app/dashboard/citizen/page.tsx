"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Bell,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  LogOut,
  Home,
  Download,
  Settings,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [newGrievance, setNewGrievance] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
  })

  const monthlyData = [
    { month: "Jan", submitted: 2, resolved: 1 },
    { month: "Feb", submitted: 1, resolved: 1 },
    { month: "Mar", submitted: 0, resolved: 0 },
    { month: "Apr", submitted: 1, resolved: 0 },
    { month: "May", submitted: 2, resolved: 1 },
    { month: "Jun", submitted: 3, resolved: 2 },
  ]

  const categoryData = [
    { name: "Infrastructure", value: 2, color: "#3B82F6" },
    { name: "Utilities", value: 1, color: "#10B981" },
    { name: "Transportation", value: 0, color: "#F59E0B" },
    { name: "Healthcare", value: 0, color: "#EF4444" },
    { name: "Other", value: 0, color: "#8B5CF6" },
  ]

  const grievances = [
    {
      id: "GRV-001",
      title: "Street Light Not Working",
      category: "Infrastructure",
      status: "In Progress",
      priority: "High",
      date: "2024-01-15",
      assignedTo: "Municipal Corp",
      description: "Street light on Main Street has been non-functional for 3 days",
      location: "Main Street, Block A",
      updates: [
        { date: "2024-01-16", message: "Grievance assigned to Municipal Corp", status: "Assigned" },
        { date: "2024-01-17", message: "Technical team dispatched for inspection", status: "In Progress" },
      ],
    },
    {
      id: "GRV-002",
      title: "Water Supply Issue",
      category: "Utilities",
      status: "Resolved",
      priority: "High",
      date: "2024-01-10",
      assignedTo: "Water Department",
      description: "Irregular water supply in residential area",
      location: "Residential Area, Block B",
      updates: [
        { date: "2024-01-11", message: "Issue reported to Water Department", status: "Assigned" },
        { date: "2024-01-12", message: "Pipeline repair completed", status: "Resolved" },
      ],
    },
    {
      id: "GRV-003",
      title: "Road Pothole",
      category: "Infrastructure",
      status: "Pending",
      priority: "Medium",
      date: "2024-01-20",
      assignedTo: "PWD",
      description: "Large pothole causing traffic issues",
      location: "Highway Road, Block C",
      updates: [{ date: "2024-01-20", message: "Grievance submitted successfully", status: "Pending" }],
    },
  ]

  const notifications = [
    {
      id: 1,
      message: "Your grievance GRV-001 has been assigned to Municipal Corp",
      time: "2 hours ago",
      type: "update",
    },
    { id: 2, message: "Water Supply Issue has been resolved", time: "1 day ago", type: "success" },
    { id: 3, message: "New service available: Online Tax Payment", time: "3 days ago", type: "info" },
    { id: 4, message: "System maintenance scheduled for tonight", time: "5 days ago", type: "info" },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle grievance submission
    console.log("Submitting grievance:", newGrievance)
    setNewGrievance({ title: "", category: "", description: "", priority: "medium" })
    setActiveTab("grievances")
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Civic Connect</span>
              </Link>
              <div className="inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Citizen Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">3</Badge>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-1 mb-8 bg-muted/50 p-1 rounded-lg backdrop-blur-sm border border-border/40">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "grievances", label: "My Grievances", icon: FileText },
            { id: "submit", label: "Submit New", icon: Plus },
            { id: "analytics", label: "My Analytics", icon: TrendingUp },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Grievances</p>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-xs text-primary mt-1">+1 this month</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Resolved</p>
                      <p className="text-2xl font-bold text-chart-2">1</p>
                      <p className="text-xs text-chart-2 mt-1">33.3% resolution rate</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-chart-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-chart-1">1</p>
                      <p className="text-xs text-chart-1 mt-1">33.3% of total</p>
                    </div>
                    <Clock className="w-8 h-8 text-chart-1" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending</p>
                      <p className="text-2xl font-bold text-chart-3">1</p>
                      <p className="text-xs text-chart-3 mt-1">33.3% of total</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>My Grievance Trends</CardTitle>
                  <CardDescription>Your submission and resolution history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="submitted" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>My Grievances by Category</CardTitle>
                  <CardDescription>Distribution of your submitted grievances</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData.filter((item) => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Grievances</CardTitle>
                <CardDescription>Your latest submitted grievances and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grievances.slice(0, 3).map((grievance) => (
                    <div
                      key={grievance.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{grievance.title}</h3>
                          <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                          <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority} Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {grievance.id} • {grievance.category} • {grievance.location} • {grievance.date}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grievances Tab */}
        {activeTab === "grievances" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Grievances</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search grievances..." className="pl-10 bg-background border-border" />
                </div>
                <Select>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {grievances.map((grievance) => (
                <Card key={grievance.id} className="bg-card/50 border-border/40 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{grievance.title}</h3>
                          <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                          <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority} Priority</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{grievance.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">ID:</span> {grievance.id}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {grievance.category}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {grievance.date}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {grievance.location}
                          </div>
                          <div>
                            <span className="font-medium">Assigned to:</span> {grievance.assignedTo}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Progress Updates</h4>
                          <div className="space-y-2">
                            {grievance.updates.map((update, index) => (
                              <div key={index} className="flex items-center space-x-3 text-xs">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-muted-foreground">{update.date}</span>
                                <span>{update.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Submit New Grievance Tab */}
        {activeTab === "submit" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Submit New Grievance</CardTitle>
                <CardDescription>Fill out the form below to submit a new grievance or complaint</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitGrievance} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Grievance Title *</label>
                    <Input
                      value={newGrievance.title}
                      onChange={(e) => setNewGrievance({ ...newGrievance, title: e.target.value })}
                      placeholder="Brief title describing your issue"
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select
                      value={newGrievance.category}
                      onValueChange={(value) => setNewGrievance({ ...newGrievance, category: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority Level</label>
                    <Select
                      value={newGrievance.priority}
                      onValueChange={(value) => setNewGrievance({ ...newGrievance, priority: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Textarea
                      value={newGrievance.description}
                      onChange={(e) => setNewGrievance({ ...newGrievance, description: e.target.value })}
                      placeholder="Provide detailed information about your grievance..."
                      rows={5}
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        Drag and drop files here, or click to select files
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Submit Grievance
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="submitted" fill="hsl(var(--primary))" />
                      <Bar dataKey="resolved" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Response Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Infrastructure", avgTime: "3.2 days", color: "bg-primary" },
                      { category: "Utilities", avgTime: "2.1 days", color: "bg-chart-2" },
                      { category: "Transportation", avgTime: "N/A", color: "bg-muted" },
                      { category: "Healthcare", avgTime: "N/A", color: "bg-muted" },
                    ].map((item) => (
                      <div key={item.category} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{item.category}</h3>
                          <span className="text-sm text-muted-foreground">{item.avgTime}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: item.avgTime === "N/A" ? "0%" : "60%" }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Button variant="outline">Mark All Read</Button>
            </div>
            {notifications.map((notification) => (
              <Card key={notification.id} className="bg-card/50 border-border/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "success"
                          ? "bg-chart-2"
                          : notification.type === "update"
                            ? "bg-primary"
                            : "bg-chart-3"
                      }`}
                    />
                    <div className="flex-1">
                      <p>{notification.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
