'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Copy, Check } from 'lucide-react';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

const demoAccounts = [
  {
    role: 'Citizen',
    email: 'rajesh.kumar@demo.com',
    password: 'password123',
    name: 'Rajesh Kumar',
    description: 'Report civic issues and track their progress',
    icon: '👤',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'Citizen',
    email: 'priya.sharma@demo.com',
    password: 'password123',
    name: 'Priya Sharma',
    description: 'Report civic issues and track their progress',
    icon: '👤',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'Citizen',
    email: 'amit.singh@demo.com',
    password: 'password123',
    name: 'Amit Singh',
    description: 'Report civic issues and track their progress',
    icon: '👤',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'Admin',
    email: 'admin@civicconnect.gov.in',
    password: 'admin123',
    name: 'Dr. Suresh Mehta',
    description: 'Full system access and management',
    icon: '👑',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    role: 'PWD Head',
    email: 'pwd.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Ramesh Gupta',
    department: 'Public Works Department (PWD)',
    description: 'Manage road infrastructure and construction issues',
    icon: '🏗️',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    role: 'Municipal Head',
    email: 'municipal.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Vijay Kumar',
    department: 'Municipal Corporation',
    description: 'Handle sanitation, waste management, and local civic services',
    icon: '🏛️',
    color: 'bg-green-100 text-green-800',
  },
  {
    role: 'Electricity Head',
    email: 'electricity.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Anil Sharma',
    department: 'Electricity Department',
    description: 'Manage electrical infrastructure and power supply issues',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    role: 'Transport Head',
    email: 'transport.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Deepak Verma',
    department: 'Transport Department',
    description: 'Handle traffic management and public transportation',
    icon: '🚌',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    role: 'Water Head',
    email: 'water.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Rajesh Tiwari',
    department: 'Water Supply Department',
    description: 'Manage water supply and drainage systems',
    icon: '💧',
    color: 'bg-cyan-100 text-cyan-800',
  },
  {
    role: 'Police Head',
    email: 'police.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Ajay Singh',
    department: 'Police Department',
    description: 'Handle law enforcement and public safety issues',
    icon: '👮',
    color: 'bg-red-100 text-red-800',
  },
  {
    role: 'Environment Head',
    email: 'environment.head@civicconnect.gov.in',
    password: 'password123',
    name: 'Shri Sunil Kumar',
    department: 'Environment Department',
    description: 'Manage environmental protection and waste management',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-800',
  },
];

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string, role: string) => {
    setIsLoading(email);
    try {
      await authService.login({ email, password });
      toast.success(`Logged in as ${role}`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(type === 'email' ? text : null);
      toast.success(`${type === 'email' ? 'Email' : 'Password'} copied to clipboard`);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Demo Accounts</h1>
          <p className="text-gray-600 mt-2">
            Click any account below to instantly login and explore the platform
          </p>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoAccounts.map((account) => (
            <Card key={account.email} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{account.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{account.name || account.role}</CardTitle>
                      {account.department && (
                        <p className="text-sm text-gray-600">{account.department}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={account.color}>
                    {account.role.includes('Head') ? 'Department Head' : account.role}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {account.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Credentials */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {account.email}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.email, 'email')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedEmail === account.email ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {account.password}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.password, 'password')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  onClick={() => handleLogin(account.email, account.password, account.role)}
                  disabled={isLoading === account.email}
                  className="w-full"
                >
                  {isLoading === account.email ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    `Login as ${account.name || account.role}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test the System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">1. Report an Issue</h3>
                <p className="text-sm text-gray-600">
                  Login as a Citizen and report a civic issue with images. 
                  Watch the AI auto-assign it to the appropriate department.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">2. Manage Grievances</h3>
                <p className="text-sm text-gray-600">
                  Login as a Department Head to view assigned grievances, 
                  update their status, and add comments.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">3. Admin Oversight</h3>
                <p className="text-sm text-gray-600">
                  Login as Admin to manage departments, view all grievances, 
                  and oversee the entire system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
