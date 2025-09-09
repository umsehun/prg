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
            className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 select-none"
            style={{ 
                zIndex: 999999,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #7c3aed 100%)',
                backdropFilter: 'blur(20px)',
                borderBottom: '3px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 4px 30px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Left: App Title & Navigation */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-14 h-14 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse"
                        style={{ 
                            filter: 'drop-shadow(0 0 25px rgba(168, 85, 247, 0.6))'
                        }}
                    >
                        <Target className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span 
                            className="font-black text-2xl text-white tracking-wide"
                            style={{ 
                                textShadow: '0 0 15px rgba(255, 255, 255, 0.4), 0 3px 6px rgba(0, 0, 0, 0.8)',
                                fontFamily: 'Inter, -apple-system, sans-serif'
                            }}
                        >
                            Pin Rhythm
                        </span>
                        <span className="text-purple-200 text-xs font-medium -mt-1">혁신적인 리듬 게임</span>
                    </div>
                </div>

                <nav className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id ||
                            (currentPage === 'home' && item.id === 'home');

                        return (
                            <Button
                                key={item.id}
                                variant="ghost"
                                size="sm"
                                className={`h-12 px-5 gap-2 font-bold text-sm transition-all duration-300 border-2 rounded-xl ${
                                    isActive 
                                        ? 'bg-purple-600/80 text-white border-purple-300 shadow-lg backdrop-blur-sm' 
                                        : 'text-purple-100 hover:bg-purple-800/50 hover:text-white hover:border-purple-400/50 border-transparent backdrop-blur-sm'
                                }`}
                                style={isActive ? {
                                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(168, 85, 247, 0.9) 100%)'
                                } : {}}
                                onClick={() => handleNavigation(item.id)}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="font-bold">{item.label}</span>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Window Controls (Windows/Linux only) */}
            {platform !== 'darwin' && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-yellow-500/20 text-purple-200 hover:text-yellow-300"
                        onClick={handleMinimize}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-500/20 text-purple-200 hover:text-green-300"
                        onClick={handleMaximize}
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-500/20 text-purple-200 hover:text-red-300"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </header>
    );
}
