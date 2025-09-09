/**
 * App Header - Main navigation header for PRG
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Home,
    Music,
    Settings,
    Minimize2,
    Square,
    X,
    Gamepad2
} from 'lucide-react';

interface AppHeaderProps {
    currentPage?: string;
    onNavigate?: (page: string) => void;
}

export function AppHeader({ currentPage = 'home', onNavigate }: AppHeaderProps) {
    const [platform, setPlatform] = useState<string>('unknown');
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Detect platform
        if (typeof window !== 'undefined') {
            const userAgent = window.navigator.userAgent.toLowerCase();
            if (userAgent.includes('mac')) {
                setPlatform('darwin');
            } else if (userAgent.includes('win')) {
                setPlatform('win32');
            } else {
                setPlatform('linux');
            }
        }
    }, []);

    const handleNavigation = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        } else {
            // Fallback to window navigation
            window.location.href = `/${page}`;
        }
    };

    const handleMinimize = () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            (window as any).electronAPI.system.minimize();
        }
    };

    const handleMaximize = () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            (window as any).electronAPI.system.toggleMaximize();
        }
        setIsMaximized(!isMaximized);
    };

    const handleClose = () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            (window as any).electronAPI.system.close();
        }
    };

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'select', label: 'Select', icon: Music, path: '/select' },
        { id: 'game', label: 'Game', icon: Gamepad2, path: '/game' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
    ];

    return (
        <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 select-none">
            {/* Left: App Title & Navigation */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">P</span>
                    </div>
                    <span className="font-semibold text-sm">PRG</span>
                </div>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id ||
                            (currentPage === 'home' && item.id === 'home');

                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 px-3 gap-2"
                                onClick={() => handleNavigation(item.id)}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Window Controls (Windows/Linux only) */}
            {platform !== 'darwin' && (
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={handleMinimize}
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={handleMaximize}
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </header>
    );
}
