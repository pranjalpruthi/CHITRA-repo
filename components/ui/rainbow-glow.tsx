"use client"

import { cn } from "@/lib/utils"

interface RainbowGlowProps {
  className?: string
  containerClassName?: string
}

export function RainbowGlow({ className, containerClassName }: RainbowGlowProps) {
  return (
    <div className={cn("absolute bottom-0 left-0 right-0 h-32 z-[1]", containerClassName)}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 flex justify-center">
          {/* Multiple glowing orbs with different animations */}
          <div className="absolute bottom-[-20%] h-24 w-[40%] animate-pulse-glow 
            bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 
            blur-3xl rounded-full" 
          />
          <div className="absolute bottom-[-25%] h-24 w-[45%] animate-pulse-glow-fast 
            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
            blur-3xl rounded-full" 
            style={{ animationDelay: "-1s" }}
          />
          <div className="absolute bottom-[-15%] h-20 w-[35%] animate-pulse-slow 
            bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-indigo-500/25 
            blur-3xl rounded-full" 
            style={{ animationDelay: "-2s" }}
          />
        </div>
      </div>

      {/* Rainbow Border Glow */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] z-[2]", className)}>
        <div className="relative w-full h-full animate-rainbow bg-gradient-to-r 
          from-purple-500/50 via-pink-500/50 to-orange-500/50 
          [--speed:4s]" 
        />
      </div>
    </div>
  )
}