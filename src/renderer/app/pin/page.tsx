/**
 * OSU-style Rhythm Game Page
 * Full-screen game with approach circles and hit circles
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useRouter } from 'next/navigation';

// OSU-style Hit Circle Component
interface HitObject {
    id: string;
    x: number;
    y: number;
    time: number; // Hit timing in milliseconds
    radius: number;
    number: number;
    color: string;
}

interface HitResult {
    id: string;
    judgment: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';
    accuracy: number;
    timestamp: number;
    x: number;
    y: number;
}

// Simple OSU Canvas Component
function OsuGameCanvas({ 
    hitObjects, 
    currentTime, 
    onHit 
}: { 
    hitObjects: HitObject[], 
    currentTime: number, 
    onHit: (id: string, accuracy: number) => void 
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Draw function
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Filter visible hit objects
        const visibleObjects = hitObjects.filter(obj => {
            const timeDiff = obj.time - currentTime;
            return timeDiff <= 600 && timeDiff >= -200;
        });

        // Draw hit objects
        visibleObjects.forEach(obj => {
            const timeDiff = obj.time - currentTime;
            
            // Calculate approach circle scale (4 -> 1)
            const approachScale = Math.max(1, 4 - (3 * Math.max(0, (600 - timeDiff) / 600)));
            
            // Calculate opacity
            let opacity = 1;
            if (timeDiff > 200) {
                opacity = Math.max(0, (600 - timeDiff) / 400);
            } else if (timeDiff < -50) {
                opacity = Math.max(0, (50 + timeDiff) / 150);
            }

            ctx.globalAlpha = opacity;

            // Draw approach circle (shrinking)
            if (timeDiff > 0 && approachScale > 1) {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius * approachScale, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw hit circle (fixed size)
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
            ctx.fillStyle = obj.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw number
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.number.toString(), obj.x, obj.y);
        });

        ctx.globalAlpha = 1;
    }, [hitObjects, currentTime]);

    // Handle click
    const handleClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find hit objects near click
        hitObjects.forEach(obj => {
            const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
            if (distance <= obj.radius + 20) {
                const timeDiff = Math.abs(obj.time - currentTime);
                onHit(obj.id, Math.max(0, 300 - timeDiff));
            }
        });
    };

    return (
        <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="cursor-pointer"
            style={{ background: '#000' }}
            onClick={handleClick}
        />
    );
}

// Hit judgment display
function HitJudgment({ 
    hitResult, 
    onClear 
}: { 
    hitResult: HitResult | null, 
    onClear: () => void 
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (hitResult) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                onClear();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hitResult, onClear]);

    if (!visible || !hitResult) return null;

    const getJudgmentColor = (judgment: string) => {
        switch (judgment) {
            case 'PERFECT': return '#00ff88';
            case 'GREAT': return '#88ff00';
            case 'GOOD': return '#ffff00';
            case 'MISS': return '#ff0000';
            default: return '#ffffff';
        }
    };

    const getJudgmentText = (judgment: string) => {
        switch (judgment) {
            case 'PERFECT': return '300';
            case 'GREAT': return '100';
            case 'GOOD': return '50';
            case 'MISS': return 'MISS';
            default: return '';
        }
    };

    return (
        <div
            className="fixed pointer-events-none z-50"
            style={{
                left: `${hitResult.x}px`,
                top: `${hitResult.y}px`,
                transform: 'translate(-50%, -50%)',
                color: getJudgmentColor(hitResult.judgment),
                fontSize: '2rem',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                animation: 'hitFade 1s ease-out forwards'
            }}
        >
            {getJudgmentText(hitResult.judgment)}
        </div>
    );
}

export default function OsuGamePage() {
    const router = useRouter();
    const {
        currentSong,
        gameState,
        stats,
        pauseGame,
        resumeGame,
        stopGame,
        updateStats
    } = useGameState();

    // Audio/Video refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Game state
    const [currentTime, setCurrentTime] = useState(0);
    const [hitObjects, setHitObjects] = useState<HitObject[]>([]);
    const [hitResult, setHitResult] = useState<HitResult | null>(null);

    // ESC key handling
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (gameState === 'playing') {
                    pauseGame();
                } else if (gameState === 'paused') {
                    resumeGame();
                }
            } else if (e.key.toLowerCase() === 's' && !e.repeat) {
                // S key hit detection
                const sortedObjects = [...hitObjects].sort((a, b) => 
                    Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime)
                );
                
                if (sortedObjects.length > 0) {
                    const closest = sortedObjects[0];
                    const timeDiff = Math.abs(closest.time - currentTime);
                    
                    if (timeDiff <= 150) {
                        handleHit(closest.id, Math.max(0, 300 - timeDiff));
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, pauseGame, resumeGame, hitObjects, currentTime]);

    // Generate demo hit objects
    useEffect(() => {
        if (currentSong && gameState === 'playing') {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
            const demoObjects: HitObject[] = [];
            
            for (let i = 0; i < 20; i++) {
                demoObjects.push({
                    id: `hit_${i}`,
                    x: 200 + (i % 4) * 200,
                    y: 150 + Math.floor(i / 4) * 120,
                    time: 2000 + i * 1000, // Start 2s in, 1s intervals
                    radius: 50,
                    number: i + 1,
                    color: colors[i % colors.length]
                });
            }
            
            setHitObjects(demoObjects);
        }
    }, [currentSong, gameState]);

    // Media loading and playback
    useEffect(() => {
        if (currentSong && gameState === 'playing') {
            // Load and play audio
            if (audioRef.current && currentSong.audioFile) {
                audioRef.current.src = `file://${currentSong.audioFile}`;
                audioRef.current.play().catch(console.error);
            }
            
            // Load and play video if available (check if property exists)
            if (videoRef.current && (currentSong as any).videoFile) {
                videoRef.current.src = `file://${(currentSong as any).videoFile}`;
                videoRef.current.play().catch(console.error);
            }
        }
    }, [currentSong, gameState]);

    // Update current time
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                if (audioRef.current && !audioRef.current.paused) {
                    setCurrentTime(audioRef.current.currentTime * 1000);
                }
            }, 16);
            
            return () => clearInterval(interval);
        }
    }, [gameState]);

    // Hit handling
    const handleHit = useCallback((hitObjectId: string, accuracy: number) => {
        const hitObject = hitObjects.find(obj => obj.id === hitObjectId);
        if (!hitObject) return;

        const timeDiff = currentTime - hitObject.time;
        const absTimeDiff = Math.abs(timeDiff);
        
        let judgment: HitResult['judgment'];
        if (absTimeDiff <= 50) judgment = 'PERFECT';
        else if (absTimeDiff <= 100) judgment = 'GREAT';
        else if (absTimeDiff <= 150) judgment = 'GOOD';
        else judgment = 'MISS';

        const baseScore = { 'PERFECT': 300, 'GREAT': 100, 'GOOD': 50, 'MISS': 0 };
        const score = baseScore[judgment];

        // Show hit result
        setHitResult({
            id: hitObjectId,
            judgment,
            accuracy,
            timestamp: currentTime,
            x: hitObject.x,
            y: hitObject.y
        });

        // Update stats
        const newCombo = judgment === 'MISS' ? 0 : stats.combo + 1;
        updateStats({
            score: stats.score + score,
            combo: newCombo,
            hits: {
                ...stats.hits,
                [judgment.toLowerCase()]: stats.hits[judgment.toLowerCase() as keyof typeof stats.hits] + 1
            }
        });

        // Remove hit object
        setHitObjects(prev => prev.filter(obj => obj.id !== hitObjectId));
        
        console.log(`🎯 ${judgment}: ${timeDiff}ms | Score: ${score}`);
    }, [hitObjects, currentTime, stats, updateStats]);

    if (gameState === 'idle' || !currentSong) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">곡을 선택해주세요</h3>
                    <button 
                        onClick={() => router.push('/select')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        곡 선택하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background Video */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                muted
                playsInline
            />

            {/* Audio */}
            <audio ref={audioRef} />

            {/* HUD */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center gap-8 text-white text-xl font-bold">
                    <div>Score: {stats.score.toLocaleString()}</div>
                    <div>Combo: {stats.combo}x</div>
                    <div className="text-sm opacity-80">{currentSong.title}</div>
                </div>
            </div>

            {/* Game Canvas */}
            <div className="flex items-center justify-center min-h-screen">
                {gameState === 'playing' ? (
                    <OsuGameCanvas
                        hitObjects={hitObjects}
                        currentTime={currentTime}
                        onHit={handleHit}
                    />
                ) : (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {gameState === 'paused' ? '일시정지' : '게임 대기'}
                        </h3>
                        <p className="text-slate-300 mb-4">
                            {gameState === 'paused' ? 'ESC를 눌러 재개' : '게임을 시작해주세요'}
                        </p>
                        {gameState === 'paused' && (
                            <div className="flex gap-4 justify-center">
                                <button 
                                    onClick={resumeGame}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    재개
                                </button>
                                <button 
                                    onClick={stopGame}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    정지
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hit Judgment */}
            <HitJudgment
                hitResult={hitResult}
                onClear={() => setHitResult(null)}
            />

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes hitFade {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
                    70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `}</style>
        </div>
    );
}
