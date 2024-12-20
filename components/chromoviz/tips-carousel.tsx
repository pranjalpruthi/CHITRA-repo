'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ArrowRight, Lightbulb } from "lucide-react"

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
  className?: string
  variant?: 'default' | 'compact'
}

export function TipsCarousel({ className, variant = 'default' }: TipsCarouselProps) {
  const [step, setStep] = useState(1)
  const totalSteps = tips.length

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  if (variant === 'compact') {
    return (
      <Dialog onOpenChange={(open) => {
        if (open) setStep(1)
      }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-xs">Tips</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="gap-0 p-0">
          <div className="space-y-6 p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tips[step - 1].icon}</span>
                <DialogTitle>{tips[step - 1].title}</DialogTitle>
              </div>
              <DialogDescription>{tips[step - 1].description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex justify-center space-x-1.5 max-sm:order-1">
                {[...Array(totalSteps)].map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-primary",
                      index + 1 === step ? "bg-primary" : "opacity-20",
                    )}
                  />
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Skip
                  </Button>
                </DialogClose>
                {step < totalSteps ? (
                  <Button className="group" type="button" onClick={handleContinue}>
                    Next
                    <ArrowRight
                      className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button type="button">Got it</Button>
                  </DialogClose>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Return default variant if needed
  return null
} 