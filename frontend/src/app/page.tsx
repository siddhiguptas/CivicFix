'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MapPin, 
  Camera, 
  MessageSquare, 
  BarChart3, 
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Only check authentication on client side
    if (typeof window !== 'undefined') {
      // Redirect to dashboard if already authenticated
      if (authService.isAuthenticated()) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Report Issues',
      description: 'Easily report civic issues with photos and location data',
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Location Tracking',
      description: 'Automatic GPS location tagging for accurate issue reporting',
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: 'Photo Evidence',
      description: 'Upload photos to provide visual evidence of the issue',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'AI Chatbot',
      description: 'Get instant help and guidance from our AI assistant',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Real-time Tracking',
      description: 'Track the progress of your reported issues in real-time',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Impact',
      description: 'Contribute to improving your community infrastructure',
    },
  ];

  const stats = [
    { label: 'Issues Reported', value: '1,234', icon: <FileText className="h-4 w-4" /> },
    { label: 'Issues Resolved', value: '987', icon: <CheckCircle className="h-4 w-4" /> },
    { label: 'Active Users', value: '5,678', icon: <Users className="h-4 w-4" /> },
    { label: 'Response Time', value: '2.5 days', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Civic Connect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Report Civic Issues
            <span className="block text-blue-200">Track Resolution</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            A platform for citizens to report civic issues like potholes, street lights, 
            and garbage collection problems. Track their resolution progress in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/register">
                <FileText className="mr-2 h-5 w-5" />
                Start Reporting
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-900">
              <Link href="/login">
                <Users className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Civic Connect?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy for citizens to report issues and track their resolution, 
              while providing administrators with powerful tools to manage and resolve problems efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are already using Civic Connect to improve their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/register">
                <FileText className="mr-2 h-5 w-5" />
                Get Started Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-900">
              <Link href="/login">
                <Users className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Civic Connect</h3>
            <p className="text-gray-400 mb-6">
              Empowering citizens to report and track civic issues for a better community.
            </p>
            <div className="flex justify-center space-x-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link href="/register">Register</Link>
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2025 Civic Connect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}