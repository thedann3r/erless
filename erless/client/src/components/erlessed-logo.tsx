import { cn } from "@/lib/utils";

interface ErllessedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ErllessedLogo({ className, size = "md" }: ErllessedLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Medical Cross Logo */}
      <div className="relative">
        <div className={cn(
          "bg-teal-primary rounded-lg flex items-center justify-center",
          sizeClasses[size]
        )}>
          <div className={cn(
            "relative",
            size === "sm" ? "w-4 h-4" : 
            size === "md" ? "w-6 h-6" : "w-8 h-8"
          )}>
            {/* Horizontal bar */}
            <div className={cn(
              "absolute bg-teal-secondary rounded-sm",
              size === "sm" ? "inset-x-1 inset-y-2 h-1" :
              size === "md" ? "inset-x-1.5 inset-y-2.5 h-1" : "inset-x-2 inset-y-3 h-2"
            )}></div>
            {/* Vertical bar */}
            <div className={cn(
              "absolute bg-teal-secondary rounded-sm",
              size === "sm" ? "inset-y-1 inset-x-2 w-1" :
              size === "md" ? "inset-y-1.5 inset-x-2.5 w-1" : "inset-y-2 inset-x-3 w-2"
            )}></div>
            {/* Center circle */}
            <div className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full",
              size === "sm" ? "w-1.5 h-1.5" :
              size === "md" ? "w-2 h-2" : "w-3 h-3"
            )}></div>
          </div>
        </div>
      </div>
      
      {/* Text */}
      <div>
        <h1 className={cn("font-bold text-teal-primary", textSizeClasses[size])}>
          Erlessed
        </h1>
        <p className={cn(
          "text-gray-500",
          size === "sm" ? "text-xs" : "text-xs"
        )}>
          powered by <span className="font-semibold text-black">Aboolean</span>
        </p>
      </div>
    </div>
  );
}
