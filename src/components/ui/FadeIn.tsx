"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  fullWidth?: boolean;
  className?: string;
}

export const FadeIn = ({ 
  children, 
  delay = 0, 
  direction, 
  fullWidth = false,
  className 
}: FadeInProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
        x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1], // snappier cubic-bezier
      }}
      className={cn(
        fullWidth ? "w-full" : "", 
        "will-change-transform will-change-opacity",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
