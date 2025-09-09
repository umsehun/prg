/**
 * GameCanvas - Dedicated Canvas Rendering Component
 * Single Responsibility: Handle all canvas drawing and animations
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Pin {
    id: number;
    angle: number;
    timestamp: number;
    stuck: boolean;
}

interface HitEffect {
    id: number;
    x: number;
    y: number;
    type: 'PERFECT' | 'GOOD' | 'MISS';
    timestamp: number;
}

interface GameCanvasProps {
    targetRotation: number;
    pins: Pin[];
    hitEffects: HitEffect[];
    currentPinAngle: number;
    gameState: string;
    width?: number;
    height?: number;
}

const TARGET_RADIUS = 150;
const PIN_LENGTH = 40;

export function GameCanvas({
    targetRotation,
    pins,
    hitEffects,
    currentPinAngle,
    gameState,
    width = 600,
    height = 600
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set center point
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw target circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, TARGET_RADIUS, 0, 2 * Math.PI);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();

        // Draw stuck pins
        pins.forEach(pin => {
            const x = centerX + Math.cos((pin.angle * Math.PI) / 180) * TARGET_RADIUS;
            const y = centerY + Math.sin((pin.angle * Math.PI) / 180) * TARGET_RADIUS;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos((pin.angle * Math.PI) / 180) * PIN_LENGTH,
                y + Math.sin((pin.angle * Math.PI) / 180) * PIN_LENGTH
            );
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Draw pin head
            ctx.beginPath();
            ctx.arc(
                x + Math.cos((pin.angle * Math.PI) / 180) * PIN_LENGTH,
                y + Math.sin((pin.angle * Math.PI) / 180) * PIN_LENGTH,
                3,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        });

        // Draw current pin position indicator
        const currentX = centerX + Math.cos(((targetRotation + currentPinAngle) * Math.PI) / 180) * (TARGET_RADIUS + 30);
        const currentY = centerY + Math.sin(((targetRotation + currentPinAngle) * Math.PI) / 180) * (TARGET_RADIUS + 30);

        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Draw aim line
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(centerX, centerY);
        ctx.strokeStyle = '#ef444440';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw hit effects
        hitEffects.forEach(effect => {
            const age = Date.now() - effect.timestamp;
            const alpha = Math.max(0, 1 - age / 1000);
            const scale = 1 + (age / 1000) * 0.5; // Grow effect

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `${20 * scale}px bold`;
            ctx.textAlign = 'center';

            if (effect.type === 'PERFECT') {
                ctx.fillStyle = '#22c55e';
                ctx.fillText('PERFECT!', centerX + effect.x, centerY + effect.y);
            } else if (effect.type === 'GOOD') {
                ctx.fillStyle = '#eab308';
                ctx.fillText('GOOD!', centerX + effect.x, centerY + effect.y);
            } else {
                ctx.fillStyle = '#ef4444';
                ctx.fillText('MISS!', centerX + effect.x, centerY + effect.y);
            }
            ctx.restore();
        });

        // Continue animation if playing
        if (gameState === 'playing') {
            animationFrameRef.current = requestAnimationFrame(render);
        }
    }, [targetRotation, pins, hitEffects, currentPinAngle, gameState]);

    // Animation loop
    useEffect(() => {
        render();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [render]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto bg-slate-900 rounded-lg border border-slate-600"
            style={{ maxWidth: `${width}px`, maxHeight: `${height}px` }}
        />
    );
}

export type { Pin, HitEffect, GameCanvasProps };
