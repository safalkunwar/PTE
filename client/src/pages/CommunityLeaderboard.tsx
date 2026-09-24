import { Trophy, Users, Flame, Clock, Award, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_LEADERBOARD, calculateCommunityAverages } from "@shared/communityStats";

export default function CommunityLeaderboard() {
  const averages = calculateCommunityAverages(MOCK_LEADERBOARD);

  return (
    <div className="container max-w-5xl py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            PTE Community Leaderboard & Study Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare study streaks, practice hours, and predicted scores with global PTE aspirants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> Active Aspirants: 10,482
          </Badge>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border shadow-sm rounded-2xl bg-gradient-to-br from-amber-500/5 to-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Top Predicted Score</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">84 / 90</h3>
              <p className="text-[11px] text-green-600 font-semibold mt-0.5">Verified PTE 79+ Band</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-2xl bg-gradient-to-br from-primary/5 to-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Practice Hours</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{averages.avgHours} hrs</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Per top candidate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-2xl bg-gradient-to-br from-orange-500/5 to-card sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Study Streak</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{averages.avgStreak} Days</h3>
              <p className="text-[11px] text-orange-600 font-semibold mt-0.5">Consistent daily practice</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Global Leaderboard Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {MOCK_LEADERBOARD.map((user) => (
            <div key={user.rank} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  user.rank === 1 ? "bg-amber-100 text-amber-700 border border-amber-300" :
                  user.rank === 2 ? "bg-slate-100 text-slate-700 border border-slate-300" :
                  user.rank === 3 ? "bg-amber-50 text-amber-800 border border-amber-200" :
                  "bg-muted text-muted-foreground"
                }`}>
                  #{user.rank}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    {user.name}
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
                      {user.badge}
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: {user.targetScore}+ • Streak: {user.streakDays} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">Practice Hours</p>
                  <p className="text-sm font-bold text-foreground">{user.practiceHours}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Predicted Score</p>
                  <p className="text-lg font-extrabold text-primary">{user.predictedScore}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
