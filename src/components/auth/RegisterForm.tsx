import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the registration form schema using Zod
const registerFormSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      // Make API call to register endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        const errorMessage = responseData.error?.message || "Failed to register";
        throw new Error(errorMessage);
      }

      // On successful registration, redirect to login page with success flag
      window.location.href = "/login?registered=true";
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
        <Label htmlFor="fullName" className="text-blue-100">
          Full Name (optional)
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          disabled={loading}
          {...register("fullName")}
          className="bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 focus:border-blue-200/30 focus:ring-blue-200/20"
        />
        {errors.fullName && <p className="text-sm text-rose-300">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-blue-100">
          Password
        </Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-blue-100">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          disabled={loading}
          {...register("confirmPassword")}
          className="bg-white/5 border-white/20 text-blue-100 placeholder:text-blue-100/50 focus:border-blue-200/30 focus:ring-blue-200/20"
        />
        {errors.confirmPassword && <p className="text-sm text-rose-300">{errors.confirmPassword.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-white/10 border border-white/20 text-blue-100 hover:bg-white/20 hover:text-white"
        disabled={loading}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        Create Account
      </Button>
    </form>
  );
}
