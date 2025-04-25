import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return <div className={cn("animate-spin rounded-full border-b-2 border-primary", className)} {...props} />;
}
