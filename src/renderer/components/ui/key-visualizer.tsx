import * as React from "react"
import { cn } from "@/lib/utils"

interface KeyVisualizerProps {
    keys: Array<{
        key: string
        isPressed: boolean
        label?: string
    }>
    className?: string
}

export function KeyVisualizer({ keys, className }: KeyVisualizerProps) {
    return (
        <div className={cn("flex space-x-2", className)}>
            {keys.map((keyData, index) => (
                <div
                    key={`${keyData.key}-${index}`}
                    className={cn(
                        "relative flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all duration-75",
                        "font-mono text-sm font-bold",
                        keyData.isPressed
                            ? "border-primary bg-primary text-primary-foreground scale-110 shadow-lg"
                            : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                    )}
                >
                    <span>{keyData.label || keyData.key.toUpperCase()}</span>

                    {/* Pressed effect */}
                    {keyData.isPressed && (
                        <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse" />
                    )}
                </div>
            ))}
        </div>
    )
}

// Hook for detecting key presses
export function useKeyPress() {
    const [pressedKeys, setPressedKeys] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setPressedKeys(prev => new Set([...prev, event.key.toLowerCase()]))
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            setPressedKeys(prev => {
                const newSet = new Set(prev)
                newSet.delete(event.key.toLowerCase())
                return newSet
            })
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return pressedKeys
}

export default KeyVisualizer
