/**
 * PRG Design System
 * Centralized design tokens and utilities for consistent UI
 */

// ===== COLOR PALETTE =====
export const colors = {
    // Brand Colors
    brand: {
        primary: '#0ea5e9',      // Sky blue - main brand color
        secondary: '#facc15',    // Yellow - accent color
        tertiary: '#8b5cf6',     // Purple - special elements
    },

    // Game Colors (for hit judgments, etc.)
    game: {
        perfect: '#22c55e',      // Green - perfect hits
        great: '#3b82f6',        // Blue - great hits  
        good: '#f59e0b',         // Orange - good hits
        miss: '#ef4444',         // Red - misses
        combo: '#8b5cf6',        // Purple - combo effects
    },

    // Semantic Colors
    semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },

    // Neutral Colors (Dark theme optimized)
    neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    }
} as const

// ===== TYPOGRAPHY =====
export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
    },

    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px  
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        display: '4rem',    // 64px
    },

    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    }
} as const

// ===== SPACING =====
export const spacing = {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
} as const

// ===== LAYOUT =====
export const layout = {
    borderRadius: {
        none: '0',
        sm: '0.125rem',   // 2px
        base: '0.25rem',  // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        full: '9999px',
    },

    boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

        // Game-specific shadows
        game: '0 0 20px rgba(59, 130, 246, 0.3)',
        combo: '0 0 30px rgba(139, 92, 246, 0.4)',
        perfect: '0 0 15px rgba(34, 197, 94, 0.4)',
    },

    maxWidth: {
        xs: '20rem',      // 320px
        sm: '24rem',      // 384px
        md: '28rem',      // 448px
        lg: '32rem',      // 512px
        xl: '36rem',      // 576px
        '2xl': '42rem',   // 672px
        '3xl': '48rem',   // 768px
        '4xl': '56rem',   // 896px
        '5xl': '64rem',   // 1024px
        '6xl': '72rem',   // 1152px
        '7xl': '80rem',   // 1280px
        full: '100%',
    }
} as const

// ===== ANIMATION =====
export const animation = {
    duration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
        slower: '500ms',
    },

    easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

        // Game-specific easing
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
} as const

// ===== BREAKPOINTS =====
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const

// ===== Z-INDEX SCALE =====
export const zIndex = {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
    game: 9000,      // Game elements
    gameUI: 9100,    // Game UI overlays
} as const

// ===== DESIGN TOKENS EXPORT =====
export const designTokens = {
    colors,
    typography,
    spacing,
    layout,
    animation,
    breakpoints,
    zIndex,
} as const

// ===== UTILITY FUNCTIONS =====

/**
 * Get color value with optional opacity
 */
export function getColor(colorPath: string, opacity?: number): string {
    // This would be implemented to traverse the color object
    // For now, return the color path for CSS custom properties
    return opacity ? `hsl(var(--${colorPath}) / ${opacity})` : `hsl(var(--${colorPath}))`
}

/**
 * Get spacing value
 */
export function getSpacing(value: keyof typeof spacing): string {
    return spacing[value]
}

/**
 * Get font size with line height
 */
export function getFontSize(size: keyof typeof typography.fontSize): {
    fontSize: string
    lineHeight: string
} {
    const fontSize = typography.fontSize[size]
    const lineHeight = size === 'xs' || size === 'sm' ? typography.lineHeight.tight :
        size === 'base' || size === 'lg' ? typography.lineHeight.normal :
            typography.lineHeight.relaxed

    return { fontSize, lineHeight: lineHeight.toString() }
}

/**
 * Generate consistent component variant styles
 */
export function createVariants<T extends Record<string, any>>(variants: T): T {
    return variants
}

export default designTokens
