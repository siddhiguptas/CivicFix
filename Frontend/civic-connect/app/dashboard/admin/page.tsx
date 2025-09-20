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
    { name: "Infrastructure", value: 35, color: "#3B82F6" },
    { name: "Utilities", value: 25, color: "#10B981" },
    { name: "Transportation", value: 20, color: "#F59E0B" },
    { name: "Healthcare", value: 12, color: "#EF4444" },
    { name: "Other", value: 8, color: "#8B5CF6" },
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

  const handleStatusUpdate = (grievanceId: string, newStatus: string) => {
    console.log(`Updating grievance ${grievanceId} to status: ${newStatus}`)
    // Handle status update logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Civic Connect</span>
              </Link>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Admin Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "grievances", label: "All Grievances", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart },
            { id: "citizens", label: "Citizens", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Grievances</p>
                      <p className="text-2xl font-bold text-white">328</p>
                      <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Resolved</p>
                      <p className="text-2xl font-bold text-green-400">283</p>
                      <p className="text-xs text-green-400 mt-1">86.3% resolution rate</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-blue-400">32</p>
                      <p className="text-xs text-blue-400 mt-1">9.8% of total</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">13</p>
                      <p className="text-xs text-yellow-400 mt-1">3.9% of total</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Grievance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={grievanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="submitted" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Grievances by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
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

            {/* Recent High Priority Grievances */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">High Priority Grievances</CardTitle>
                <CardDescription className="text-slate-400">Grievances requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allGrievances
                    .filter((g) => g.priority === "High")
                    .map((grievance) => (
                      <div
                        key={grievance.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-red-500/20"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-white">{grievance.title}</h3>
                            <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High Priority</Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {grievance.id} • {grievance.citizen} • {grievance.location} • {grievance.date}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                          >
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Grievances</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search grievances..."
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
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
                  <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
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
              {allGrievances.map((grievance) => (
                <Card key={grievance.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{grievance.title}</h3>
                          <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                          <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority} Priority</Badge>
                        </div>
                        <p className="text-slate-400 mb-3">{grievance.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
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
                          <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
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
                          className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={grievanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="submitted" fill="#3B82F6" />
                      <Bar dataKey="resolved" fill="#10B981" />
                      <Bar dataKey="pending" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: "Municipal Corp", resolved: 45, total: 52, rate: 86.5 },
                      { dept: "Water Department", resolved: 38, total: 41, rate: 92.7 },
                      { dept: "PWD", resolved: 29, total: 35, rate: 82.9 },
                      { dept: "Sanitation Dept", resolved: 22, total: 28, rate: 78.6 },
                    ].map((dept) => (
                      <div key={dept.dept} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{dept.dept}</h3>
                          <span className="text-sm text-slate-400">{dept.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dept.rate}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Registered Citizens</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search citizens..."
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400"
                  />
                </div>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">Export List</Button>
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
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
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {citizen.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{citizen.name}</h3>
                          <p className="text-sm text-slate-400">{citizen.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <div>
                          <span className="font-medium">Grievances:</span> {citizen.grievances}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {citizen.joined}
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{citizen.status}</Badge>
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
