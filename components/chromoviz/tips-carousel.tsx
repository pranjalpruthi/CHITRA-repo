'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const tips = [
  {
    title: "Select Synteny Blocks",
    description: "Click on the colored ribbons to select and compare synteny blocks. View details in the side panel.",
    icon: "🎯"
  },
  {
    title: "Navigation Controls",
    description: "Use the arrow keys or on-screen controls to pan. Zoom with mouse wheel or zoom buttons.",
    icon: "🎮"
  },
  {
    title: "Filter View",
    description: "Toggle between forward and reverse alignments using the filter buttons.",
    icon: "🔍"
  },
  {
    title: "Export Data",
    description: "Export your selected synteny blocks as CSV for further analysis.",
    icon: "📊"
  },
  {
    title: "Detailed View",
    description: "Click on a block to see detailed information in the side panel.",
    icon: "ℹ️"
  }
]

interface TipsCarouselProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function TipsCarousel({ className, variant = 'default' }: TipsCarouselProps) {
  const [currentTip, setCurrentTip] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTip = () => {
    setIsAutoPlaying(false)
    setCurrentTip((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setIsAutoPlaying(false)
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "relative group h-8 flex items-center",
        className
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 w-full"
          >
            <div className="text-yellow-500 flex items-center gap-1.5 flex-shrink-0">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Tip:</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">
                <span className="inline sm:hidden">
                  {tips[currentTip].title}
                </span>
                <span className="hidden sm:inline">
                  {tips[currentTip].description}
                </span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={prevTip}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={nextTip}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden bg-background/50 backdrop-blur-sm",
      className
    )}>
      <div className="absolute top-2 left-2">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
      </div>
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[100px] flex flex-col items-center justify-center text-center px-8"
          >
            <div className="text-2xl mb-2">{tips[currentTip].icon}</div>
            <h3 className="text-sm font-medium mb-1">{tips[currentTip].title}</h3>
            <p className="text-xs text-muted-foreground">{tips[currentTip].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={prevTip}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={nextTip}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {tips.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-4.5 h-4.5 rounded-full transition-all",
                currentTip === index
                  ? "bg-primary w-3"
                  : "bg-primary/20"
              )}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentTip(index)
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
} 