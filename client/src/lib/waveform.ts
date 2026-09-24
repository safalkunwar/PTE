export const WAVEFORM_BAR_COUNT = 32;

export function normalizeWaveformBar(value: number): number {
  if (!Number.isFinite(value)) return 2;
  return Math.max(2, Math.min(48, Math.round(value)));
}

export function waveformBarOpacity(active: boolean, height: number): number {
  if (!active) return 1;
  return 0.7 + (normalizeWaveformBar(height) / 48) * 0.3;
}
