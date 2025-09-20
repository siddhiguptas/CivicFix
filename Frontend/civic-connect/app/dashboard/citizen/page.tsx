"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, FileText, Clock, CheckCircle, AlertCircle, Plus, Search, User, LogOut, Home } from "lucide-react"
import Link from "next/link"

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [newGrievance, setNewGrievance] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
  })

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Civic Connect</span>
              </Link>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Citizen Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500 text-white text-xs">3</Badge>
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <User className="w-4 h-4 mr-2" />
                Profile
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
            { id: "grievances", label: "My Grievances", icon: FileText },
            { id: "submit", label: "Submit New", icon: Plus },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-lg"
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
                      <p className="text-2xl font-bold text-white">3</p>
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
                      <p className="text-2xl font-bold text-green-400">1</p>
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
                      <p className="text-2xl font-bold text-blue-400">1</p>
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
                      <p className="text-2xl font-bold text-yellow-400">1</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Grievances */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Grievances</CardTitle>
                <CardDescription className="text-slate-400">
                  Your latest submitted grievances and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grievances.slice(0, 3).map((grievance) => (
                    <div
                      key={grievance.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">{grievance.title}</h3>
                          <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                          <Badge className={getPriorityColor(grievance.priority)}>{grievance.priority}</Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          ID: {grievance.id} • {grievance.category} • {grievance.date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        View Details
                      </Button>
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
              <h2 className="text-2xl font-bold text-white">My Grievances</h2>
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
              </div>
            </div>

            <div className="grid gap-6">
              {grievances.map((grievance) => (
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
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>ID: {grievance.id}</span>
                          <span>Category: {grievance.category}</span>
                          <span>Date: {grievance.date}</span>
                          <span>Assigned to: {grievance.assignedTo}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                      >
                        Track Progress
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
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Submit New Grievance</CardTitle>
                <CardDescription className="text-slate-400">
                  Fill out the form below to submit a new grievance or complaint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitGrievance} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Grievance Title *</label>
                    <Input
                      value={newGrievance.title}
                      onChange={(e) => setNewGrievance({ ...newGrievance, title: e.target.value })}
                      placeholder="Brief title describing your issue"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                    <Select
                      value={newGrievance.category}
                      onValueChange={(value) => setNewGrievance({ ...newGrievance, category: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority Level</label>
                    <Select
                      value={newGrievance.priority}
                      onValueChange={(value) => setNewGrievance({ ...newGrievance, priority: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <Textarea
                      value={newGrievance.description}
                      onChange={(e) => setNewGrievance({ ...newGrievance, description: e.target.value })}
                      placeholder="Provide detailed information about your grievance..."
                      rows={5}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("overview")}
                      className="border-slate-600 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Submit Grievance
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
            {notifications.map((notification) => (
              <Card key={notification.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "success"
                          ? "bg-green-400"
                          : notification.type === "update"
                            ? "bg-blue-400"
                            : "bg-yellow-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-white">{notification.message}</p>
                      <p className="text-sm text-slate-400 mt-1">{notification.time}</p>
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
