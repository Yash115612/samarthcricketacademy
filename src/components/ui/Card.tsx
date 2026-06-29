import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-academy-gray border border-white/10 rounded-xl overflow-hidden shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: CardProps) => (
  <div className={cn("p-6 pb-2", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: CardProps) => (
  <h3 className={cn("text-xl font-bold text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }: CardProps) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: CardProps) => (
  <div className={cn("p-6 border-t border-white/5", className)} {...props}>
    {children}
  </div>
);
