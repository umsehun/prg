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
    title: 'Pin Rhythm - 혁신적인 리듬 게임',
    description: 'osu! 비트맵을 새로운 방식으로 즐기는 핀 던지기 리듬 게임',
    authors: [{ name: 'Pin Rhythm Team' }],
    keywords: ['리듬게임', '음악게임', 'osu', '핀모드', 'rhythm game', 'music game'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Pin Rhythm - osu! 비트맵을 새로운 방식으로 즐기는 핀 던지기 리듬 게임" />
                <meta name="keywords" content="리듬게임,음악게임,osu,핀모드,rhythm game,music game" />
                <meta name="author" content="Pin Rhythm Team" />
                <title>Pin Rhythm - 혁신적인 리듬 게임</title>
            </head>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    'overflow-x-hidden', // Allow vertical scroll, prevent horizontal
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
                    <div className="relative flex h-screen w-screen flex-col bg-slate-950">
                        <AppHeader />
                        <main className="flex-1 overflow-y-auto pt-20">
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
