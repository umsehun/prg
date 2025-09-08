"use client"

import { motion } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonProps {
    hoverScale?: number
    tapScale?: number
    hoverRotate?: number
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    ({ children, hoverScale = 1.05, tapScale = 0.95, hoverRotate = 0, className, ...props }, ref) => {
        return (
            <motion.div
                whileHover={{
                    scale: hoverScale,
                    rotate: hoverRotate,
                }}
                whileTap={{
                    scale: tapScale
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                }}
            >
                <Button
                    ref={ref}
                    className={className}
                    {...props}
                >
                    {children}
                </Button>
            </motion.div>
        )
    }
)

AnimatedButton.displayName = "AnimatedButton"

export default AnimatedButton
