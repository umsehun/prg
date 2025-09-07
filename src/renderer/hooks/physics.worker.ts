// src/renderer/hooks/physics.worker.ts

import { Knife, KnifePosition } from './useKnifePhysics';

let knives: Knife[] = [];
let targetRadius = 0;
let velocity = 400;
let rotationSpeed = 540;

const KNIFE_TIP_OFFSET = 32;
const STICK_DEPTH = 10;
const FLYING_ROTATION_DEG = 0;
const STUCK_ROTATION_OFFSET = -90;
const TOTAL_FLIGHT_TIME = 0.30;

const calculateKnifePosition = (knife: Knife): KnifePosition => {
    const currentTime = Date.now();
    const elapsed = (currentTime - knife.thrownAt) / 1000;

    if (knife.isStuck) {
        const targetRotation = (currentTime / 1000 * 120) % 360;
        const finalAngle = targetRotation + knife.stuckAngle;
        const angleRad = (finalAngle * Math.PI) / 180;
        const effectiveRadius = (targetRadius + KNIFE_TIP_OFFSET) - STICK_DEPTH;
        const x = Math.cos(angleRad) * effectiveRadius;
        const y = Math.sin(angleRad) * effectiveRadius;
        const rotation = finalAngle + STUCK_ROTATION_OFFSET;
        return { x, y, rotation };
    } else {
        const startY = 250;
        const y = startY - (elapsed * velocity);
        const x = 0;
        const rotation = FLYING_ROTATION_DEG;
        return { x, y, rotation };
    }
};

const updatePhysics = () => {
    const currentTime = Date.now();
    let hitOccurred = false;

    knives = knives.map(knife => {
        if (knife.isStuck) return knife;

        const elapsed = (currentTime - knife.thrownAt) / 1000;
        const startY = 250;
        const totalDistance = startY - targetRadius;
        const progress = Math.min(1, elapsed / TOTAL_FLIGHT_TIME);
        const easedProgress = progress * (2 - progress);
        const y = startY - (easedProgress * totalDistance);

        if (y <= targetRadius) {
            const targetRotationNow = (currentTime / 1000 * 120) % 360;
            const stickPointOnCircle = 90;
            const newStuckAngle = stickPointOnCircle - targetRotationNow;
            hitOccurred = true;
            return { ...knife, isStuck: true, stuckAngle: newStuckAngle };
        }
        return knife;
    }).filter(knife => currentTime - knife.thrownAt < 5000);

    if (hitOccurred) {
        self.postMessage({ type: 'HIT', hitTime: currentTime / 1000 });
    }

    self.postMessage({ type: 'UPDATE', payload: { knives: knives.map(k => ({...k, position: calculateKnifePosition(k)})) } });
};

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;
    console.log('[physics.worker] Received message:', type, payload);
    switch (type) {
        case 'INIT':
            targetRadius = payload.targetRadius;
            velocity = payload.velocity;
            rotationSpeed = payload.rotationSpeed;
            console.log('[physics.worker] Initialized with:', { targetRadius, velocity, rotationSpeed });
            setInterval(updatePhysics, 1000 / 60);
            break;
        case 'THROW':
            console.log('[physics.worker] Adding knife:', payload.knife);
            knives.push(payload.knife);
            break;
        case 'RESET':
            console.log('[physics.worker] Resetting knives');
            knives = [];
            break;
    }
};
