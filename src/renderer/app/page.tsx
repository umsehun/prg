"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedButton } from '@/components/ui/animated-button'
import { PageTransition } from '@/components/ui/page-transition'
import { Play, Settings, Folder, Info } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function HomePage() {
  return (
    <PageTransition className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8 p-8"
      >
        {/* Logo/Title */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0%", "100%", "0%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            PRG
          </motion.h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Pixel Rhythm Game
          </p>
        </motion.div>

        {/* Menu Items */}
        <motion.div variants={itemVariants} className="space-y-4">
          <AnimatedButton 
            asChild 
            size="lg" 
            className="w-full justify-start text-left h-16 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            hoverScale={1.02}
          >
            <Link href="/select" className="flex items-center space-x-4">
              <Play className="h-6 w-6" />
              <div>
                <div className="font-semibold">Play</div>
                <div className="text-sm opacity-80">Start your rhythm adventure</div>
              </div>
            </Link>
          </AnimatedButton>

          <AnimatedButton 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full justify-start text-left h-16 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            hoverScale={1.02}
          >
            <Link href="/settings" className="flex items-center space-x-4">
              <Settings className="h-6 w-6" />
              <div>
                <div className="font-semibold">Settings</div>
                <div className="text-sm opacity-60">Configure your experience</div>
              </div>
            </Link>
          </AnimatedButton>

          <AnimatedButton 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full justify-start text-left h-16 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            hoverScale={1.02}
          >
            <Link href="/import" className="flex items-center space-x-4">
              <Folder className="h-6 w-6" />
              <div>
                <div className="font-semibold">Import Songs</div>
                <div className="text-sm opacity-60">Add your music collection</div>
              </div>
            </Link>
          </AnimatedButton>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center">
          <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <Info className="h-4 w-4" />
                <span>v0.1.0 - Alpha Build</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating orbs for visual flair */}
        <motion.div
          className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-30"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-6 h-6 bg-purple-400 rounded-full opacity-20"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 right-4 w-3 h-3 bg-pink-400 rounded-full opacity-25"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>
    </PageTransition>
  )
}
