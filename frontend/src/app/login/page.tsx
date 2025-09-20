'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.login(data);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.login({ email, password });
      toast.success(`Logged in as ${role}`);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Civic Connect</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to report and track civic issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or try demo accounts</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Basic Demo Accounts */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin('rajesh.kumar@demo.com', 'password123', 'Rajesh Kumar')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Demo Citizen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin('admin@civicconnect.gov.in', 'admin123', 'Dr. Suresh Mehta')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Demo Admin
                  </Button>
                </div>

                {/* Department Head Accounts */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Department Head Accounts:</p>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('pwd.head@civicconnect.gov.in', 'password123', 'Shri Ramesh Gupta')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      PWD Head (pwd.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('municipal.head@civicconnect.gov.in', 'password123', 'Shri Vijay Kumar')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Municipal Head (municipal.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('electricity.head@civicconnect.gov.in', 'password123', 'Shri Anil Sharma')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Electricity Head (electricity.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('transport.head@civicconnect.gov.in', 'password123', 'Shri Deepak Verma')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Transport Head (transport.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('water.head@civicconnect.gov.in', 'password123', 'Shri Rajesh Tiwari')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Water Head (water.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('police.head@civicconnect.gov.in', 'password123', 'Shri Ajay Singh')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Police Head (police.head@civicconnect.gov.in)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('environment.head@civicconnect.gov.in', 'password123', 'Shri Sunil Kumar')}
                      disabled={isLoading}
                      className="justify-start text-xs"
                    >
                      Environment Head (environment.head@civicconnect.gov.in)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Want to see all demo accounts?{' '}
                <Link href="/demo" className="font-medium text-green-600 hover:text-green-500">
                  View Demo Accounts
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
