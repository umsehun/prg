"use strict";
// src/shared/timing.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.preemptFromAR = preemptFromAR;
exports.windowsFromOD = windowsFromOD;
// AR -> preempt (ms)
function preemptFromAR(AR) {
    if (AR <= 5)
        return 1800 - 120 * AR;
    return 1200 - 150 * (AR - 5);
}
// OD -> hit windows (ms)
function windowsFromOD(OD) {
    const w300 = 80 - 6 * OD;
    const w100 = 140 - 8 * OD;
    const w50 = 200 - 10 * OD;
    return { w300, w100, w50 };
}
