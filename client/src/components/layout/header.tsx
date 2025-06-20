import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/ui/logout-button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Context */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Healthy</span>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-teal-primary font-medium">AI Active</span>
            </div>

            {/* Current Role */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <i className={`fas ${
                user?.role === 'doctor' ? 'fa-user-md' :
                user?.role === 'pharmacy' ? 'fa-pills' :
                user?.role === 'lab' ? 'fa-flask' :
                user?.role === 'care-manager' ? 'fa-chart-line' :
                user?.role === 'debtors' ? 'fa-dollar-sign' :
                'fa-user'
              } text-teal-primary`}></i>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {user?.role?.replace('-', ' ')}
              </span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Logout Button */}
            <LogoutButton variant="dropdown" />
          </div>
        </div>
      </div>
    </header>
  );
}
