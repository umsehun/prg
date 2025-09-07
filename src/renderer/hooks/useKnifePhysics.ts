import { useState, useCallback, useRef, useEffect } from 'react';

export interface Knife {
    id: number;
    isStuck: boolean;
    stuckAngle: number;
    thrownAt: number;
    position: KnifePosition;
}

export interface KnifePosition {
    x: number;
    y: number;
    rotation: number;
}

interface UseKnifePhysicsProps {
    targetRadius: number;
    velocity: number;
    rotationSpeed: number;
    isGameActive: boolean;
}

export const useKnifePhysics = ({
    targetRadius,
    velocity = 400,
    rotationSpeed = 540,
    isGameActive
}: UseKnifePhysicsProps) => {
    const [knives, setKnives] = useState<Knife[]>([]);
    const workerRef = useRef<Worker | null>(null);
    const knifeIdCounter = useRef(0);
    const hitCallbackRef = useRef<((hitData: any) => void) | null>(null);

    useEffect(() => {
        console.log('[useKnifePhysics] Initializing physics worker...');
        try {
            const worker = new Worker(new URL('./physics.worker.ts', import.meta.url));
            workerRef.current = worker;

            console.log('[useKnifePhysics] Worker created, sending INIT message');
            worker.postMessage({ type: 'INIT', payload: { targetRadius, velocity, rotationSpeed } });

            worker.onmessage = (e: MessageEvent) => {
                const { type, payload } = e.data;
                console.log('[useKnifePhysics] Worker message:', type, payload);
                if (type === 'UPDATE') {
                    setKnives(payload.knives);
                } else if (type === 'HIT') {
                    console.log('[useKnifePhysics] Hit detected:', payload);
                    if (hitCallbackRef.current) {
                        hitCallbackRef.current(payload);
                    }
                }
            };

            worker.onerror = (error) => {
                console.error('[useKnifePhysics] Worker error:', error);
            };

            return () => {
                console.log('[useKnifePhysics] Terminating worker');
                worker.terminate();
            };
        } catch (error) {
            console.error('[useKnifePhysics] Failed to create worker:', error);
        }
    }, [targetRadius, velocity, rotationSpeed]);

    // 칼 던지기
    const throwKnife = useCallback(() => {
        console.log('[useKnifePhysics] throwKnife called, isGameActive:', isGameActive, 'worker:', !!workerRef.current);
        if (!isGameActive || !workerRef.current) {
            console.log('[useKnifePhysics] Cannot throw knife - game inactive or no worker');
            return;
        }

        const newKnife: Knife = {
            id: knifeIdCounter.current++,
            isStuck: false,
            stuckAngle: 0,
            thrownAt: Date.now(),
            position: { x: 0, y: 250, rotation: 0 } // Initial position
        };

        console.log('[useKnifePhysics] Throwing knife:', newKnife);
        workerRef.current.postMessage({ type: 'THROW', payload: { knife: newKnife } });
    }, [isGameActive]);

    // 모든 칼 위치 계산 (워커로부터 받은 데이터를 그대로 사용)
    const getKnivesPositions = useCallback(() => {
        return knives.map(knife => ({
            knife,
            position: knife.position // 워커가 계산한 위치 정보 사용
        }));
    }, [knives]);

    // 판정 콜백 설정
    const setHitCallback = useCallback((callback: (hitData: any) => void) => {
        hitCallbackRef.current = callback;
    }, []);

    // 노트 데이터 설정 (판정을 위해 필요)
    const setActiveNotes = useCallback((notes: Array<{ time: number }>) => {
        console.log('[useKnifePhysics] Setting active notes:', notes.length);
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'SET_NOTES', payload: { notes } });
        }
    }, []);

    // 판정 윈도우 설정
    const setJudgmentWindows = useCallback((windows: { KOOL: number; COOL: number; GOOD: number; MISS: number }) => {
        console.log('[useKnifePhysics] Setting judgment windows:', windows);
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'SET_JUDGMENT_WINDOWS', payload: { windows } });
        }
    }, []);

    // 게임 리셋
    const resetKnives = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'RESET' });
        }
        setKnives([]);
        knifeIdCounter.current = 0;
    }, []);

    // 꽂힌 칼 개수
    const stuckKnivesCount = knives.filter(knife => knife.isStuck).length;

    return {
        knives,
        throwKnife,
        getKnivesPositions,
        resetKnives,
        stuckKnivesCount,
        setHitCallback,
        setActiveNotes,
        setJudgmentWindows
    };
};
