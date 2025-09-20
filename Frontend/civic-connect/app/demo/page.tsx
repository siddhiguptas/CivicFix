"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Shield, BarChart, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<"citizen" | "admin" | null>(null)

  const citizenFeatures = [
    { icon: FileText, title: "Submit Grievances", description: "Easy-to-use form for reporting issues" },
    { icon: Clock, title: "Track Progress", description: "Real-time status updates on your complaints" },
    { icon: CheckCircle, title: "View History", description: "Complete history of all your submissions" },
  ]

  const adminFeatures = [
    { icon: BarChart, title: "Analytics Dashboard", description: "Comprehensive insights and metrics" },
    { icon: Users, title: "Citizen Management", description: "Manage registered citizens and their data" },
    { icon: Shield, title: "Grievance Management", description: "Assign, track, and resolve complaints" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Civic Connect AI</span>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">Explore Civic Connect AI</h1>
          <p className="text-xl text-slate-300 mb-8 text-pretty max-w-3xl mx-auto">
            Experience our platform from different perspectives. Choose a demo to see how Civic Connect AI empowers both
            citizens and government officials.
          </p>
        </div>

        {/* Demo Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card
            className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedDemo === "citizen" ? "ring-2 ring-blue-500 bg-slate-800/70" : ""
            }`}
            onClick={() => setSelectedDemo("citizen")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Citizen Portal</CardTitle>
              <CardDescription className="text-slate-400">
                Experience the platform from a citizen's perspective
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {citizenFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/dashboard/citizen">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Try Citizen Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedDemo === "admin" ? "ring-2 ring-purple-500 bg-slate-800/70" : ""
            }`}
            onClick={() => setSelectedDemo("admin")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Admin Portal</CardTitle>
              <CardDescription className="text-slate-400">
                See how government officials manage the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-white">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/dashboard/admin">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Try Admin Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Platform Highlights</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">86% Resolution Rate</h3>
                <p className="text-slate-400 text-sm">High success rate in resolving citizen grievances</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">24/7 Availability</h3>
                <p className="text-slate-400 text-sm">Submit and track grievances anytime, anywhere</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Real-time Analytics</h3>
                <p className="text-slate-400 text-sm">Comprehensive insights for better governance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
