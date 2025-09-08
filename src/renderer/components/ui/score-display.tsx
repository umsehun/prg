import * as React from "react"
import { cn } from "@/lib/utils"

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    score: number
    accuracy: number
    combo: number
    variant?: 'default' | 'compact' | 'minimal'
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
    ({ className, score, accuracy, combo, variant = 'default', ...props }, ref) => {
        const formattedScore = score.toLocaleString()
        const formattedAccuracy = `${(accuracy * 100).toFixed(2)}%`

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 p-4",
                    {
                        'default': 'space-y-2',
                        'compact': 'flex items-center justify-between space-x-4 py-2',
                        'minimal': 'flex items-center space-x-2 p-2'
                    }[variant],
                    className
                )}
                {...props}
            >
                {variant === 'default' && (
                    <>
                        <div className="text-center">
                            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                                {formattedScore}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                Score
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-primary">
                                    {formattedAccuracy}
                                </div>
                                <div className="text-xs text-muted-foreground">Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-game-combo">
                                    {combo}x
                                </div>
                                <div className="text-xs text-muted-foreground">Combo</div>
                            </div>
                        </div>
                    </>
                )}

                {variant === 'compact' && (
                    <>
                        <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold font-mono">{formattedScore}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-primary">{formattedAccuracy}</span>
                            <span className="text-sm text-game-combo">{combo}x</span>
                        </div>
                    </>
                )}

                {variant === 'minimal' && (
                    <>
                        <span className="text-sm font-mono">{formattedScore}</span>
                        <span className="text-xs text-primary">{formattedAccuracy}</span>
                        <span className="text-xs text-game-combo">{combo}x</span>
                    </>
                )}
            </div>
        )
    }
)
ScoreDisplay.displayName = "ScoreDisplay"

export { ScoreDisplay }
