import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
  SidebarGroupContent, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem, SidebarProvider, SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
  Home, Users, FileText, Brain, Pill, BarChart3, 
  Link2, DollarSign, Settings, Bell, LogOut 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/logo";

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home, roles: ["all"] },
  { title: "Patient Verification", url: "/verification", icon: Users, roles: ["front-office", "doctor", "care-manager"] },
  { title: "Claims Processing", url: "/claims", icon: FileText, roles: ["front-office", "doctor", "care-manager"] },
  { title: "AI Preauthorization", url: "/preauth", icon: Brain, roles: ["doctor", "care-manager"] },
  { title: "Pharmacy", url: "/pharmacy", icon: Pill, roles: ["pharmacy", "care-manager"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["care-manager", "debtors"] },
  { title: "Blockchain", url: "/blockchain", icon: Link2, roles: ["care-manager"] },
  { title: "Debtors", url: "/debtors", icon: DollarSign, roles: ["debtors", "care-manager"] },
];

export function Layout({ children }: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getFilteredNavigation = () => {
    if (!user) return [];
    return navigationItems.filter(item => 
      item.roles.includes("all") || item.roles.includes(user.role)
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'front-office': 'Front Office',
      'doctor': 'Physician',
      'lab': 'Laboratory',
      'pharmacy': 'Pharmacy',
      'debtors': 'Debtors',
      'care-manager': 'Care Manager'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-gray-200">
          <SidebarContent>
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
              <Link href="/">
                <div className="flex items-center space-x-3">
                  <Logo />
                  <div>
                    <h1 className="text-xl font-bold text-teal-600">Erlessed</h1>
                    <p className="text-xs text-gray-500">powered by <span className="font-semibold text-black">Aboolean</span></p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getFilteredNavigation().map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url}
                        className={location === item.url ? "bg-teal-50 text-teal-700" : ""}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Profile Footer */}
          <SidebarFooter className="border-t border-gray-200 p-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-auto p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {getUserInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                {user && (
                  <Badge variant="outline" className="text-teal-700 border-teal-200">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* AI Status Indicator */}
                <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-teal-700 font-medium">AI Active</span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
