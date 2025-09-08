// Base UI Components
export { Button, buttonVariants } from './button'
export { Input } from './input'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Slider } from './slider'
export { Switch } from './switch'
export { Progress } from './progress'
export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
} from './select'
export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from './dialog'

// Game-specific components
export { ScoreDisplay } from './score-display'
export { JudgmentDisplay, type JudgmentType } from './judgment-display'
export { FilterBar } from './filter-bar'
export { SongCard, type Song } from './song-card'
export { KeyVisualizer, useKeyPress } from './key-visualizer'
export { default as GameHUD } from './game-hud'
export { default as GameLane } from './game-lane'

// Animation components
export { AnimatedButton } from './animated-button'
export { PageTransition, SlideTransition, ScaleTransition } from './page-transition'
export { LoadingSpinner, LoadingDots, PulsingOrb } from './loading-animations'

// Future game components
// export { ComboCounter } from './combo-counter'
// export { HealthBar } from './health-bar'
// export { NoteVisualizer } from './note-visualizer'