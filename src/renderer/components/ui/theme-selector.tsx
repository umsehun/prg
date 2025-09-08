import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { useTheme } from "next-themes"
import { gameThemes } from "@/lib/theme"

interface ThemeSelectorProps {
    className?: string
}

const themes = [
    {
        id: 'light',
        name: 'Light',
        description: 'Clean and bright',
        preview: {
            background: 'bg-white',
            foreground: 'bg-slate-900',
            primary: 'bg-blue-600',
            secondary: 'bg-slate-100',
        }
    },
    {
        id: 'dark',
        name: 'Dark',
        description: 'Easy on the eyes',
        preview: {
            background: 'bg-slate-900',
            foreground: 'bg-white',
            primary: 'bg-blue-500',
            secondary: 'bg-slate-800',
        }
    },
    {
        id: 'system',
        name: 'System',
        description: 'Follows your OS setting',
        preview: {
            background: 'bg-gradient-to-br from-white to-slate-900',
            foreground: 'bg-slate-600',
            primary: 'bg-blue-500',
            secondary: 'bg-slate-400',
        }
    }
]

const gameThemeOptions = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'osu! inspired colors',
        colors: ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500']
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon and electric',
        colors: ['bg-green-400', 'bg-purple-500', 'bg-cyan-400', 'bg-red-500', 'bg-yellow-400']
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Subtle and clean',
        colors: ['bg-gray-800', 'bg-gray-600', 'bg-gray-400', 'bg-gray-200', 'bg-gray-500']
    }
]

export function ThemeSelector({ className }: ThemeSelectorProps) {
    const { theme, setTheme } = useTheme()
    const [gameTheme, setGameTheme] = React.useState('classic')

    return (
        <div className={cn("space-y-6", className)}>
            {/* Base Theme */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Base Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((themeOption) => (
                        <Card
                            key={themeOption.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                theme === themeOption.id && "ring-2 ring-primary"
                            )}
                            onClick={() => setTheme(themeOption.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    {/* Theme Preview */}
                                    <div className="relative w-12 h-8 rounded border overflow-hidden">
                                        <div className={cn("w-full h-full", themeOption.preview.background)} />
                                        <div className={cn("absolute top-1 left-1 w-3 h-2 rounded-sm", themeOption.preview.primary)} />
                                        <div className={cn("absolute bottom-1 right-1 w-2 h-2 rounded-sm", themeOption.preview.secondary)} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{themeOption.name}</h4>
                                            {theme === themeOption.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {themeOption.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Game Theme */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Game Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gameThemeOptions.map((themeOption) => (
                        <Card
                            key={themeOption.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                gameTheme === themeOption.id && "ring-2 ring-primary"
                            )}
                            onClick={() => setGameTheme(themeOption.id)}
                        >
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{themeOption.name}</h4>
                                        {gameTheme === themeOption.id && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {themeOption.description}
                                    </p>

                                    {/* Color Preview */}
                                    <div className="flex space-x-1">
                                        {themeOption.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className={cn("w-4 h-4 rounded-sm", color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ThemeSelector
