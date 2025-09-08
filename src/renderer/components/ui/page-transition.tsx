"use client"

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
    children: ReactNode
    className?: string
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.3,
                ease: "easeInOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{
                duration: 0.4,
                ease: "easeOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function ScaleTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
                duration: 0.2,
                ease: "easeInOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
