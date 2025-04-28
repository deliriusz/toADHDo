import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the login form schema using Zod
const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      console.log("Login form submitted", data);

      // Make API call to login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to login");
      }

      // On successful login, redirect to tasks page
      window.location.href = "/tasks";
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" className="bg-red-500/20 border-rose-400 text-white">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-blue-100">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          disabled={loading}
          {...register("email")}
          className="bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 focus:border-blue-200/30 focus:ring-blue-200/20"
        />
        {errors.email && <p className="text-sm text-rose-300">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-blue-100">
            Password
          </Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={loading}
          {...register("password")}
          className="bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 focus:border-blue-200/30 focus:ring-blue-200/20"
        />
        {errors.password && <p className="text-sm text-rose-300">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-white/10 border border-white/20 text-blue-100 hover:bg-white/20 hover:text-white"
        disabled={loading}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        Sign In
      </Button>
    </form>
  );
}
