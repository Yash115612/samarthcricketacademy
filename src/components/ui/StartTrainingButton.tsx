"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

interface StartTrainingButtonProps {
  className?: string;
  label?: string;
}

export function StartTrainingButton({ className, label = "Start Training" }: StartTrainingButtonProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isLoading) return;
    if (user) {
      // Scroll down to the content section of the home page
      const target = document.getElementById("explore-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/about");
      }
    } else {
      // After sign in, land on dashboard (no callbackUrl override)
      router.push("/signin");
    }
  };

  const displayLabel = user ? "Explore More" : label;

  return (
    <Button
      variant="secondary"
      size="lg"
      className={className}
      onClick={handleClick}
    >
      {displayLabel} <ArrowRight className="ml-2" />
    </Button>
  );
}
