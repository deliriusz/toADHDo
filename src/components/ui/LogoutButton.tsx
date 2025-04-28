import { useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LogoutButton({ className, variant = "default", size = "default" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      setLoading(true);
      console.log("Making logout request to /api/auth/logout");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Logout response status:", response.status);

      if (response.ok) {
        console.log("Logout successful, redirecting to home page");
        // Przekierowanie do strony logowania po udanym wylogowaniu
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
    <button onClick={handleLogout} className={getButtonStyles()} disabled={loading} type="button">
      {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      Sign Out
    </button>
  );
}
