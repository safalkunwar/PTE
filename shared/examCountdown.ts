export function calculateDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getRecommendedDailyMinutes(daysRemaining: number, targetScore: number): number {
  if (daysRemaining <= 7) return 90;
  if (targetScore >= 79) return 60;
  return 45;
}
