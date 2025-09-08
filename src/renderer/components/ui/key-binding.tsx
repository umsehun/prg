import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface KeyBindingProps {
    label: string
    currentKey: string
    onKeyChange: (newKey: string) => void
    className?: string
}

export function KeyBinding({ label, currentKey, onKeyChange, className }: KeyBindingProps) {
    const [isListening, setIsListening] = React.useState(false)
    const [tempKey, setTempKey] = React.useState(currentKey)

    React.useEffect(() => {
        if (!isListening) return

        const handleKeyDown = (event: KeyboardEvent) => {
            event.preventDefault()
            const key = event.key.toLowerCase()
            setTempKey(key)
            setIsListening(false)
            onKeyChange(key)
        }

        const handleClickOutside = () => {
            setIsListening(false)
            setTempKey(currentKey)
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('click', handleClickOutside)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('click', handleClickOutside)
        }
    }, [isListening, currentKey, onKeyChange])

    const handleStartListening = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsListening(true)
    }

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <label className="text-sm font-medium">{label}</label>
            <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={handleStartListening}
                className={cn(
                    "w-16 font-mono",
                    isListening && "animate-pulse"
                )}
            >
                {isListening ? "..." : (tempKey || currentKey).toUpperCase()}
            </Button>
        </div>
    )
}

export default KeyBinding
