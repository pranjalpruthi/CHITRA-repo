"use client";
import { cn } from "@/lib/utils";
import { useMouse } from "@/hooks/use-mouse";
import type { ReactNode } from "react";

interface GradientBentoCardProps {
  icon?: ReactNode;
  title: string;
  value?: React.ReactNode;
  description?: string;
  circleSize?: number;
  className?: string;
  children?: ReactNode;
  gradient?: string;
  size?: "default" | "double" | "full";
}

export function GradientBentoCard({
  icon,
  title,
  value,
  description,
  circleSize = 400,
  className,
  children,
  gradient = "linear-gradient(135deg, #3BC4F2, #7A69F9, #F26378, #F5833F)",
  size = "default",
}: GradientBentoCardProps) {
  const [mouse, parentRef] = useMouse();

  return (
    <div
      className={cn(
        "group relative transform-gpu overflow-hidden rounded-xl border border-white/20 dark:border-white/10 transition-transform hover:scale-[1.01]",
        size === "default" && "col-span-1",
        size === "double" && "col-span-2",
        size === "full" && "col-span-4",
        className
      )}
      ref={parentRef}
    >
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 absolute transform-gpu rounded-full transition-transform duration-500 group-hover:scale-[3]",
          mouse.elementX === null || mouse.elementY === null
            ? "opacity-0"
            : "opacity-100",
        )}
        style={{
          maskImage: `radial-gradient(${circleSize / 2}px circle at center, white, transparent)`,
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          left: `${mouse.elementX}px`,
          top: `${mouse.elementY}px`,
          background: gradient,
        }}
      />
      <div className="absolute inset-[1px] rounded-[11px] bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-sm" />
      <div className={cn(
        "relative p-6",
        size === "full" && "p-8",
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-medium">{title}</h4>
          </div>
          {value}
        </div>
        {children}
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}