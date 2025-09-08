(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/renderer/hooks/physics.worker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/renderer/hooks/physics.worker.ts
__turbopack_context__.s([]);
let knives = [];
let targetRadius = 0;
let velocity = 400;
let rotationSpeed = 540;
// Active notes for timing judgment (will be set from main thread)
let activeNotes = [];
let currentGameTime = 0; // Current game time from audio service (milliseconds)
const KNIFE_TIP_OFFSET = 32;
const STICK_DEPTH = 10;
const FLYING_ROTATION_DEG = 0;
const STUCK_ROTATION_OFFSET = -90;
const TOTAL_FLIGHT_TIME = 0.30;
// Judgment timing windows (in milliseconds) - can be updated dynamically
let JUDGMENT_WINDOWS = {
    KOOL: 50,
    COOL: 100,
    GOOD: 150,
    MISS: 200 // ±200ms = Miss (beyond this is automatic miss)
};
// Calculate what judgment should be given based on timing error
const getJudgment = (timingError)=>{
    const absError = Math.abs(timingError);
    if (absError <= JUDGMENT_WINDOWS.KOOL) return 'KOOL';
    if (absError <= JUDGMENT_WINDOWS.COOL) return 'COOL';
    if (absError <= JUDGMENT_WINDOWS.GOOD) return 'GOOD';
    return 'MISS';
};
// Find the closest note to current time for judgment
const findClosestNote = (gameTimeMs)=>{
    if (activeNotes.length === 0) return null;
    let closestNote = null;
    let smallestError = Infinity;
    for (const note of activeNotes){
        const timingError = gameTimeMs - note.time;
        const absError = Math.abs(timingError);
        // Only consider notes within miss window
        if (absError <= JUDGMENT_WINDOWS.MISS && absError < smallestError) {
            smallestError = absError;
            closestNote = {
                note,
                timingError
            };
        }
    }
    return closestNote;
};
const calculateKnifePosition = (knife)=>{
    const currentTime = Date.now();
    const elapsed = (currentTime - knife.thrownAt) / 1000;
    if (knife.isStuck) {
        const targetRotation = currentTime / 1000 * 120 % 360;
        const finalAngle = targetRotation + knife.stuckAngle;
        const angleRad = finalAngle * Math.PI / 180;
        const effectiveRadius = targetRadius + KNIFE_TIP_OFFSET - STICK_DEPTH;
        const x = Math.cos(angleRad) * effectiveRadius;
        const y = Math.sin(angleRad) * effectiveRadius;
        const rotation = finalAngle + STUCK_ROTATION_OFFSET;
        return {
            x,
            y,
            rotation
        };
    } else {
        const startY = 250;
        const y = startY - elapsed * velocity;
        const x = 0;
        const rotation = FLYING_ROTATION_DEG;
        return {
            x,
            y,
            rotation
        };
    }
};
const updatePhysics = ()=>{
    const currentTime = Date.now();
    let hitOccurred = false;
    let hitDetails = null;
    knives = knives.map((knife)=>{
        if (knife.isStuck) return knife;
        const elapsed = (currentTime - knife.thrownAt) / 1000;
        const startY = 250;
        const totalDistance = startY - targetRadius;
        const progress = Math.min(1, elapsed / TOTAL_FLIGHT_TIME);
        const easedProgress = progress * (2 - progress);
        const y = startY - easedProgress * totalDistance;
        // Check if knife hits target
        if (y <= targetRadius) {
            const targetRotationNow = currentTime / 1000 * 120 % 360;
            const stickPointOnCircle = 90;
            const newStuckAngle = stickPointOnCircle - targetRotationNow;
            // Calculate judgment based on timing using game time instead of system time
            const closestNoteData = findClosestNote(currentGameTime);
            if (closestNoteData) {
                const judgment = getJudgment(closestNoteData.timingError);
                hitDetails = {
                    hitTime: currentGameTime / 1000,
                    timingError: closestNoteData.timingError,
                    judgment,
                    noteId: closestNoteData.note.noteId,
                    accuracy: Math.max(0, 100 - Math.abs(closestNoteData.timingError) / JUDGMENT_WINDOWS.MISS * 100)
                };
                console.log("[physics.worker] Hit judgment: ".concat(judgment, ", timing error: ").concat(closestNoteData.timingError, "ms, game time: ").concat(currentGameTime, "ms, accuracy: ").concat(hitDetails.accuracy.toFixed(1), "%"));
            } else {
                // No note to hit - still register as miss
                hitDetails = {
                    hitTime: currentGameTime / 1000,
                    timingError: 999,
                    judgment: 'MISS',
                    noteId: null,
                    accuracy: 0
                };
                console.log('[physics.worker] Hit but no note available - MISS, game time:', currentGameTime);
            }
            hitOccurred = true;
            return {
                ...knife,
                isStuck: true,
                stuckAngle: newStuckAngle
            };
        }
        return knife;
    }).filter((knife)=>currentTime - knife.thrownAt < 5000);
    if (hitOccurred && hitDetails) {
        self.postMessage({
            type: 'HIT',
            payload: hitDetails
        });
    }
    // Update knife positions
    const updatedKnives = knives.map((k)=>({
            ...k,
            position: calculateKnifePosition(k)
        }));
    self.postMessage({
        type: 'UPDATE',
        payload: {
            knives: updatedKnives
        }
    });
};
self.onmessage = (e)=>{
    const { type, payload } = e.data;
    console.log('[physics.worker] Received message:', type, payload);
    switch(type){
        case 'INIT':
            targetRadius = payload.targetRadius;
            velocity = payload.velocity;
            rotationSpeed = payload.rotationSpeed;
            console.log('[physics.worker] Initialized with:', {
                targetRadius,
                velocity,
                rotationSpeed
            });
            setInterval(updatePhysics, 1000 / 60);
            break;
        case 'THROW':
            console.log('[physics.worker] Adding knife:', payload.knife);
            knives.push(payload.knife);
            break;
        case 'SET_NOTES':
            console.log('[physics.worker] Setting active notes:', payload.notes.length);
            activeNotes = payload.notes.map((note, index)=>({
                    time: note.time,
                    noteId: "note-".concat(index, "-").concat(note.time)
                }));
            break;
        case 'SET_JUDGMENT_WINDOWS':
            console.log('[physics.worker] Setting judgment windows:', payload.windows);
            JUDGMENT_WINDOWS = {
                ...payload.windows
            };
            break;
        case 'UPDATE_GAME_TIME':
            currentGameTime = payload.gameTime;
            break;
        case 'RESET':
            console.log('[physics.worker] Resetting knives and notes');
            knives = [];
            activeNotes = [];
            currentGameTime = 0;
            break;
    }
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_renderer_hooks_physics_worker_ts_a1b3ec4e._.js.map