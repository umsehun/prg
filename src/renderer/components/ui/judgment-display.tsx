import * as React from "react"
import { cn } from "@/lib/utils"

type JudgmentType = 'perfect' | 'great' | 'good' | 'miss'

interface JudgmentDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    judgment: JudgmentType
    show: boolean
    duration?: number
}

const judgmentConfig = {
    perfect: {
        text: 'PERFECT',
        className: 'text-game-perfect',
        bgClassName: 'bg-game-perfect/10',
    },
    great: {
        text: 'GREAT',
        className: 'text-game-great',
        bgClassName: 'bg-game-great/10',
    },
    good: {
        text: 'GOOD',
        className: 'text-game-good',
        bgClassName: 'bg-game-good/10',
    },
    miss: {
        text: 'MISS',
        className: 'text-game-miss',
        bgClassName: 'bg-game-miss/10',
    },
} as const

const JudgmentDisplay = React.forwardRef<HTMLDivElement, JudgmentDisplayProps>(
    ({ className, judgment, show, duration = 800, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false)
        const config = judgmentConfig[judgment]

        React.useEffect(() => {
            if (show) {
                setVisible(true)
                const timer = setTimeout(() => setVisible(false), duration)
                return () => clearTimeout(timer)
            }
        }, [show, duration])

        if (!visible) return null

        return (
            <div
                ref={ref}
                className={cn(
                    "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                    "z-gameUI pointer-events-none",
                    "animate-in fade-in-0 zoom-in-95 duration-150",
                    "animate-out fade-out-0 zoom-out-95 duration-300 fill-mode-forwards",
                    className
                )}
                style={{
                    animationDelay: show ? '0ms' : `${duration - 300}ms`,
                }}
                {...props}
            >
                <div
                    className={cn(
                        "px-8 py-4 rounded-2xl backdrop-blur-md border",
                        "font-bold text-2xl tracking-wider",
                        "shadow-lg transform scale-100",
                        config.className,
                        config.bgClassName,
                        "border-current/20"
                    )}
                >
                    {config.text}
                </div>
            </div>
        )
    }
)
JudgmentDisplay.displayName = "JudgmentDisplay"

export { JudgmentDisplay, type JudgmentType }
