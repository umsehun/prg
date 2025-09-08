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

        const variantClasses = {
            default: {
                background: 'bg-primary/20',
                fill: 'bg-primary'
            },
            game: {
                background: 'bg-gradient-to-r from-primary/20 to-secondary/20',
                fill: 'bg-gradient-to-r from-primary to-secondary'
            },
            health: {
                background: 'bg-red-500/20',
                fill: 'bg-gradient-to-r from-red-500 to-red-600'
            },
            loading: {
                background: 'bg-muted',
                fill: 'bg-primary animate-pulse'
            }
        }

        return (
            <div className={cn("relative", className)} ref={ref} {...props}>
                <div
                    className={cn(
                        "w-full overflow-hidden rounded-full",
                        sizeClasses[size],
                        variantClasses[variant].background
                    )}
                >
                    <div
                        className={cn(
                            "h-full transition-all duration-300 ease-out",
                            variantClasses[variant].fill
                        )}
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>
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
