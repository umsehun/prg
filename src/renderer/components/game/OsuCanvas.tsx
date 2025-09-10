/**
 * OSU-style Hit Circle Component
 * Renders hit circles with approach circles that shrink over time
 */

import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Text } from 'react-konva';
import Konva from 'konva';

export interface HitObject {
    id: string;
    x: number;
    y: number;
    time: number; // Hit timing in milliseconds
    radius: number;
    number: number; // Circle number (1, 2, 3, ...)
}

export interface OsuCanvasProps {
    width: number;
    height: number;
    hitObjects: HitObject[];
    currentTime: number; // Current audio time in milliseconds
    onHit: (hitObjectId: string, accuracy: number) => void;
    preemptTime?: number; // How early to show approach circle (ms)
    fadeInTime?: number; // Fade in duration (ms)
}

export function OsuCanvas({
    width,
    height,
    hitObjects,
    currentTime,
    onHit,
    preemptTime = 600,
    fadeInTime = 400
}: OsuCanvasProps) {
    const stageRef = useRef<Konva.Stage>(null);

    // Get visible hit objects (within timing window)
    const visibleHitObjects = hitObjects.filter(obj => {
        const timeDiff = obj.time - currentTime;
        return timeDiff <= preemptTime && timeDiff >= -200; // Show 600ms early, hide 200ms late
    });

    // Calculate approach circle scale based on timing
    const getApproachScale = (hitTime: number, currentTime: number) => {
        const timeDiff = hitTime - currentTime;
        if (timeDiff <= 0) return 1; // Hit time reached
        
        const progress = Math.max(0, (preemptTime - timeDiff) / preemptTime);
        return 4 - (3 * progress); // Scale from 4 to 1
    };

    // Calculate opacity based on timing
    const getOpacity = (hitTime: number, currentTime: number) => {
        const timeDiff = hitTime - currentTime;
        
        if (timeDiff > preemptTime - fadeInTime) {
            // Fade in phase
            const fadeProgress = (preemptTime - timeDiff) / fadeInTime;
            return Math.max(0, fadeProgress);
        } else if (timeDiff >= -50) {
            // Fully visible
            return 1;
        } else {
            // Fade out after hit
            const fadeProgress = Math.max(0, (50 + timeDiff) / 150);
            return fadeProgress;
        }
    };

    // Handle click/tap
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        // Find hit objects near the click
        visibleHitObjects.forEach(obj => {
            const distance = Math.sqrt(
                Math.pow(pos.x - obj.x, 2) + Math.pow(pos.y - obj.y, 2)
            );

            if (distance <= obj.radius + 20) { // Hit tolerance
                const timeDiff = Math.abs(obj.time - currentTime);
                const accuracy = Math.max(0, 300 - timeDiff); // Simple accuracy calculation
                onHit(obj.id, accuracy);
            }
        });
    };

    // Handle keyboard input (S key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 's' && !e.repeat) {
                // Find the closest hit object to current time
                const sortedObjects = [...visibleHitObjects].sort((a, b) => 
                    Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime)
                );

                if (sortedObjects.length > 0) {
                    const closest = sortedObjects[0];
                    const timeDiff = Math.abs(closest.time - currentTime);
                    
                    if (timeDiff <= 150) { // Hit window
                        const accuracy = Math.max(0, 300 - timeDiff);
                        onHit(closest.id, accuracy);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visibleHitObjects, currentTime, onHit]);

    return (
        <Stage
            ref={stageRef}
            width={width}
            height={height}
            onClick={handleStageClick}
            onTap={handleStageClick}
            style={{ background: '#000' }}
        >
            <Layer>
                {visibleHitObjects.map((obj) => {
                    const approachScale = getApproachScale(obj.time, currentTime);
                    const opacity = getOpacity(obj.time, currentTime);

                    return (
                        <React.Fragment key={obj.id}>
                            {/* Approach Circle */}
                            <Circle
                                x={obj.x}
                                y={obj.y}
                                radius={obj.radius * approachScale}
                                stroke="#ffffff"
                                strokeWidth={3}
                                opacity={opacity * 0.8}
                            />

                            {/* Hit Circle */}
                            <Circle
                                x={obj.x}
                                y={obj.y}
                                radius={obj.radius}
                                fill="#ff6b6b"
                                stroke="#ffffff"
                                strokeWidth={3}
                                opacity={opacity}
                            />

                            {/* Circle Number */}
                            <Text
                                x={obj.x}
                                y={obj.y}
                                text={obj.number.toString()}
                                fontSize={24}
                                fontFamily="Arial"
                                fill="#ffffff"
                                align="center"
                                verticalAlign="middle"
                                offsetX={12}
                                offsetY={12}
                                opacity={opacity}
                            />
                        </React.Fragment>
                    );
                })}
            </Layer>
        </Stage>
    );
}
