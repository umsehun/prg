"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <motion.div
            className={cn(
                "border-2 border-current border-t-transparent rounded-full",
                sizeClasses[size],
                className
            )}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    )
}

interface LoadingDotsProps {
    className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-current rounded-full"
                    animate={{
                        y: ["0%", "-50%", "0%"],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

export function PulsingOrb({ className }: { className?: string }) {
    return (
        <motion.div
            className={cn(
                "w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full",
                className
            )}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    )
}
