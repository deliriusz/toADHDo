import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

export default function ProfileForm() {
  const [context, setContext] = useState<string>("");
  const [initialContext, setInitialContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch current user context on mount
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to fetch profile context");
        }
        return res.json();
      })
      .then((data) => {
        setContext(data.context_data ?? "");
        setInitialContext(data.context_data ?? "");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast("Error", { description: message });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (context.length < 20) {
      toast("Error", { description: "Context must be at least 20 characters" });
      return;
    }
    if (context.length > 5000) {
      toast("Error", { description: "Context cannot exceed 5000 characters" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context_data: context }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile context");
      }
      setInitialContext(data.context_data);
      toast("Success", { description: "Profile context updated" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setContext(initialContext);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="context">User Context</Label>
        <Textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isLoading}
          className="min-h-[12rem]"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{context.length}/5000</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading || context === initialContext}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading || context === initialContext}>
            {isLoading ? <LoadingSpinner /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
