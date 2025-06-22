import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ErllessedLogo } from "@/components/erlessed-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { LogOut, Clock, User, Settings } from "lucide-react";
import { DashboardToggle } from "@/components/dashboard-toggle";

interface SharedLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    path: string;
    icon: React.ReactNode;
    label: string;
    roles?: string[];
    badge?: string;
  }>;
  title?: string;
}

export function SharedLayout({ children, sidebarItems, title }: SharedLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sessionTime, setSessionTime] = useState(23 * 60 + 45); // 23:45 remaining

  // Session timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev > 0 ? prev - 1 : 0);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const isActive = (path: string) => {
    return location === path || (path !== "/" && location.startsWith(path));
  };

  const getRoleColor = (role: string) => {
    const colors = {
      doctor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      pharmacist: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "care-manager": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      insurer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      patient: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <ErllessedLogo className="h-8 w-auto" />
            {title && (
              <>
                <div className="h-6 w-px bg-border" />
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Dashboard Toggle Menu */}
            <DashboardToggle currentPath={location} />
            {/* Session Timer */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Session: {formatTime(sessionTime)}</span>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Unknown'}</p>
                      <Badge className={getRoleColor(user?.role || 'user')} variant="secondary">
                        {user?.role?.replace('-', ' ').toUpperCase() || 'USER'}
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.username}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Session expires in {formatTime(sessionTime)}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-card">
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-2 p-4">
              {sidebarItems.map((item) => {
                if (item.roles && !item.roles.includes(user?.role || '')) {
                  return null;
                }

                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
              <p className="text-xs text-muted-foreground text-center">
                Powered by Aboolean
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="container mx-auto p-6">
            <div className="fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}