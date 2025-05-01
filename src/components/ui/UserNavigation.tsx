import { useState } from "react";
import { User } from "lucide-react";
import { LoadingSpinner } from "./loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";

interface UserNavigationProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function UserNavigation({ className, variant = "ghost", size = "icon" }: UserNavigationProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log("Making logout request to /api/auth/logout");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse response" }));
        console.error("Logout failed:", errorData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Apply appropriate styles based on variant and size
  const getButtonStyles = () => {
    let baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors ";

    // Add variant-specific styles
    if (variant === "default") {
      baseStyles += "bg-primary text-primary-foreground hover:bg-primary/90 ";
    } else if (variant === "ghost") {
      baseStyles += "hover:bg-accent hover:text-accent-foreground ";
    }

    // Add size-specific styles
    if (size === "lg") {
      baseStyles += "h-10 px-6 text-base ";
    } else if (size === "sm") {
      baseStyles += "h-8 px-3 text-sm ";
    } else if (size === "icon") {
      baseStyles += "h-9 w-9 ";
    } else {
      baseStyles += "h-9 px-4 text-sm ";
    }

    // Add custom className if provided
    if (className) {
      baseStyles += className;
    }

    return baseStyles;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(getButtonStyles())}>
        {loading ? <LoadingSpinner className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigateTo("/profile")} disabled={loading}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo("/tasks")} disabled={loading}>
          Tasks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loading} variant="destructive">
          {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
