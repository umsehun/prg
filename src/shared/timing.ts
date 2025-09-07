// src/shared/timing.ts

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
