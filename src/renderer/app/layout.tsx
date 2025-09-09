import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AppHeader } from '@/components/ui/app-header'
import { cn } from '@/lib/utils'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Prg',
    description: 'A modern rhythm game experience',
    authors: [{ name: 'PRG Team' }],
    keywords: ['rhythm game', 'music', 'osu', 'electron'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    'overflow-hidden', // Prevent scrolling in Electron
                    inter.variable,
                    jetbrainsMono.variable
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="relative flex h-screen w-screen flex-col">
                        <AppHeader />
                        <main className="flex-1 overflow-hidden">
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
