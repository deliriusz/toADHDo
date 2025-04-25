import { useState } from "react";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LogoutButton({ className, variant = "default", size = "default" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Przekierowanie do strony logowania po udanym wylogowaniu
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} className={className} variant={variant} size={size} disabled={loading}>
      {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      Sign Out
    </Button>
  );
}
