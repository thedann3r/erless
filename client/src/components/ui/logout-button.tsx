import { LogOut, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface LogoutButtonProps {
  variant?: "button" | "dropdown";
  className?: string;
}

export function LogoutButton({ variant = "button", className = "" }: LogoutButtonProps) {
  const { user, logout, lastActivity } = useAuth();

  if (!user) return null;

  const getTimeUntilLogout = () => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    const timeUntilLogout = (15 * 60 * 1000) - timeSinceLastActivity; // 15 minutes
    const minutesLeft = Math.ceil(timeUntilLogout / 60000);
    return minutesLeft > 0 ? minutesLeft : 0;
  };

  const minutesLeft = getTimeUntilLogout();
  const isNearTimeout = minutesLeft <= 2;

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${className}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-teal-100 text-teal-700">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isNearTimeout && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user.role.replace('-', ' ')}
            </p>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Session expires in {minutesLeft}m</span>
              {isNearTimeout && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  Soon
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logout}
      className={`flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
      {isNearTimeout && (
        <Badge variant="destructive" className="text-xs px-1 py-0 ml-1">
          {minutesLeft}m
        </Badge>
      )}
    </Button>
  );
}