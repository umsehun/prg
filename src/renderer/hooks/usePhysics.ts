/**
 * React hook for managing Matter.js physics in Web Worker
 * Provides clean interface between React components and physics simulation
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { KnifePhysics, GameConfig } from '../../shared/types/core';

interface PhysicsState {
    knives: KnifePhysics[];
    target: {
        x: number;
        y: number;
        angle: number;
        rotationSpeed: number;
    };
}

interface UsePhysicsOptions {
    config: GameConfig;
    onKnifeStuck?: (knife: KnifePhysics) => void;
    onKnifeCollision?: (knifeId: string) => void;
    onKnifeRemoved?: (knifeId: string) => void;
}

export function usePhysics({
    config,
    onKnifeStuck,
    onKnifeCollision,
    onKnifeRemoved
}: UsePhysicsOptions) {
    const workerRef = useRef<Worker | null>(null);
    const [physicsState, setPhysicsState] = useState<PhysicsState>({
        knives: [],
        target: { x: 0, y: 0, angle: 0, rotationSpeed: 0 }
    });
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize physics worker
    useEffect(() => {
        // Create worker from file
        workerRef.current = new Worker(
            new URL('../workers/physics.worker.ts', import.meta.url),
            { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (event) => {
            const { type, data } = event.data;

            switch (type) {
                case 'initialized':
                    setIsInitialized(true);
                    setPhysicsState(prev => ({
                        ...prev,
                        target: {
                            x: data.targetX,
                            y: data.targetY,
                            angle: 0,
                            rotationSpeed: config.targetRotationSpeed
                        }
                    }));
                    break;

                case 'physicsUpdate':
                    setPhysicsState({
                        knives: data.knives.map((knife: any) => ({
                            id: knife.id,
                            x: knife.x,
                            y: knife.y,
                            velocity: Math.sqrt(knife.velocityX ** 2 + knife.velocityY ** 2),
                            angle: knife.angle,
                            isStuck: knife.isStuck,
                            stuckAngle: knife.stuckAngle
                        })),
                        target: data.target
                    });
                    break;

                case 'knifeStuck':
                    if (onKnifeStuck) {
                        onKnifeStuck({
                            id: data.id,
                            x: data.x,
                            y: data.y,
                            velocity: 0,
                            angle: data.angle,
                            isStuck: true,
                            stuckAngle: data.stuckAngle
                        });
                    }
                    break;

                case 'knifeCollision':
                    if (onKnifeCollision) {
                        onKnifeCollision(data.id);
                    }
                    break;

                case 'knifeRemoved':
                    if (onKnifeRemoved) {
                        onKnifeRemoved(data.id);
                    }
                    break;
            }
        };

        // Initialize physics with config
        workerRef.current.postMessage({
            type: 'initialize',
            data: {
                canvasWidth: config.canvasWidth,
                canvasHeight: config.canvasHeight,
                targetRadius: config.targetRadius,
                knifeVelocity: config.knifeVelocity,
                targetRotationSpeed: config.targetRotationSpeed
            }
        });

        // Cleanup on unmount
        return () => {
            if (workerRef.current) {
                workerRef.current.postMessage({ type: 'dispose' });
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []); // Empty dependency array - only run once

    // Update config when it changes
    useEffect(() => {
        if (workerRef.current && isInitialized) {
            workerRef.current.postMessage({
                type: 'updateConfig',
                data: {
                    targetRotationSpeed: config.targetRotationSpeed,
                    knifeVelocity: config.knifeVelocity
                }
            });
        }
    }, [config.targetRotationSpeed, config.knifeVelocity, isInitialized]);

    // Throw knife function
    const throwKnife = useCallback((
        id: string,
        startX: number,
        startY: number,
        targetX: number,
        targetY: number
    ) => {
        if (workerRef.current && isInitialized) {
            workerRef.current.postMessage({
                type: 'throwKnife',
                data: { id, startX, startY, targetX, targetY }
            });
        }
    }, [isInitialized]);

    // Get knife by ID
    const getKnife = useCallback((id: string): KnifePhysics | undefined => {
        return physicsState.knives.find(knife => knife.id === id);
    }, [physicsState.knives]);

    // Get all active (flying) knives
    const getActiveKnives = useCallback((): KnifePhysics[] => {
        return physicsState.knives.filter(knife => !knife.isStuck);
    }, [physicsState.knives]);

    // Get all stuck knives
    const getStuckKnives = useCallback((): KnifePhysics[] => {
        return physicsState.knives.filter(knife => knife.isStuck);
    }, [physicsState.knives]);

    // Reset physics simulation
    const reset = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'reset' });
        }
    }, []);

    return {
        // State
        physicsState,
        isInitialized,

        // Target info
        target: physicsState.target,

        // Knife collections
        allKnives: physicsState.knives,
        activeKnives: getActiveKnives(),
        stuckKnives: getStuckKnives(),

        // Actions
        throwKnife,
        getKnife,
        reset,

        // Stats
        totalKnives: physicsState.knives.length,
        activeKnifeCount: getActiveKnives().length,
        stuckKnifeCount: getStuckKnives().length
    };
}

export default usePhysics;
