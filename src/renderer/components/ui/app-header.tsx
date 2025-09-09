/**
 * AppHeader Component - Main Application Header with Navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import {
    Home,
    Music,
    Play,
    Target,
    Settings,
    Minus,
    Square,
    X
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
            if (typeof window !== 'undefined') {
                const targetPath = page === 'home' ? '/' : `/${page}`;
                window.location.href = targetPath;
            }
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
        { id: 'home', label: '홈', icon: Home, path: '/' },
        { id: 'select', label: '라이브러리', icon: Music, path: '/select' },
        { id: 'play', label: '플레이', icon: Play, path: '/play' },
        { id: 'pin', label: '핀 모드', icon: Target, path: '/pin' },
        { id: 'settings', label: '설정', icon: Settings, path: '/settings' }
    ];

    return (
        <header
            className="isolate fixed top-0 left-0 right-0 z-[9999] h-16 flex items-center justify-between px-4 select-none bg-gray-900 border-b border-gray-700 shadow-lg"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            {/* Left: App Title & Navigation */}
            <div
                className="flex items-center gap-8"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-white">
                            Pin Rhythm
                        </span>
                        <span className="text-gray-400 text-xs -mt-1">리듬 게임</span>
                    </div>
                </div>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id ||
                            (currentPage === 'home' && item.id === 'home');

                        return (
                            <Button
                                key={item.id}
                                variant="ghost"
                                size="sm"
                                className={`h-9 px-3 gap-2 font-medium text-sm transition-all duration-200 rounded ${isActive
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                onClick={() => handleNavigation(item.id)}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Window Controls */}
            {platform !== 'darwin' && (
                <div
                    className="flex items-center gap-1"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                        onClick={handleMinimize}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                        onClick={handleMaximize}
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-600 text-gray-400 hover:text-white rounded"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </header>
    );
}
