'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Home,
    Music,
    Play,
    Gamepad2,
    Settings,
    Pin
} from 'lucide-react';

const navItems = [
    {
        name: 'Home',
        href: '/home',
        icon: Home,
        description: '홈'
    },
    {
        name: 'Select',
        href: '/select',
        icon: Music,
        description: '곡 선택'
    },
    {
        name: 'Play',
        href: '/play',
        icon: Play,
        description: '플레이'
    },
    {
        name: 'Game',
        href: '/game',
        icon: Gamepad2,
        description: '게임'
    },
    {
        name: 'Pin',
        href: '/pin',
        icon: Pin,
        description: '핀 모드'
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: '설정'
    }
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                {/* Logo/Brand */}
                <div className="mr-4 hidden md:flex">
                    <Link
                        href="/"
                        className="mr-6 flex items-center space-x-2 text-xl font-bold tracking-tight"
                    >
                        <Pin className="h-6 w-6 text-primary" />
                        <span className="font-mono">Pin Rhythm</span>
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href ||
                                    (pathname === '/' && item.href === '/home');

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                                            'h-9 px-3 py-2',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                            'disabled:pointer-events-none disabled:opacity-50',
                                            isActive
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                        title={item.description}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline-block">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Theme Toggle or other actions can go here */}
                        <div className="h-8 w-px bg-border" />

                        {/* Current Page Indicator */}
                        <div className="hidden lg:flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>현재:</span>
                            <span className="font-medium text-foreground">
                                {navItems.find(item =>
                                    item.href === pathname || (pathname === '/' && item.href === '/home')
                                )?.description || '메인'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
