export interface LeaderboardUser {
  rank: number;
  name: string;
  targetScore: number;
  predictedScore: number;
  practiceHours: number;
  streakDays: number;
  badge: string;
}

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Alex Mercer", targetScore: 79, predictedScore: 84, practiceHours: 48.5, streakDays: 28, badge: "PTE 79+ Achiever" },
  { rank: 2, name: "Priya Sharma", targetScore: 79, predictedScore: 82, practiceHours: 42.0, streakDays: 21, badge: "Speaking Pro" },
  { rank: 3, name: "Safal Kunwar", targetScore: 65, predictedScore: 76, practiceHours: 35.5, streakDays: 14, badge: "Rising Star" },
  { rank: 4, name: "David Kim", targetScore: 79, predictedScore: 78, practiceHours: 39.0, streakDays: 19, badge: "Mock Test Master" },
  { rank: 5, name: "Elena Rostova", targetScore: 65, predictedScore: 72, practiceHours: 28.0, streakDays: 12, badge: "Vocabulary Guru" },
];

export function calculateCommunityAverages(users: LeaderboardUser[]) {
  if (users.length === 0) return { avgHours: 0, avgStreak: 0 };
  const totalHours = users.reduce((acc, u) => acc + u.practiceHours, 0);
  const totalStreak = users.reduce((acc, u) => acc + u.streakDays, 0);
  return {
    avgHours: Number((totalHours / users.length).toFixed(1)),
    avgStreak: Math.round(totalStreak / users.length),
  };
}
