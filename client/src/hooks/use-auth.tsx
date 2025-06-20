import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  lastActivity: number;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

export function AuthProvider({ children }: { children: ReactNode }) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.setQueryData(["/api/user"], userData);
      updateActivity();
      
      // Redirect based on user role
      const roleDashboards: Record<string, string> = {
        doctor: "/doctor",
        pharmacist: "/pharmacy-dashboard", 
        "care-manager": "/care-manager-dashboard",
        insurer: "/insurer",
        patient: "/patient",
        admin: "/admin"
      };
      
      const targetDashboard = roleDashboards[userData.role] || "/";
      setLocation(targetDashboard);
      
      toast({
        title: "Login Successful",
        description: `Welcome to your ${userData.role} dashboard!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/auth");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      // Even if logout fails on server, clear client state
      queryClient.clear();
      setLocation("/auth");
      toast({
        title: "Logged Out",
        description: "Session ended",
      });
    },
  });

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity",
          variant: "destructive",
        });
        logout();
      }
    };

    const interval = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, lastActivity]);

  // Redirect to auth if not authenticated and not already on auth page
  useEffect(() => {
    if (error && !isLoading) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/auth" && currentPath !== "/onboarding") {
        setLocation("/auth");
      }
    }
  }, [error, isLoading, setLocation]);

  const value: AuthContextType = {
    user: user || null,
    login,
    logout,
    isLoading,
    lastActivity,
    updateActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Session timeout warning component
export function SessionTimeoutWarning() {
  const { user, lastActivity, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const checkWarning = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      const timeUntilLogout = INACTIVITY_TIMEOUT - timeSinceLastActivity;
      const warningThreshold = 2 * 60 * 1000; // 2 minutes before logout

      if (timeUntilLogout <= warningThreshold && timeUntilLogout > 0 && !showWarning) {
        setShowWarning(true);
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${Math.ceil(timeUntilLogout / 60000)} minutes due to inactivity`,
          variant: "destructive",
        });
      } else if (timeUntilLogout > warningThreshold) {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkWarning, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, lastActivity, showWarning, toast]);

  return null;
}