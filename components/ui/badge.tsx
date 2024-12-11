import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        glow: "border border-black/5 bg-gradient-to-b from-white/80 to-white/50 dark:from-neutral-900/90 dark:to-neutral-800/90 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  glowColor?: string;
}

function Badge({ className, variant, icon, glowColor = "purple", ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && variant === "glow" && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-${glowColor}-400 opacity-75`}></span>
          <span className={`relative inline-flex h-2 w-2 rounded-full bg-${glowColor}-500`}></span>
        </span>
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
