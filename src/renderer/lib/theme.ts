/**
 * PRG Game-specific Theme Configuration
 * Game colors and theme utilities (next-themes handles base theming)
 */

// ===== GAME COLORS =====
export const gameColors = {
    // Hit judgment colors
    perfect: 'hsl(142.1 76.2% 36.3%)',  // Green
    great: 'hsl(221.2 83.2% 53.3%)',    // Blue  
    good: 'hsl(32.6 94.6% 43.7%)',      // Orange
    miss: 'hsl(0 84.2% 60.2%)',         // Red
    combo: 'hsl(250.5 91.2% 66.9%)',    // Purple

    // Game UI colors
    noteTrack: 'hsl(214.3 31.8% 91.4%)',
    hitZone: 'hsl(221.2 83.2% 53.3%)',
    background: 'hsl(224 71.4% 4.1%)',
} as const

// ===== GAME THEMES =====
export const gameThemes = {
    // Classic osu! inspired
    classic: {
        name: 'Classic',
        perfect: 'hsl(120 100% 50%)',  // Bright green
        great: 'hsl(240 100% 60%)',    // Blue
        good: 'hsl(60 100% 50%)',      // Yellow
        miss: 'hsl(0 100% 50%)',       // Red
        combo: 'hsl(315 100% 70%)',    // Pink
    },

    // Cyberpunk theme  
    cyberpunk: {
        name: 'Cyberpunk',
        perfect: 'hsl(120 100% 60%)',  // Neon green
        great: 'hsl(280 100% 70%)',    // Neon purple
        good: 'hsl(180 100% 50%)',     // Cyan
        miss: 'hsl(0 100% 60%)',       // Neon red
        combo: 'hsl(45 100% 60%)',     // Neon yellow
    },

    // Minimal theme
    minimal: {
        name: 'Minimal',
        perfect: 'hsl(0 0% 10%)',      // Dark gray
        great: 'hsl(0 0% 30%)',        // Gray
        good: 'hsl(0 0% 50%)',         // Light gray
        miss: 'hsl(0 0% 70%)',         // Lighter gray
        combo: 'hsl(0 0% 20%)',        // Dark gray
    }
} as const

// ===== UTILITY FUNCTIONS =====

/**
 * Get game color CSS custom property
 */
export function getGameColor(colorName: keyof typeof gameColors): string {
    return `var(--game-${colorName}, ${gameColors[colorName]})`
}

/**
 * Apply game theme colors to CSS custom properties
 */
export function applyGameTheme(themeName: keyof typeof gameThemes): void {
    const theme = gameThemes[themeName]
    const root = document.documentElement

    Object.entries(theme).forEach(([key, value]) => {
        if (key !== 'name') {
            root.style.setProperty(`--game-${key}`, value)
        }
    })
}

/**
 * Reset to default game colors
 */
export function resetGameTheme(): void {
    const root = document.documentElement

    Object.entries(gameColors).forEach(([key, value]) => {
        root.style.setProperty(`--game-${key}`, value)
    })
}

export default {
    gameColors,
    gameThemes,
    getGameColor,
    applyGameTheme,
    resetGameTheme,
}