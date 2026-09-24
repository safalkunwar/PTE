export const NO_SPEECH_CUTOFF_MS = 3_000;
export const VOICE_ACTIVITY_RMS_THRESHOLD = 0.015;

export function getWaveformRms(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  const sumSquares = samples.reduce((sum, sample) => {
    const centered = (sample - 128) / 128;
    return sum + centered * centered;
  }, 0);
  return Math.sqrt(sumSquares / samples.length);
}

export function hasDetectedVoice(samples: Uint8Array, threshold = VOICE_ACTIVITY_RMS_THRESHOLD): boolean {
  return getWaveformRms(samples) >= threshold;
}

export function shouldStopForNoSpeech(elapsedMs: number, speechDetected: boolean): boolean {
  return !speechDetected && elapsedMs >= NO_SPEECH_CUTOFF_MS;
}
