import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
    max?: number
    variant?: 'default' | 'game' | 'health' | 'loading'
    size?: 'sm' | 'md' | 'lg'
    showValue?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({
        className,
        value,
        max = 100,
        variant = 'default',
        size = 'md',
        showValue = false,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

        const sizeClasses = {
            sm: 'h-1',
            md: 'h-2',
            lg: 'h-3'
        }

        const progressVariants = cva(
  "h-2 w-full overflow-hidden rounded-full bg-primary/20",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        game: "bg-gradient-to-r from-primary/20 to-secondary/20",
        health: "bg-red-500/20",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        game: "bg-gradient-to-r from-primary to-secondary",
        health: "bg-gradient-to-r from-red-500 to-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

        return (
            <div
                ref={ref}
                className={cn(
                    "relative w-full overflow-hidden rounded-full bg-secondary/30",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        "h-full transition-all duration-300 ease-out",
                        variantClasses[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                />

                {showValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        )
    }
)
Progress.displayName = "Progress"

export { Progress }
