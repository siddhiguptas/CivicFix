"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Settings,
  LogOut,
  Home,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null)

  const grievanceData = [
    { month: "Jan", submitted: 45, resolved: 38, pending: 7 },
    { month: "Feb", submitted: 52, resolved: 41, pending: 11 },
    { month: "Mar", submitted: 48, resolved: 45, pending: 3 },
    { month: "Apr", submitted: 61, resolved: 52, pending: 9 },
    { month: "May", submitted: 55, resolved: 48, pending: 7 },
    { month: "Jun", submitted: 67, resolved: 59, pending: 8 },
  ]

  const categoryData = [
    { name: "Infrastructure", value: 35, color: "#3B82F6", description: "Roads, bridges, public buildings" },
    { name: "Utilities", value: 25, color: "#10B981", description: "Water, electricity, gas services" },
    { name: "Transportation", value: 20, color: "#F59E0B", description: "Public transport, traffic issues" },
    { name: "Healthcare", value: 12, color: "#EF4444", description: "Medical facilities, health services" },
    { name: "Environment", value: 8, color: "#8B5CF6", description: "Waste management, pollution" },
  ]

  const allGrievances = [
    {
      id: "GRV-001",
      title: "Street Light Not Working",
      citizen: "John Doe",
      category: "Infrastructure",
      status: "In Progress",
      priority: "High",
      date: "2024-01-15",
      assignedTo: "Municipal Corp",
      description: "Street light on Main Street has been non-functional for 3 days",
      location: "Main Street, Block A",
    },
    {
      id: "GRV-002",
      title: "Water Supply Issue",
      citizen: "Jane Smith",
      category: "Utilities",
      status: "Resolved",
      priority: "High",
      date: "2024-01-10",
      assignedTo: "Water Department",
      description: "Irregular water supply in residential area",
      location: "Residential Area, Block B",
    },
    {
      id: "GRV-003",
      title: "Road Pothole",
      citizen: "Mike Johnson",
      category: "Infrastructure",
      status: "Pending",
      priority: "Medium",
      date: "2024-01-20",
      assignedTo: "PWD",
      description: "Large pothole causing traffic issues",
      location: "Highway Road, Block C",
    },
    {
      id: "GRV-004",
      title: "Garbage Collection Delay",
      citizen: "Sarah Wilson",
      category: "Environment",
      status: "Pending",
      priority: "Medium",
      date: "2024-01-18",
      assignedTo: "Sanitation Dept",
      description: "Garbage not collected for 3 days in residential area",
      location: "Green Valley, Block D",
    },
  ]

  const detailedTrendData = [
    { month: "Jan", submitted: 45, resolved: 38, pending: 7, avgResponseTime: 3.2, satisfaction: 4.1 },
    { month: "Feb", submitted: 52, resolved: 41, pending: 11, avgResponseTime: 3.8, satisfaction: 3.9 },
    { month: "Mar", submitted: 48, resolved: 45, pending: 3, avgResponseTime: 2.9, satisfaction: 4.3 },
    { month: "Apr", submitted: 61, resolved: 52, pending: 9, avgResponseTime: 3.5, satisfaction: 4.0 },
    { month: "May", submitted: 55, resolved: 48, pending: 7, avgResponseTime: 3.1, satisfaction: 4.2 },
    { month: "Jun", submitted: 67, resolved: 59, pending: 8, avgResponseTime: 3.0, satisfaction: 4.4 },
  ]

  const weeklyTrendData = [
    { week: "Week 1", grievances: 15, resolved: 12, efficiency: 80 },
    { week: "Week 2", grievances: 18, resolved: 16, efficiency: 89 },
    { week: "Week 3", grievances: 22, resolved: 19, efficiency: 86 },
    { week: "Week 4", grievances: 12, resolved: 12, efficiency: 100 },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleStatusUpdate = (grievanceId: string, newStatus: string) => {
    console.log(`Updating grievance ${grievanceId} to status: ${newStatus}`)
    // Handle status update logic here
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground text-shadow-sm heading-secondary">
                  Civic Connect
                </span>
              </Link>
              <Badge variant="secondary" className="animate-pulse">
                Admin Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg backdrop-blur-sm">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "grievances", label: "All Grievances", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart },
            { id: "citizens", label: "Citizens", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg animate-slide-in"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Grievances</p>
                      <p className="text-2xl font-bold text-foreground text-shadow-sm">328</p>
                      <p className="text-xs text-green-600 mt-1 text-shadow-sm">+12% from last month</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">283</p>
                      <p className="text-xs text-green-600 mt-1">86.3% resolution rate</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">32</p>
                      <p className="text-xs text-blue-600 mt-1">9.8% of total</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">13</p>
                      <p className="text-xs text-yellow-600 mt-1">3.9% of total</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.5s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">
                    Monthly Grievance Trends
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Comprehensive analysis of grievance patterns and resolution efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={detailedTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="submitted"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        name="Submitted"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                        name="Resolved"
                      />
                      <Line
                        type="monotone"
                        dataKey="pending"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                        name="Pending"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.6s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">
                    Grievances by Category
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Distribution of grievances across different service categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        className="pie-slice"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name, props) => [`${value} grievances`, `${props.payload.description}`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="text-sm text-muted-foreground">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.7s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">Weekly Performance</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Recent weekly grievance resolution efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="grievances" fill="#3B82F6" radius={[4, 4, 0, 0]} className="bar-element" />
                      <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} className="bar-element" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.8s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">
                    Response Time & Satisfaction
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Average response time (days) and citizen satisfaction rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={detailedTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgResponseTime"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                        name="Avg Response Time (days)"
                      />
                      <Line
                        type="monotone"
                        dataKey="satisfaction"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                        name="Satisfaction Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card
              className="hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.9s" }}
            >
              <CardHeader>
                <CardTitle className="text-foreground">High Priority Grievances</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Grievances requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allGrievances
                    .filter((g) => g.priority === "High")
                    .map((grievance, index) => (
                      <div
                        key={grievance.id}
                        className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-red-200 hover:bg-accent transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                        style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-foreground">{grievance.title}</h3>
                            <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                            <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                              High Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {grievance.id} • {grievance.citizen} • {grievance.location} • {grievance.date}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:scale-105 transition-transform duration-200 bg-transparent"
                          >
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:scale-105 transition-transform duration-200 bg-transparent"
                          >
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

        {/* All Grievances Tab */}
        {activeTab === "grievances" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">All Grievances</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search grievances..."
                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40 bg-background border-border text-foreground hover:bg-accent transition-colors duration-200">
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
                  <SelectTrigger className="w-40 bg-background border-border text-foreground hover:bg-accent transition-colors duration-200">
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
              {allGrievances.map((grievance, index) => (
                <Card
                  key={grievance.id}
                  className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{grievance.title}</h3>
                          <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                          <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority} Priority</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{grievance.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">ID:</span> {grievance.id}
                          </div>
                          <div>
                            <span className="font-medium">Citizen:</span> {grievance.citizen}
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
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Select onValueChange={(value) => handleStatusUpdate(grievance.id, value)}>
                          <SelectTrigger className="w-40 bg-background border-border text-foreground hover:bg-accent transition-colors duration-200">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:scale-105 transition-transform duration-200 bg-transparent"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={grievanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="submitted" fill="hsl(var(--primary))" />
                      <Bar dataKey="resolved" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="pending" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-all duration-300 animate-slide-up chart-container"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle className="text-foreground heading-secondary text-shadow-sm">
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: "Municipal Corp", resolved: 45, total: 52, rate: 86.5 },
                      { dept: "Water Department", resolved: 38, total: 41, rate: 92.7 },
                      { dept: "PWD", resolved: 29, total: 35, rate: 82.9 },
                      { dept: "Sanitation Dept", resolved: 22, total: 28, rate: 78.6 },
                    ].map((dept, index) => (
                      <div
                        key={dept.dept}
                        className="p-4 bg-accent/50 rounded-lg hover:bg-accent transition-all duration-200 animate-slide-in"
                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-foreground">{dept.dept}</h3>
                          <span className="text-sm text-muted-foreground">{dept.rate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000 animate-progress"
                            style={{ width: `${dept.rate}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dept.resolved} resolved out of {dept.total} total
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Citizens Tab */}
        {activeTab === "citizens" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Registered Citizens</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search citizens..."
                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200">
                  Export List
                </Button>
              </div>
            </div>

            <Card className="hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {[
                    {
                      name: "John Doe",
                      email: "john@example.com",
                      grievances: 3,
                      joined: "2024-01-10",
                      status: "Active",
                    },
                    {
                      name: "Jane Smith",
                      email: "jane@example.com",
                      grievances: 2,
                      joined: "2024-01-08",
                      status: "Active",
                    },
                    {
                      name: "Mike Johnson",
                      email: "mike@example.com",
                      grievances: 1,
                      joined: "2024-01-15",
                      status: "Active",
                    },
                    {
                      name: "Sarah Wilson",
                      email: "sarah@example.com",
                      grievances: 4,
                      joined: "2024-01-05",
                      status: "Active",
                    },
                  ].map((citizen, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-[1.02] animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {citizen.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{citizen.name}</h3>
                          <p className="text-sm text-muted-foreground">{citizen.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Grievances:</span> {citizen.grievances}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {citizen.joined}
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          {citizen.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
