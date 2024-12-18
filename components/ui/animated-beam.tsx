"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { forwardRef, useEffect, useState } from "react";

interface CircleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Circle = forwardRef<HTMLDivElement, CircleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full",
          "bg-gradient-to-b from-white/10 to-white/5 dark:from-white/5 dark:to-white/0",
          "border border-white/20 dark:border-white/10",
          "shadow-lg backdrop-blur-md",
          "hover:scale-105 transition-transform duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Circle.displayName = "Circle";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  dotted?: boolean;
  reverse?: boolean;
  gradientStartColor?: string;
  gradientStopColor?: string;
  endYOffset?: number;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  dotted = false,
  reverse = false,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#60a5fa",
  endYOffset = 0,
}: AnimatedBeamProps) {
  const [path, setPath] = useState<string>("");
  const [length, setLength] = useState<number>(0);
  const uniqueId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const from = {
        x: fromRect.left - containerRect.left + fromRect.width / 2,
        y: fromRect.top - containerRect.top + fromRect.height / 2,
      };

      const to = {
        x: toRect.left - containerRect.left + toRect.width / 2,
        y: toRect.top - containerRect.top + toRect.height / 2 + (endYOffset || 0),
      };

      // Calculate control points for a smoother curve
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Adjust control points based on distance
      const controlPoint1 = {
        x: from.x + dx * 0.25,
        y: from.y + dy * 0.1 + curvature,
      };
      
      const controlPoint2 = {
        x: from.x + dx * 0.75,
        y: to.y - dy * 0.1 + curvature,
      };

      // Use cubic Bezier curve for smoother animation
      const pathString = `M ${from.x},${from.y} C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${to.x},${to.y}`;
      setPath(pathString);

      const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svgPath.setAttribute("d", pathString);
      setLength(svgPath.getTotalLength());
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, [containerRef, fromRef, toRef, curvature, endYOffset]);

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ filter: "blur(0.3px)" }}
    >
      <defs>
        <linearGradient
          id={uniqueId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0.2" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Base path with glow effect */}
      <motion.path
        d={path}
        stroke={`url(#${uniqueId})`}
        strokeWidth="3"
        fill="none"
        strokeDasharray={dotted ? "8 4" : "0"}
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Animated particle */}
      <motion.circle
        cx="0"
        cy="0"
        r="3"
        fill={gradientStartColor}
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
          repeat: Infinity,
          delay: reverse ? 1.25 : 0,
        }}
        style={{
          offsetPath: `path("${path}")`,
        }}
      />
    </svg>
  );
} 