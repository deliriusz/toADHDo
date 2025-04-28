import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the forgot password form schema using Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      console.log("Forgot password form submitted", data);

      // Make API call to forgot-password endpoint
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to process request");
      }

      setIsSuccess(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-primary/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-blue-100">
        <p className="text-center text-sm">
          If an account exists with that email, we&apos;ve sent password reset instructions.
          <br />
          <br />
          Please check your email.
        </p>
      </div>
    );
  }

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

      <Button
        type="submit"
        className="w-full bg-white/10 border border-white/20 text-blue-100 hover:bg-white/20 hover:text-white"
        disabled={loading}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        Send Reset Link
      </Button>
    </form>
  );
}
