import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="w-full h-full bg-teal-primary rounded-lg flex items-center justify-center relative">
        {/* Medical Cross Design */}
        <div className="w-3/4 h-3/4 relative">
          {/* Horizontal bar */}
          <div className="absolute inset-x-2 top-1/2 transform -translate-y-1/2 h-2 bg-teal-secondary rounded-sm"></div>
          {/* Vertical bar */}
          <div className="absolute inset-y-2 left-1/2 transform -translate-x-1/2 w-2 bg-teal-secondary rounded-sm"></div>
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
}
