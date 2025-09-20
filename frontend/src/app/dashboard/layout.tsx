'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  FileText, 
  Plus, 
  Settings, 
  LogOut, 
  Bell, 
  Users, 
  BarChart3,
  MessageSquare,
  MapPin,
  Camera
} from 'lucide-react';
import { authService, User } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import ProtectedRoute from '@/components/protected-route';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only load data on client side
    if (typeof window === 'undefined') return;

    const currentUser = authService.getCurrentUserSync();
    setUser(currentUser);
    
    // Load notification count
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const getNavigationItems = () => {
    // Role-specific navigation items
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Admin Panel', href: '/dashboard/admin', icon: BarChart3 },
        { name: 'Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
      ];
    }

    if (user?.role === 'department_head') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Department', href: '/dashboard/admin', icon: BarChart3 },
        { name: 'Department Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
      ];
    }

    // Default citizen navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'My Grievances', href: '/dashboard/grievances', icon: FileText },
      { name: 'Report Issue', href: '/dashboard/grievances/new', icon: Plus },
      { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings }
    ];
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'department_head':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-lg font-semibold">Civic Connect</h1>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-lg font-semibold">Civic Connect</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user?.full_name}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative" asChild>
                  <Link href="/dashboard/notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback>
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.full_name}</p>
                        <Badge className={getRoleBadgeColor(user?.role || 'citizen')}>
                          {user?.role}
                        </Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
