import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-academy-red text-white hover:bg-opacity-90",
      secondary: "bg-academy-gold text-academy-dark hover:bg-opacity-90",
      outline: "border border-white/20 bg-transparent hover:bg-white/5",
      ghost: "bg-transparent hover:bg-white/5",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-6 py-2 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-academy-gold/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95 will-change-transform touch-manipulation",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
