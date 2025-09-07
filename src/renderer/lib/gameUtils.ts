// src/renderer/lib/gameUtils.ts

import { JudgmentCounts } from '../../shared/types';

/**
 * Calculates the accuracy based on judgment counts.
 * Perfects are worth 100%, Greats are worth 50%.
 * @param judgments - An object containing the counts of each judgment type.
 * @returns The calculated accuracy as a percentage (0-100).
 */
export const calculateAccuracy = (judgments: JudgmentCounts): number => {
  const totalNotes =
    judgments.KOOL + judgments.COOL + judgments.GOOD + judgments.MISS;
  if (totalNotes === 0) {
    return 0;
  }

  const weightedScore =
    judgments.KOOL * 1 + judgments.COOL * 0.5 + judgments.GOOD * 0.25;
  const accuracy = (weightedScore / totalNotes) * 100;

  return parseFloat(accuracy.toFixed(2)); // Return with 2 decimal places
};

/**
 * Determines the rank based on the accuracy score.
 * @param accuracy - The accuracy percentage.
 * @returns A string representing the rank (e.g., 'S', 'A', 'B').
 */
export const getRank = (accuracy: number): string => {
  if (accuracy >= 98) return 'S';
  if (accuracy >= 95) return 'A';
  if (accuracy >= 90) return 'B';
  if (accuracy >= 80) return 'C';
  return 'D';
};

// ------------------------------
// osu!-style timing utilities
// ------------------------------

// Clamp a value between [a, b]
export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

// Linear interpolation
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// AR -> preempt (ms)
export function preemptFromAR(AR: number) {
  if (AR <= 5) return 1800 - 120 * AR;
  return 1200 - 150 * (AR - 5);
}

// OD -> hit windows (ms)
export function windowsFromOD(OD: number) {
  const w300 = 80 - 6 * OD;
  const w100 = 140 - 8 * OD;
  const w50 = 200 - 10 * OD;
  return { w300, w100, w50 };
}

// Approach ring scale for current frame
export function approachScale(
  nowMs: number,
  hitTimeMs: number,
  preemptMs: number,
  startScale = 2.0
) {
  const t = clamp(1 - (hitTimeMs - nowMs) / preemptMs, 0, 1);
  return lerp(startScale, 1.0, t);
}

// Hit circle alpha (fade-in over first 40% of preempt)
export function hitAlpha(nowMs: number, spawnTimeMs: number, preemptMs: number) {
  const fadeIn = preemptMs * 0.4;
  const x = clamp((nowMs - spawnTimeMs) / fadeIn, 0, 1);
  // smoothstep
  return x * x * (3 - 2 * x);
}
