/**
 * OSU-style Hit Circle Component
 * Features:
 * - Approach circle that shrinks to hit circle size
 * - Hit detection on timing
 * - Visual feedback for hits/misses
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { Circle, Group } from 'react-konva';
import Konva from 'konva';

export interface HitCircleData {
    id: string;
    x: number;
    y: number;
    time: number; // Hit time in milliseconds from song start
    radius: number;
}

export interface HitCircleProps {
    circle: HitCircleData;
    currentTime: number;
    onHit: (circleId: string, timing: 'perfect' | 'great' | 'good' | 'miss') => void;
    approachTime: number; // Time in ms for approach circle animation
}

export const OsuHitCircle: React.FC<HitCircleProps> = ({
    circle,
    currentTime,
    onHit,
    approachTime = 1000 // 1 second approach time
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const approachCircleRef = useRef<Konva.Circle>(null);
    const hitCircleRef = useRef<Konva.Circle>(null);
    
    const [isVisible, setIsVisible] = useState(false);
    const [isHit, setIsHit] = useState(false);
    
    // Timing windows (in milliseconds)
    const PERFECT_WINDOW = 80;
    const GREAT_WINDOW = 140;
    const GOOD_WINDOW = 200;
    
    // Calculate approach circle progress
    const timeUntilHit = circle.time - currentTime;
    const approachProgress = Math.max(0, Math.min(1, (approachTime - timeUntilHit) / approachTime));
    
    // Circle should be visible during approach time
    useEffect(() => {
        const shouldBeVisible = timeUntilHit <= approachTime && timeUntilHit >= -GOOD_WINDOW;
        setIsVisible(shouldBeVisible);
        
        // Auto-miss if too late
        if (timeUntilHit < -GOOD_WINDOW && !isHit) {
            setIsHit(true);
            onHit(circle.id, 'miss');
        }
    }, [timeUntilHit, approachTime, isHit, circle.id, onHit]);
    
    // Approach circle animation
    useEffect(() => {
        if (!approachCircleRef.current || !isVisible) return;
        
        const approachRadius = circle.radius + (circle.radius * 2 * (1 - approachProgress));
        approachCircleRef.current.radius(approachRadius);
        approachCircleRef.current.opacity(Math.max(0, 1 - approachProgress * 0.3));
        
        // Redraw layer
        approachCircleRef.current.getLayer()?.batchDraw();
    }, [approachProgress, circle.radius, isVisible]);
    
    // Hit detection function
    const handleHit = () => {
        if (isHit) return;
        
        const timingDiff = Math.abs(timeUntilHit);
        let timing: 'perfect' | 'great' | 'good' | 'miss';
        
        if (timingDiff <= PERFECT_WINDOW) {
            timing = 'perfect';
        } else if (timingDiff <= GREAT_WINDOW) {
            timing = 'great';
        } else if (timingDiff <= GOOD_WINDOW) {
            timing = 'good';
        } else {
            timing = 'miss';
        }
        
        setIsHit(true);
        onHit(circle.id, timing);
        
        // Hit animation
        if (hitCircleRef.current && timing !== 'miss') {
            const tween = new Konva.Tween({
                node: hitCircleRef.current,
                duration: 0.15,
                scaleX: 1.5,
                scaleY: 1.5,
                opacity: 0,
                easing: Konva.Easings.EaseOut,
                onFinish: () => {
                    setIsVisible(false);
                }
            });
            tween.play();
        }
    };
    
    if (!isVisible) return null;
    
    return (
        <Group
            ref={groupRef}
            x={circle.x}
            y={circle.y}
            onClick={handleHit}
            onTap={handleHit}
        >
            {/* Approach Circle */}
            <Circle
                ref={approachCircleRef}
                radius={circle.radius * 3}
                stroke="#ffffff"
                strokeWidth={3}
                opacity={0.8}
            />
            
            {/* Hit Circle */}
            <Circle
                ref={hitCircleRef}
                radius={circle.radius}
                fill="#ff6b9d"
                stroke="#ffffff"
                strokeWidth={4}
                opacity={isHit ? 0.5 : 1}
            />
            
            {/* Circle number/text could go here */}
            {/* <Text
                text="1"
                fontSize={24}
                fill="#ffffff"
                fontFamily="Arial"
                align="center"
                verticalAlign="middle"
                offsetX={12}
                offsetY={12}
            /> */}
        </Group>
    );
};

export default OsuHitCircle;
